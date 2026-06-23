const express = require('express');
const Tourist = require('../models/Tourist');
const Alert = require('../models/Alert');
const Zone = require('../models/Zone');
const EFIR = require('../models/EFIR');
const Broadcast = require('../models/Broadcast');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
router.get('/stats', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const [touristStats, alertStats, zoneStats, efirStats, recentAlerts, recentTourists] = await Promise.all([
      Tourist.countDocuments(),
      Alert.countDocuments({ status: 'Pending' }),
      Zone.countDocuments({ status: 'Active' }),
      EFIR.countDocuments(),
      Alert.find({ status: 'Pending' })
        .populate({ path: 'tourist', populate: { path: 'user', select: 'name email' } })
        .sort({ createdAt: -1 })
        .limit(5),
      Tourist.find()
        .populate('user', 'name email')
        .sort({ 'currentLocation.lastUpdated': -1 })
        .limit(5),
    ]);

    const criticalAlerts = await Alert.countDocuments({ severity: 'Critical', status: 'Pending' });
    const safeTourists = await Tourist.countDocuments({ safetyStatus: 'Safe' });
    const broadcastsSent = await Broadcast.countDocuments();

    res.json({
      overview: {
        totalTourists: touristStats,
        pendingAlerts: alertStats,
        activeZones: zoneStats,
        totalEFIRs: efirStats,
        criticalAlerts,
        safeTourists,
        broadcastsSent,
      },
      recentAlerts,
      recentTourists,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
