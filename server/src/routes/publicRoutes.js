const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/plans', async (req, res) => {
  try {
    const plans = await db.Plan.findAll({
      where: { isActive: true },
      attributes: [
        'id',
        'name',
        'description',
        'price',
        'durationDays',
        'maxPosts',
        'maxFbAccounts',
        'features',
      ],
      order: [['price', 'ASC']],
    });

    return res.json({
      success: true,
      data: { plans },
    });
  } catch (error) {
    console.error('Get public plans error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get public plans',
    });
  }
});

module.exports = router;
