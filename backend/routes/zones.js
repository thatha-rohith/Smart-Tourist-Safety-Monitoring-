const express = require('express');
const Zone = require('../models/Zone');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/zones
router.get('/', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const { zoneType, search, sort } = req.query;
    let query = {};

    if (zoneType) query.zoneType = zoneType;

    let sortOption = { name: 1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === '-name') sortOption = { name: -1 };
    if (sort === 'created') sortOption = { createdAt: -1 };

    let zones = await Zone.find(query).populate('createdBy', 'name email').sort(sortOption);

    if (search) {
      const s = search.toLowerCase();
      zones = zones.filter(
        (z) => z.name.toLowerCase().includes(s) || z.location.address.toLowerCase().includes(s)
      );
    }

    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/zones/stats
router.get('/stats', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const restricted = await Zone.countDocuments({ zoneType: 'Restricted' });
    const risky = await Zone.countDocuments({ zoneType: 'Risky' });
    const safe = await Zone.countDocuments({ zoneType: 'Safe' });
    res.json({ restricted, risky, safe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/zones/:id
router.get('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id).populate('createdBy', 'name email');
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/zones
router.post('/', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const zone = await Zone.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/zones/:id
router.put('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/zones/:id
router.delete('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
