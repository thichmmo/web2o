const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const config = require('../config/env');

const sanitizeFacebookMessage = (message) => String(message || 'Facebook request failed')
  .replace(/access_token=([^&\s]+)/gi, 'access_token=[redacted]')
  .replace(/EAA[A-Za-z0-9_-]{20,}/g, '[redacted_token]');

const getFacebookMessage = (error) => {
  const fbError = error.response?.data?.error;
  const parts = [
    fbError?.message || error.message,
    fbError?.error_user_title,
    fbError?.error_user_msg,
  ].filter(Boolean);
  return sanitizeFacebookMessage(parts.join(': '));
};

const logFacebookError = (label, error) => {
  const fbError = error.response?.data?.error;
  console.error(label, {
    status: error.response?.status,
    code: fbError?.code,
    subcode: fbError?.error_subcode,
    type: fbError?.type,
    message: getFacebookMessage(error),
    errorData: fbError?.error_data,
    fbtraceId: fbError?.fbtrace_id,
  });
};

const isDevAccessToken = (accessToken) => {
  const token = String(accessToken || '');
  return token.startsWith('dev_mock_') || token.startsWith('dev_token_');
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class FacebookService {
  constructor() {
    this.graphApiUrl = `https://graph.facebook.com/${config.facebook.graphVersion}`;
  }

  hasLiveCredentials() {
    return Boolean(config.facebook.appId && config.facebook.appSecret);
  }

  assertLiveCredentials() {
    if (!this.hasLiveCredentials()) {
      throw new Error('Facebook credentials are not configured');
    }
  }

  async exchangeCodeForToken(code, redirectUri) {
    try {
      this.assertLiveCredentials();
      const response = await axios.get(`${this.graphApiUrl}/oauth/access_token`, {
        params: {
          client_id: config.facebook.appId,
          client_secret: config.facebook.appSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      return response.data;
    } catch (error) {
      logFacebookError('Token exchange error', error);
      throw new Error('Failed to exchange code for token');
    }
  }

  async getLongLivedToken(shortLivedToken) {
    try {
      this.assertLiveCredentials();
      const response = await axios.get(`${this.graphApiUrl}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: config.facebook.appId,
          client_secret: config.facebook.appSecret,
          fb_exchange_token: shortLivedToken,
        },
      });

      return response.data;
    } catch (error) {
      logFacebookError('Long-lived token error', error);
      throw new Error('Failed to get long-lived token');
    }
  }

  async getUserProfile(accessToken) {
    try {
      if (isDevAccessToken(accessToken)) {
        const suffix = String(accessToken).split('_').slice(-1)[0] || 'manual';
        return {
          id: `manual-${suffix}`,
          name: 'Manual Token Dev Facebook',
          email: null,
        };
      }

      const response = await axios.get(`${this.graphApiUrl}/me`, {
        params: {
          fields: 'id,name,email',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      logFacebookError('Get user profile error', error);
      throw new Error('Failed to get user profile');
    }
  }

  async getUserPages(accessToken) {
    try {
      if (isDevAccessToken(accessToken)) {
        return [
          { id: 'mock-page-1', name: 'Dev Mock Page' },
        ];
      }
      const response = await axios.get(`${this.graphApiUrl}/me/accounts`, {
        params: {
          fields: 'id,name,access_token',
          access_token: accessToken,
        },
      });

      return (response.data.data || []).map(({ access_token, ...page }) => page);
    } catch (error) {
      logFacebookError('Get user pages error', error);
      throw new Error('Failed to get user pages');
    }
  }

  async getUserAdAccounts(accessToken) {
    try {
      if (isDevAccessToken(accessToken)) {
        return [
          {
            id: 'act_dev_mock_1',
            account_id: 'dev_mock_1',
            name: 'Dev Mock Ad Account',
            account_status: 'ACTIVE',
            currency: 'USD',
            timezone_name: 'Etc/UTC',
          },
        ];
      }

      const response = await axios.get(`${this.graphApiUrl}/me/adaccounts`, {
        params: {
          fields: 'id,account_id,name,account_status,currency,timezone_name',
          access_token: accessToken,
        },
      });

      return (response.data.data || []).map((account) => ({
        ...account,
        id: this.normalizeAdAccountId(account.id || account.account_id),
        name: account.name || account.id || account.account_id,
      }));
    } catch (error) {
      logFacebookError('Get user ad accounts error', error);
      throw new Error(`Failed to get Facebook ad accounts: ${getFacebookMessage(error)}`);
    }
  }

  async getUserGroups(accessToken) {
    try {
      if (isDevAccessToken(accessToken)) {
        return [
          { id: 'mock-group-1', name: 'Dev Mock Group', administrator: true },
        ];
      }
      const response = await axios.get(`${this.graphApiUrl}/me/groups`, {
        params: {
          fields: 'id,name,administrator',
          access_token: accessToken,
        },
      });

      return response.data.data || [];
    } catch (error) {
      logFacebookError('Get user groups error', error);
      throw new Error('Failed to get user groups');
    }
  }

  normalizeAdAccountId(adAccountId) {
    if (!adAccountId) return '';
    const value = String(adAccountId).trim();
    return value.startsWith('act_') ? value : `act_${value}`;
  }

  async getPageAccessToken(accessToken, pageId) {
    try {
      if (isDevAccessToken(accessToken)) {
        return accessToken;
      }

      const pagesResponse = await axios.get(`${this.graphApiUrl}/me/accounts`, {
        params: {
          fields: 'id,name,access_token',
          access_token: accessToken,
        },
      });

      const page = (pagesResponse.data.data || []).find((item) => String(item.id) === String(pageId));
      if (page?.access_token) {
        return page.access_token;
      }

      const profileResponse = await axios.get(`${this.graphApiUrl}/me`, {
        params: {
          fields: 'id,name',
          access_token: accessToken,
        },
      });

      if (String(profileResponse.data?.id) === String(pageId)) {
        return accessToken;
      }

      throw new Error('Selected page is not available for this Facebook account');
    } catch (error) {
      if (error.response) {
        logFacebookError('Get page access token error', error);
        throw new Error(`Failed to validate selected page: ${getFacebookMessage(error)}`);
      }
      throw error;
    }
  }

  resolveMediaPath(mediaPath) {
    if (!mediaPath) {
      throw new Error('Post media is missing');
    }

    if (/^https?:\/\//i.test(mediaPath)) {
      return { url: mediaPath };
    }

    const publicUploadPath = String(mediaPath).startsWith('/uploads/');
    const relativePath = String(mediaPath).replace(/^\/+/, '');
    const absolutePath = !publicUploadPath && path.isAbsolute(mediaPath)
      ? mediaPath
      : path.resolve(__dirname, '../../', relativePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Post media file is not available: ${path.basename(mediaPath)}`);
    }

    return { path: absolutePath };
  }

  async uploadAdImage(accessToken, adAccountId, card) {
    const media = this.resolveMediaPath(card.mediaPath);
    if (media.url) {
      const response = await axios.post(
        `${this.graphApiUrl}/${adAccountId}/adimages`,
        {
          url: media.url,
        },
        {
          params: { access_token: accessToken },
        }
      );
      const image = Object.values(response.data.images || {})[0];
      if (!image?.hash) throw new Error('Facebook did not return an image hash');
      return { type: 'image', hash: image.hash };
    }

    const form = new FormData();
    form.append('access_token', accessToken);
    form.append('filename', fs.createReadStream(media.path));

    const response = await axios.post(
      `${this.graphApiUrl}/${adAccountId}/adimages`,
      form,
      { headers: form.getHeaders() }
    );
    const image = Object.values(response.data.images || {})[0];
    if (!image?.hash) throw new Error('Facebook did not return an image hash');
    return { type: 'image', hash: image.hash };
  }

  async uploadAdVideo(accessToken, adAccountId, card) {
    const media = this.resolveMediaPath(card.mediaPath);
    if (media.url) {
      const response = await axios.post(
        `${this.graphApiUrl}/${adAccountId}/advideos`,
        {
          file_url: media.url,
          title: card.title || 'Carousel video',
        },
        {
          params: { access_token: accessToken },
        }
      );
      if (!response.data.id) throw new Error('Facebook did not return a video ID');
      return { type: 'video', id: response.data.id };
    }

    const form = new FormData();
    form.append('access_token', accessToken);
    form.append('source', fs.createReadStream(media.path));
    form.append('title', card.title || 'Carousel video');

    const response = await axios.post(
      `${this.graphApiUrl}/${adAccountId}/advideos`,
      form,
      { headers: form.getHeaders() }
    );
    if (!response.data.id) throw new Error('Facebook did not return a video ID');
    return { type: 'video', id: response.data.id };
  }

  buildChildAttachment(card, upload, targetId, options = {}) {
    const link = card.linkUrl || `https://www.facebook.com/${targetId}`;
    const attachment = {
      link,
      name: card.title || undefined,
      description: card.description || undefined,
      call_to_action: {
        type: 'LEARN_MORE',
        value: { link },
      },
    };

    if (upload.type === 'video') {
      attachment.video_id = upload.id;
      if (options.fallbackImageHash) {
        attachment.image_hash = options.fallbackImageHash;
      }
    } else {
      attachment.image_hash = upload.hash;
    }

    return Object.fromEntries(Object.entries(attachment).filter(([, value]) => value !== undefined));
  }

  async getCreativeStoryId(accessToken, creativeId, attempts = 10, delayMs = 1500) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const creativeDetail = await axios.get(`${this.graphApiUrl}/${creativeId}`, {
        params: {
          fields: 'effective_object_story_id,object_story_id',
          access_token: accessToken,
        },
      });
      const storyId = creativeDetail.data.effective_object_story_id || creativeDetail.data.object_story_id || null;
      if (storyId) return storyId;
      if (attempt < attempts - 1) {
        await sleep(delayMs);
      }
    }
    return null;
  }

  async publishPageStory(pageAccessToken, storyId) {
    if (!storyId) {
      throw new Error('Facebook did not return a page story ID');
    }

    await axios.post(
      `${this.graphApiUrl}/${storyId}`,
      { is_published: true },
      { params: { access_token: pageAccessToken } }
    );

    const response = await axios.get(`${this.graphApiUrl}/${storyId}`, {
      params: {
        fields: 'id,permalink_url,is_published,is_hidden',
        access_token: pageAccessToken,
      },
    });

    if (!response.data.is_published || response.data.is_hidden) {
      throw new Error('Facebook created the story but it is still hidden or unpublished');
    }

    if (!response.data.permalink_url) {
      throw new Error('Facebook published the story but did not return a permalink');
    }

    return response.data;
  }

  async publishCarouselPost({ accessToken, targetType, targetId, adAccountId, cards, caption }) {
    try {
      const normalizedAdAccountId = this.normalizeAdAccountId(adAccountId);
      if (isDevAccessToken(accessToken)) {
        const devId = `dev_mock_post_${Date.now()}`;
        return {
          id: devId,
          creativeId: targetType === 'page' ? `dev_mock_creative_${Date.now()}` : null,
          permalinkUrl: targetType === 'page' ? `https://facebook.test/posts/${devId}` : null,
          isPublished: true,
          isHidden: false,
          targetId,
          adAccountId: normalizedAdAccountId || null,
          mediaCount: cards.length,
          caption,
        };
      }

      if (targetType === 'page') {
        if (!normalizedAdAccountId) {
          throw new Error('Ad account is required to publish a page carousel');
        }

        const pageAccessToken = await this.getPageAccessToken(accessToken, targetId);

        const uploads = [];
        for (const card of cards) {
          if (card.mediaType === 'video') {
            uploads.push(await this.uploadAdVideo(accessToken, normalizedAdAccountId, card));
          } else {
            uploads.push(await this.uploadAdImage(accessToken, normalizedAdAccountId, card));
          }
        }

        const fallbackImageHash = uploads.find((upload) => upload.type === 'image' && upload.hash)?.hash;
        if (uploads.some((upload) => upload.type === 'video') && !fallbackImageHash) {
          throw new Error('A page carousel with video cards requires at least one image card to use as the Facebook thumbnail');
        }

        const childAttachments = cards.map((card, index) => (
          this.buildChildAttachment(card, uploads[index], targetId, { fallbackImageHash })
        ));
        const fallbackLink = cards.find((card) => card.linkUrl)?.linkUrl || `https://www.facebook.com/${targetId}`;
        const objectStorySpec = {
          page_id: targetId,
          link_data: Object.fromEntries(Object.entries({
            message: caption,
            link: fallbackLink,
            image_hash: fallbackImageHash,
            child_attachments: childAttachments,
            multi_share_optimized: false,
            multi_share_end_card: false,
          }).filter(([, value]) => value !== undefined)),
        };

        const creativeResponse = await axios.post(
          `${this.graphApiUrl}/${normalizedAdAccountId}/adcreatives`,
          {
            name: `Carousel post ${new Date().toISOString()}`,
            object_story_spec: JSON.stringify(objectStorySpec),
          },
          {
            params: { access_token: accessToken },
          }
        );

        const creativeId = creativeResponse.data.id;
        let storyId = creativeResponse.data.effective_object_story_id || creativeResponse.data.object_story_id || null;
        if (creativeId && !storyId) {
          storyId = await this.getCreativeStoryId(accessToken, creativeId);
        }

        const publishedStory = await this.publishPageStory(pageAccessToken, storyId);

        return {
          id: publishedStory.id,
          creativeId,
          permalinkUrl: publishedStory.permalink_url,
          isPublished: publishedStory.is_published,
          isHidden: publishedStory.is_hidden,
          targetId,
          adAccountId: normalizedAdAccountId,
          mediaCount: cards.length,
          caption,
        };
      }

      const carouselResponse = await axios.post(
        `${this.graphApiUrl}/${targetId}/feed`,
        {
          message: caption,
        },
        {
          params: { access_token: accessToken },
        }
      );

      return carouselResponse.data;
    } catch (error) {
      logFacebookError('Publish carousel error', error);
      throw new Error(`Failed to publish carousel post: ${getFacebookMessage(error)}`);
    }
  }

  async debugToken(accessToken) {
    try {
      this.assertLiveCredentials();
      const response = await axios.get(`${this.graphApiUrl}/debug_token`, {
        params: {
          input_token: accessToken,
          access_token: `${config.facebook.appId}|${config.facebook.appSecret}`,
        },
      });

      return response.data.data;
    } catch (error) {
      logFacebookError('Debug token error', error);
      throw new Error('Failed to debug token');
    }
  }
}

module.exports = new FacebookService();
