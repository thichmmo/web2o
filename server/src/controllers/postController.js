const fs = require('fs');
const db = require('../models');
const videoService = require('../services/videoService');
const facebookService = require('../services/facebookService');
const permissionService = require('../services/permissionService');
const { findOwnedAdAccount } = require('../services/facebookAccountSyncService');

const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (error) {
    return false;
  }
};

const toPublicUploadPath = (file) => {
  if (!file) return null;
  const normalized = file.path.replace(/\\/g, '/');
  const marker = '/uploads/';
  const index = normalized.lastIndexOf(marker);
  return index >= 0 ? normalized.substring(index) : normalized;
};

const detectMediaType = (file, fallbackUrl) => {
  if (file?.mimetype?.startsWith('image/')) return 'image';
  if (file?.mimetype?.startsWith('video/')) return 'video';
  if (fallbackUrl && /\.(mp4|mov|avi|webm|ogg)$/i.test(fallbackUrl)) return 'video';
  return 'image';
};

const getFileForField = (files, ...names) => {
  for (const name of names) {
    if (files?.[name]?.[0]) return files[name][0];
  }
  return null;
};

const cleanupUploadedFiles = (files = {}) => {
  Object.values(files).flat().forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

const validateMediaAgainstSettings = (file, card, label) => {
  if (!file) return null;
  const mediaType = detectMediaType(file);
  const allowed = card?.allowedMediaTypes || ['image', 'video'];
  if (!allowed.includes(mediaType)) {
    return `${label} media type is not allowed`;
  }
  const maxBytes = Number(card?.maxFileSizeMb || 500) * 1024 * 1024;
  if (file.size > maxBytes) {
    return `${label} exceeds ${card.maxFileSizeMb}MB limit`;
  }
  return null;
};

const getPostCards = (post) => [
  {
    mediaPath: post.video1Path,
    mediaType: post.card1MediaType || 'image',
    title: post.card1Title,
    description: post.card1Description,
    linkUrl: post.card1LinkUrl,
  },
  {
    mediaPath: post.video2Path,
    mediaType: post.card2MediaType || 'image',
    title: post.card2Title,
    description: post.card2Description,
    linkUrl: post.card2LinkUrl,
  },
];

const buildPostPayload = async (req, existingPost = null) => {
  const cards = await permissionService.getCardSettings();
  const card1 = cards.find((card) => card.cardIndex === 1);
  const card2 = cards.find((card) => card.cardIndex === 2);
  const card1Access = await permissionService.canUseCard(req.user.id, 1);
  const card2Permission = await permissionService.canEditCard2(req.user.id);

  if (!card1Access.allowed) {
    return { error: card1Access.reason, card1Access, card2Permission };
  }

  const card1Media = getFileForField(req.files, 'card1Media', 'video1');
  const card2Media = getFileForField(req.files, 'card2Media', 'video2');

  if (!existingPost && !card1Media) {
    return { error: 'Card 1 media is required' };
  }

  const card1MediaError = validateMediaAgainstSettings(card1Media, card1, 'Card 1');
  if (card1MediaError) return { error: card1MediaError };

  const card2MediaError = validateMediaAgainstSettings(card2Media, card2, 'Card 2');
  if (card2MediaError) return { error: card2MediaError };

  if (!isValidUrl(req.body.card1LinkUrl)) return { error: 'Card 1 link URL is invalid' };
  if (!isValidUrl(req.body.card2LinkUrl)) return { error: 'Card 2 link URL is invalid' };

  const hasCard2Payload = Boolean(
    card2Media ||
    req.body.card2Title ||
    req.body.card2Description ||
    req.body.card2LinkUrl
  );

  const payload = {
    caption: req.body.caption,
    video1Path: card1Media ? toPublicUploadPath(card1Media) : existingPost?.video1Path,
    card1MediaType: card1Media ? detectMediaType(card1Media) : existingPost?.card1MediaType,
    card1Title: req.body.card1Title ?? existingPost?.card1Title ?? '',
    card1Description: req.body.card1Description ?? existingPost?.card1Description ?? '',
    card1LinkUrl: req.body.card1LinkUrl ?? existingPost?.card1LinkUrl ?? '',
  };

  if (card2Permission.allowed) {
    payload.video2Path = card2Media
      ? toPublicUploadPath(card2Media)
      : req.body.card2MediaUrl || existingPost?.video2Path || card2?.defaultMediaUrl || payload.video1Path;
    payload.card2MediaType = card2Media
      ? detectMediaType(card2Media)
      : detectMediaType(null, payload.video2Path);
    payload.card2Title = req.body.card2Title ?? existingPost?.card2Title ?? card2?.defaultTitle ?? '';
    payload.card2Description = req.body.card2Description ?? existingPost?.card2Description ?? card2?.defaultDescription ?? '';
    payload.card2LinkUrl = req.body.card2LinkUrl ?? existingPost?.card2LinkUrl ?? card2?.defaultLinkUrl ?? '';
    payload.card2ManagedByAdmin = false;
  } else {
    payload.video2Path = card2?.defaultMediaUrl || existingPost?.video2Path || payload.video1Path;
    payload.card2MediaType = detectMediaType(null, payload.video2Path);
    payload.card2Title = card2?.defaultTitle || '';
    payload.card2Description = card2?.defaultDescription || '';
    payload.card2LinkUrl = card2?.defaultLinkUrl || '';
    payload.card2ManagedByAdmin = true;
  }

  return {
    payload,
    card2Ignored: hasCard2Payload && !card2Permission.allowed,
    card2Permission,
  };
};

const createPost = async (req, res) => {
  try {
    const { fbAccountId, targetType, targetId, caption, scheduledAt, publishNow, adAccountId } = req.body;

    if (!fbAccountId || !targetType || !targetId) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Facebook account, target type, and target ID are required',
      });
    }

    if (!caption || !caption.trim()) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Caption is required',
      });
    }

    if (!['profile', 'page', 'group'].includes(targetType)) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Invalid target type. Must be profile, page, or group',
      });
    }

    const fbAccount = await db.FacebookAccount.findOne({
      where: {
        id: fbAccountId,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!fbAccount) {
      cleanupUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: 'Facebook account not found',
      });
    }

    let normalizedAdAccountId = null;
    if (targetType === 'page') {
      if (!adAccountId) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          message: 'Ad account is required for page carousel publishing',
        });
      }

      let adAccount;
      try {
        adAccount = await findOwnedAdAccount(req.user.id, fbAccount, adAccountId);
      } catch (adAccountError) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          message: adAccountError.message || 'Failed to validate selected ad account',
        });
      }

      if (!adAccount) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          message: 'Selected ad account is not available for this Facebook account',
        });
      }
      normalizedAdAccountId = adAccount.adAccountId;
    }

    const cardData = await buildPostPayload(req);
    if (cardData.error) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ success: false, message: cardData.error });
    }

    const isScheduled = Boolean(scheduledAt);
    const post = await db.Post.create({
      userId: req.user.id,
      fbAccountId,
      targetType,
      targetId,
      adAccountId: normalizedAdAccountId,
      scheduledAt: scheduledAt || null,
      status: isScheduled ? 'scheduled' : 'draft',
      ...cardData.payload,
    });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: isScheduled ? 'schedule_post' : 'create_post',
      resource: 'post',
      resourceId: post.id,
      details: { card2Ignored: cardData.card2Ignored },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    if (String(publishNow) === 'true') {
      req.params.postId = post.id;
      return publishPost(req, res);
    }

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post,
        card2Ignored: cardData.card2Ignored,
        card2Permission: {
          allowed: cardData.card2Permission.allowed,
          reason: cardData.card2Permission.reason,
        },
      },
    });
  } catch (error) {
    cleanupUploadedFiles(req.files);
    console.error('Create post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create post',
    });
  }
};

const publishPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await db.Post.findOne({
      where: {
        id: postId,
        userId: req.user.id,
      },
      include: [
        {
          model: db.FacebookAccount,
          as: 'facebookAccount',
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Post already published',
      });
    }

    if (!post.facebookAccount || !post.facebookAccount.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Facebook account is not active',
      });
    }

    let adAccount = null;
    if (post.targetType === 'page') {
      if (!post.adAccountId) {
        const message = 'Ad account is required for page carousel publishing';
        await post.update({ status: 'failed', errorMessage: message });
        return res.status(400).json({
          success: false,
          message,
        });
      }

      try {
        adAccount = await findOwnedAdAccount(req.user.id, post.facebookAccount, post.adAccountId);
      } catch (adAccountError) {
        const message = adAccountError.message || 'Failed to validate selected ad account';
        await post.update({ status: 'failed', errorMessage: message });
        return res.status(400).json({
          success: false,
          message,
        });
      }

      if (!adAccount) {
        const message = 'Selected ad account is not available for this Facebook account';
        await post.update({ status: 'failed', errorMessage: message });
        return res.status(400).json({
          success: false,
          message,
        });
      }
    }

    await post.update({ status: 'publishing' });

    try {
      const result = await facebookService.publishCarouselPost({
        accessToken: post.facebookAccount.accessToken,
        targetType: post.targetType,
        targetId: post.targetId,
        adAccountId: adAccount?.adAccountId || post.adAccountId,
        cards: getPostCards(post),
        caption: post.caption,
      });

      await post.update({
        status: 'published',
        publishedAt: new Date(),
        fbPostId: result.id,
        fbPostUrl: result.permalinkUrl || post.fbPostUrl,
        facebookCreativeId: result.creativeId || post.facebookCreativeId,
        errorMessage: null,
      });

      await db.ActivityLog.create({
        userId: req.user.id,
        action: 'publish_post',
        resource: 'post',
        resourceId: post.id,
        details: { fbPostId: result.id, fbPostUrl: result.permalinkUrl || null, facebookCreativeId: result.creativeId || null },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const safePost = post.toJSON();
      if (safePost.facebookAccount) {
        delete safePost.facebookAccount.accessToken;
      }

      return res.status(200).json({
        success: true,
        message: 'Post published successfully',
        data: {
          post: safePost,
          fbPostId: result.id,
          fbPostUrl: result.permalinkUrl || safePost.fbPostUrl || null,
        },
      });
    } catch (publishError) {
      await post.update({
        status: 'failed',
        errorMessage: publishError.message,
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to publish post to Facebook',
        error: publishError.message,
      });
    }
  } catch (error) {
    console.error('Publish post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish post',
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: posts } = await db.Post.findAndCountAll({
      where,
      include: [
        {
          model: db.FacebookAccount,
          as: 'facebookAccount',
          attributes: ['id', 'fbUserId', 'fbUserName', 'isActive'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get posts',
    });
  }
};

const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await db.Post.findOne({
      where: {
        id: postId,
        userId: req.user.id,
      },
      include: [
        {
          model: db.FacebookAccount,
          as: 'facebookAccount',
          attributes: ['id', 'fbUserId', 'fbUserName', 'isActive'],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get post',
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await db.Post.findOne({
      where: { id: postId, userId: req.user.id },
      include: [
        {
          model: db.FacebookAccount,
          as: 'facebookAccount',
        },
      ],
    });

    if (!post) {
      cleanupUploadedFiles(req.files);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.status !== 'draft' && post.status !== 'scheduled') {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ success: false, message: 'Only draft or scheduled posts can be edited' });
    }

    const cardData = await buildPostPayload(req, post);
    if (cardData.error) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ success: false, message: cardData.error });
    }

    const nextTargetType = req.body.targetType || post.targetType;
    const nextAdAccountId = req.body.adAccountId !== undefined ? req.body.adAccountId : post.adAccountId;
    let normalizedAdAccountId = nextTargetType === 'page' ? nextAdAccountId : null;

    if (nextTargetType === 'page') {
      if (!normalizedAdAccountId) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          message: 'Ad account is required for page carousel publishing',
        });
      }

      let adAccount;
      try {
        adAccount = await findOwnedAdAccount(req.user.id, post.facebookAccount, normalizedAdAccountId);
      } catch (adAccountError) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          message: adAccountError.message || 'Failed to validate selected ad account',
        });
      }

      if (!adAccount) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          message: 'Selected ad account is not available for this Facebook account',
        });
      }
      normalizedAdAccountId = adAccount.adAccountId;
    }

    await post.update({
      targetType: nextTargetType,
      targetId: req.body.targetId || post.targetId,
      adAccountId: normalizedAdAccountId,
      scheduledAt: req.body.scheduledAt !== undefined ? req.body.scheduledAt || null : post.scheduledAt,
      status: req.body.scheduledAt ? 'scheduled' : post.status,
      ...cardData.payload,
    });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'update_post',
      resource: 'post',
      resourceId: post.id,
      details: { card2Ignored: cardData.card2Ignored },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const safePost = post.toJSON();
    if (safePost.facebookAccount) {
      delete safePost.facebookAccount.accessToken;
    }

    return res.json({ success: true, message: 'Post updated successfully', data: { post: safePost } });
  } catch (error) {
    cleanupUploadedFiles(req.files);
    console.error('Update post error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update post' });
  }
};

const retryPost = async (req, res) => {
  try {
    const post = await db.Post.findOne({
      where: { id: req.params.postId, userId: req.user.id },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.status !== 'failed') {
      return res.status(400).json({ success: false, message: 'Only failed posts can be retried' });
    }

    await post.update({ status: 'draft', errorMessage: null });
    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'retry_post',
      resource: 'post',
      resourceId: post.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.json({ success: true, message: 'Post is ready to publish again', data: { post } });
  } catch (error) {
    console.error('Retry post error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retry post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await db.Post.findOne({
      where: {
        id: postId,
        userId: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.status === 'publishing') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete post while publishing',
      });
    }

    videoService.deleteFiles([post.video1Path, post.video2Path]);
    await post.destroy();

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'delete_post',
      resource: 'post',
      resourceId: postId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post',
    });
  }
};

module.exports = {
  createPost,
  publishPost,
  getPosts,
  getPost,
  updatePost,
  retryPost,
  deletePost,
};
