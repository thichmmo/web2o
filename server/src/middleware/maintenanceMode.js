const { getSetting } = require('../controllers/settingsController');

const maintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for admin routes
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth/login')) {
      return next();
    }

    // Check if maintenance mode is enabled
    const isMaintenanceMode = await getSetting('maintenance_mode');

    if (isMaintenanceMode) {
      const maintenanceMessage = await getSetting('maintenance_message') || 'Website đang bảo trì, vui lòng quay lại sau.';

      return res.status(503).json({
        success: false,
        message: maintenanceMessage,
        maintenance: true,
      });
    }

    next();
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    next();
  }
};

module.exports = maintenanceMode;
