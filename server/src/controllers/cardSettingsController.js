const fs = require('fs');
const db = require('../models');

const isValidCardIndex = (cardIndex) => [1, 2].includes(Number(cardIndex));
const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) || value.startsWith('/uploads/');
  } catch (error) {
    return value.startsWith('/uploads/');
  }
};

const validatePayload = (payload) => {
  if (payload.allowedMediaTypes !== undefined) {
    if (!Array.isArray(payload.allowedMediaTypes) || payload.allowedMediaTypes.length === 0) {
      return 'Allowed media types must be a non-empty array';
    }
    const invalid = payload.allowedMediaTypes.find((type) => !['image', 'video'].includes(type));
    if (invalid) return 'Allowed media types can only contain image or video';
  }
  if (payload.maxFileSizeMb !== undefined && (Number(payload.maxFileSizeMb) < 1 || Number(payload.maxFileSizeMb) > 5000)) {
    return 'Max file size must be between 1 and 5000 MB';
  }
  if (payload.defaultMediaUrl && !isValidUrl(payload.defaultMediaUrl)) return 'Default media URL is invalid';
  if (payload.defaultLinkUrl && !isValidUrl(payload.defaultLinkUrl)) return 'Default link URL is invalid';
  return null;
};

const detectUploadedMediaType = (file) => {
  if (file?.mimetype?.startsWith('video/')) return 'video';
  if (file?.mimetype?.startsWith('image/')) return 'image';
  return null;
};

const cleanupUpload = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

// Get all card settings
exports.getCardSettings = async (req, res) => {
  try {
    const cardSettings = await db.CardSettings.findAll({
      order: [['cardIndex', 'ASC']],
    });

    // If no settings exist, create defaults for card 1 and 2
    if (cardSettings.length === 0) {
      const defaults = await Promise.all([
        db.CardSettings.create({ cardIndex: 1 }),
        db.CardSettings.create({ cardIndex: 2, isLockedForFree: true }),
      ]);
      return res.json({
        success: true,
        data: defaults,
      });
    }

    res.json({
      success: true,
      data: cardSettings,
    });
  } catch (error) {
    console.error('Get card settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get card settings',
      error: error.message,
    });
  }
};

// Get single card settings
exports.getCardSettingByIndex = async (req, res) => {
  try {
    const { cardIndex } = req.params;
    if (!isValidCardIndex(cardIndex)) {
      return res.status(400).json({ success: false, message: 'Invalid card index' });
    }

    const cardSettings = await db.CardSettings.findOne({
      where: { cardIndex: parseInt(cardIndex) },
    });

    if (!cardSettings) {
      // Create default if not exists
      const newSettings = await db.CardSettings.create({
        cardIndex: parseInt(cardIndex),
      });
      return res.json({
        success: true,
        data: newSettings,
      });
    }

    res.json({
      success: true,
      data: cardSettings,
    });
  } catch (error) {
    console.error('Get card setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get card setting',
      error: error.message,
    });
  }
};

// Update card settings
exports.updateCardSettings = async (req, res) => {
  try {
    const { cardIndex } = req.params;
    const {
      isEnabled,
      isLockedForFree,
      isLockedForPremium,
      allowedMediaTypes,
      maxFileSizeMb,
      defaultMediaUrl,
      defaultTitle,
      defaultDescription,
      defaultLinkUrl,
    } = req.body;
    if (!isValidCardIndex(cardIndex)) {
      return res.status(400).json({ success: false, message: 'Invalid card index' });
    }

    const validationError = validatePayload(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    let cardSettings = await db.CardSettings.findOne({
      where: { cardIndex: parseInt(cardIndex) },
    });

    if (!cardSettings) {
      // Create if not exists
      cardSettings = await db.CardSettings.create({
        cardIndex: parseInt(cardIndex),
        isEnabled,
        isLockedForFree,
        isLockedForPremium,
        allowedMediaTypes,
        maxFileSizeMb,
        defaultMediaUrl,
        defaultTitle,
        defaultDescription,
        defaultLinkUrl,
      });
    } else {
      // Update existing
      await cardSettings.update({
        isEnabled,
        isLockedForFree,
        isLockedForPremium,
        allowedMediaTypes,
        maxFileSizeMb,
        defaultMediaUrl,
        defaultTitle,
        defaultDescription,
        defaultLinkUrl,
      });
    }

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'update_card_settings',
      resource: 'card_settings',
      resourceId: String(cardIndex),
      details: { cardIndex: Number(cardIndex) },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Card settings updated successfully',
      data: cardSettings,
    });
  } catch (error) {
    console.error('Update card settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update card settings',
      error: error.message,
    });
  }
};

// Reset card settings to default
exports.resetCardSettings = async (req, res) => {
  try {
    const { cardIndex } = req.params;
    if (!isValidCardIndex(cardIndex)) {
      return res.status(400).json({ success: false, message: 'Invalid card index' });
    }

    let cardSettings = await db.CardSettings.findOne({
      where: { cardIndex: parseInt(cardIndex) },
    });

    if (!cardSettings) {
      cardSettings = await db.CardSettings.create({
        cardIndex: parseInt(cardIndex),
      });
    } else {
      await cardSettings.update({
        isEnabled: true,
        isLockedForFree: Number(cardIndex) === 2,
        isLockedForPremium: false,
        allowedMediaTypes: ['image', 'video'],
        maxFileSizeMb: 500,
        defaultMediaUrl: null,
        defaultTitle: null,
        defaultDescription: null,
        defaultLinkUrl: null,
      });
    }

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'reset_card_settings',
      resource: 'card_settings',
      resourceId: String(cardIndex),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Card settings reset to default',
      data: cardSettings,
    });
  } catch (error) {
    console.error('Reset card settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset card settings',
      error: error.message,
    });
  }
};

exports.uploadDefaultMedia = async (req, res) => {
  try {
    const { cardIndex } = req.params;
    if (!isValidCardIndex(cardIndex)) {
      return res.status(400).json({ success: false, message: 'Invalid card index' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let cardSettings = await db.CardSettings.findOne({ where: { cardIndex: Number(cardIndex) } });
    if (!cardSettings) {
      cardSettings = await db.CardSettings.create({ cardIndex: Number(cardIndex) });
    }

    const mediaType = detectUploadedMediaType(req.file);
    const allowedMediaTypes = cardSettings.allowedMediaTypes || ['image', 'video'];
    if (!mediaType || !allowedMediaTypes.includes(mediaType)) {
      cleanupUpload(req.file);
      return res.status(400).json({
        success: false,
        message: `Card ${cardIndex} default media type is not allowed`,
      });
    }

    const maxBytes = Number(cardSettings.maxFileSizeMb || 500) * 1024 * 1024;
    if (req.file.size > maxBytes) {
      cleanupUpload(req.file);
      return res.status(400).json({
        success: false,
        message: `Card ${cardIndex} default media exceeds ${cardSettings.maxFileSizeMb}MB limit`,
      });
    }

    const normalized = req.file.path.replace(/\\/g, '/');
    const marker = '/uploads/';
    const filePath = normalized.includes(marker)
      ? normalized.substring(normalized.lastIndexOf(marker))
      : `/uploads/card-defaults/${req.file.filename}`;

    await cardSettings.update({ defaultMediaUrl: filePath });

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'upload_card_default_media',
      resource: 'card_settings',
      resourceId: String(cardIndex),
      details: { filePath },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Default media uploaded successfully',
      data: { filePath, cardSettings },
    });
  } catch (error) {
    console.error('Upload default media error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload default media',
    });
  }
};
