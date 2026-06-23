const express = require('express');
const Alert = require('../models/Alert');
const Tourist = require('../models/Tourist');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/alerts
router.get('/', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const { severity, status, search } = req.query;
    let query = {};

    if (severity) query.severity = severity;
    if (status) query.status = status;

    let alerts = await Alert.find(query)
      .populate({ path: 'tourist', populate: { path: 'user', select: 'name email phone' } })
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      alerts = alerts.filter(
        (a) =>
          a.tourist?.user?.name?.toLowerCase().includes(s) ||
          a.tourist?.user?.email?.toLowerCase().includes(s) ||
          a.alertType.toLowerCase().includes(s)
      );
    }

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/alerts/stats
router.get('/stats', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const critical = await Alert.countDocuments({ severity: 'Critical', status: 'Pending' });
    const high = await Alert.countDocuments({ severity: 'High', status: 'Pending' });
    const pending = await Alert.countDocuments({ status: 'Pending' });
    const resolved = await Alert.countDocuments({ status: 'Resolved' });
    res.json({ critical, high, pending, resolved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/alerts/:id
router.get('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate({ path: 'tourist', populate: { path: 'user', select: 'name email phone' } })
      .populate('resolvedBy', 'name email');
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/alerts/:id/resolve
router.put('/:id/resolve', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    alert.status = 'Resolved';
    alert.resolvedBy = req.user._id;
    alert.resolvedAt = new Date();
    alert.responseAction = req.body.responseAction || 'Alert resolved by officer';
    await alert.save();

    const tourist = await Tourist.findById(alert.tourist);
    if (tourist && tourist.safetyStatus === 'Critical') {
      tourist.safetyStatus = 'Safe';
      tourist.safetyScore = Math.min(100, tourist.safetyScore + 20);
      await tourist.save();
    }

    const populated = await Alert.findById(alert._id)
      .populate({ path: 'tourist', populate: { path: 'user', select: 'name email phone' } })
      .populate('resolvedBy', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/alerts
router.post('/', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    const tourist = await Tourist.findById(req.body.tourist);
    if (tourist) {
      tourist.totalAlerts += 1;
      await tourist.save();
    }
    const populated = await Alert.findById(alert._id).populate({
      path: 'tourist',
      populate: { path: 'user', select: 'name email phone' },
    });
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/alerts/:id
router.put('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    const { alertType, severity, status, description, responseAction, location } = req.body;
    if (alertType) alert.alertType = alertType;
    if (severity) alert.severity = severity;
    if (description !== undefined) alert.description = description;
    if (responseAction !== undefined) alert.responseAction = responseAction;
    if (location) alert.location = { ...alert.location.toObject?.() || alert.location, ...location };
    if (status) {
      alert.status = status;
      if (status === 'Resolved') {
        alert.resolvedBy = req.user._id;
        alert.resolvedAt = new Date();
      }
    }

    await alert.save();
    const populated = await Alert.findById(alert._id)
      .populate({ path: 'tourist', populate: { path: 'user', select: 'name email phone' } })
      .populate('resolvedBy', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/alerts/:id
router.delete('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
