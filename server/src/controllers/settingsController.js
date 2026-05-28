const db = require('../models');
const path = require('path');
const fs = require('fs');

const PUBLIC_BRANDING_KEYS = [
  'site_name',
  'site_description',
  'site_logo',
  'site_favicon',
  'primary_color',
  'secondary_color',
  'custom_css',
];

const parseSettingValue = (setting) => {
  let value = setting.value;

  if (setting.type === 'boolean') {
    value = value === 'true';
  } else if (setting.type === 'number') {
    value = parseFloat(value);
  } else if (setting.type === 'json') {
    try {
      value = JSON.parse(value);
    } catch (e) {
      value = null;
    }
  }

  return value;
};

const getSettings = async (req, res) => {
  try {
    const settings = await db.Setting.findAll({
      order: [['key', 'ASC']],
    });

    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      let value = parseSettingValue(setting);

      if (setting.key === 'smtp_password' && value) {
        value = '********';
      }

      settingsObj[setting.key] = {
        value,
        type: setting.type,
        description: setting.description,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        settings: settingsObj,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get settings',
    });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const settings = await db.Setting.findAll({
      where: { key: PUBLIC_BRANDING_KEYS },
    });

    const branding = {
      site_name: 'Thich Cuu - Facebook Tool',
      site_description: 'Facebook carousel posting tool',
      site_logo: '',
      site_favicon: '',
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
      custom_css: '',
    };

    settings.forEach((setting) => {
      branding[setting.key] = parseSettingValue(setting) || '';
    });

    return res.status(200).json({
      success: true,
      data: { branding },
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get public settings',
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required',
      });
    }

    // Update each setting
    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      const setting = await db.Setting.findOne({ where: { key } });

      if (!setting) {
        continue;
      }

      if (key === 'smtp_password' && (value === '' || value === '********')) {
        continue;
      }

      if (key === 'custom_js' && typeof value === 'string' && value.length > 20000) {
        return res.status(400).json({
          success: false,
          message: 'Custom JavaScript is too large',
        });
      }

      if (key === 'custom_css' && typeof value === 'string' && value.length > 50000) {
        return res.status(400).json({
          success: false,
          message: 'Custom CSS is too large',
        });
      }

      // Convert value to string based on type
      let stringValue = value;
      if (setting.type === 'boolean') {
        stringValue = value ? 'true' : 'false';
      } else if (setting.type === 'number') {
        stringValue = String(value);
      } else if (setting.type === 'json') {
        stringValue = JSON.stringify(value);
      }

      await setting.update({ value: stringValue });
      updates.push(key);
    }

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'update_settings',
      resource: 'settings',
      details: { updated: updates },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        updated: updates,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
};

const uploadBrandingFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { type } = req.body; // 'logo' or 'favicon'
    if (!['logo', 'favicon'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Upload type must be logo or favicon',
      });
    }
    const filePath = `/uploads/branding/${req.file.filename}`;

    // Update setting
    const settingKey = type === 'logo' ? 'site_logo' : 'site_favicon';
    const setting = await db.Setting.findOne({ where: { key: settingKey } });

    if (setting) {
      // Delete old file if exists
      if (setting.value && setting.value.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../', setting.value.replace(/^\/+/, ''));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      await setting.update({ value: filePath });
    }

    await db.ActivityLog.create({
      userId: req.user.id,
      action: 'upload_branding',
      resource: 'settings',
      details: { type, filePath },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filePath,
      },
    });
  } catch (error) {
    console.error('Upload branding file error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file',
    });
  }
};

const getSetting = async (key) => {
  try {
    const setting = await db.Setting.findOne({ where: { key } });

    if (!setting) {
      return null;
    }

    return parseSettingValue(setting);
  } catch (error) {
    console.error('Get setting error:', error);
    return null;
  }
};

module.exports = {
  getSettings,
  getPublicSettings,
  updateSettings,
  uploadBrandingFile,
  getSetting,
};
