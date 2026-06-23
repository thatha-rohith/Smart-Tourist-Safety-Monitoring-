const express = require('express');
const Broadcast = require('../models/Broadcast');
const Tourist = require('../models/Tourist');
const Zone = require('../models/Zone');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const countRecipients = async (broadcastData) => {
  const tourists = await Tourist.find({ isActive: true });

  switch (broadcastData.broadcastType) {
    case 'All Tourists':
      return tourists.length;
    case 'Radius': {
      const { latitude, longitude } = broadcastData.centerLocation;
      const radius = broadcastData.radius || 5000;
      return tourists.filter((t) => {
        const dist = getDistance(latitude, longitude, t.currentLocation.latitude, t.currentLocation.longitude);
        return dist <= radius;
      }).length;
    }
    case 'Zone': {
      if (!broadcastData.targetZone) return 0;
      const zone = await Zone.findById(broadcastData.targetZone);
      if (!zone) return 0;
      return tourists.filter((t) => {
        const dist = getDistance(
          zone.location.latitude,
          zone.location.longitude,
          t.currentLocation.latitude,
          t.currentLocation.longitude
        );
        return dist <= zone.radius;
      }).length;
    }
    case 'Region':
      return tourists.filter((t) =>
        t.currentLocation.address.toLowerCase().includes((broadcastData.region || '').toLowerCase())
      ).length;
    default:
      return 0;
  }
};

// @route   GET /api/broadcasts
router.get('/', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .populate('sentBy', 'name email')
      .populate('targetZone', 'name zoneType')
      .sort({ createdAt: -1 });
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/broadcasts
router.post('/', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const recipientsCount = await countRecipients(req.body);
    const broadcast = await Broadcast.create({
      ...req.body,
      sentBy: req.user._id,
      recipientsCount,
      status: 'Sent',
    });
    const populated = await Broadcast.findById(broadcast._id)
      .populate('sentBy', 'name email')
      .populate('targetZone', 'name zoneType');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/broadcasts/:id
router.get('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id)
      .populate('sentBy', 'name email badgeNumber')
      .populate('targetZone', 'name zoneType location radius');
    if (!broadcast) return res.status(404).json({ message: 'Broadcast not found' });
    res.json(broadcast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/broadcasts/:id
router.put('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id);
    if (!broadcast) return res.status(404).json({ message: 'Broadcast not found' });

    if (req.body.title) broadcast.title = req.body.title;
    if (req.body.message) broadcast.message = req.body.message;
    if (req.body.status) broadcast.status = req.body.status;

    await broadcast.save();
    const populated = await Broadcast.findById(broadcast._id)
      .populate('sentBy', 'name email')
      .populate('targetZone', 'name zoneType');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/broadcasts/:id
router.delete('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const broadcast = await Broadcast.findByIdAndDelete(req.params.id);
    if (!broadcast) return res.status(404).json({ message: 'Broadcast not found' });
    res.json({ message: 'Broadcast deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
