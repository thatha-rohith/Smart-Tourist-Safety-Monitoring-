const express = require('express');
const Tourist = require('../models/Tourist');
const User = require('../models/User');
const Alert = require('../models/Alert');
const Zone = require('../models/Zone');
const Broadcast = require('../models/Broadcast');
const { protect, authorize } = require('../middleware/auth');
const { checkZoneAlerts } = require('../utils/geo');

const router = express.Router();

const generateTouristId = () => {
  return 'TID' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
};

const calculateSafetyScore = (tourist, alertCount) => {
  let score = 100;
  score -= alertCount * 5;
  if (tourist.safetyStatus === 'At Risk') score -= 15;
  if (tourist.safetyStatus === 'Unsafe') score -= 30;
  if (tourist.safetyStatus === 'Critical') score -= 50;
  const hoursSinceSeen = (Date.now() - new Date(tourist.currentLocation.lastUpdated)) / 3600000;
  if (hoursSinceSeen > 24) score -= 10;
  if (hoursSinceSeen > 72) score -= 20;
  return Math.max(0, Math.min(100, score));
};

const getTouristForUser = async (userId) => {
  return Tourist.findOne({ user: userId }).populate('user', 'name email phone');
};

const updateTouristLocation = async (tourist, latitude, longitude, address) => {
  if (tourist.currentLocation?.latitude) {
    tourist.locationHistory.push({
      latitude: tourist.currentLocation.latitude,
      longitude: tourist.currentLocation.longitude,
      address: tourist.currentLocation.address,
      timestamp: new Date(),
    });
    if (tourist.locationHistory.length > 50) {
      tourist.locationHistory = tourist.locationHistory.slice(-50);
    }
  }

  tourist.currentLocation = {
    latitude,
    longitude,
    address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    lastUpdated: new Date(),
  };

  await checkZoneAlerts(tourist, latitude, longitude, Alert, Zone);
  await tourist.save();
  return tourist;
};

const canAccessTourist = (req, tourist) => {
  if (req.user.role === 'admin' || req.user.role === 'authority') return true;
  if (req.user.role === 'tourist' && tourist.user?.toString() === req.user._id.toString()) return true;
  if (req.user.role === 'tourist' && tourist.user?._id?.toString() === req.user._id.toString()) return true;
  return false;
};

// @route   GET /api/tourists
router.get('/', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    const tourists = await Tourist.find(query)
      .populate('user', 'name email phone')
      .sort({ updatedAt: -1 });

    let filtered = tourists;
    if (search) {
      const s = search.toLowerCase();
      filtered = tourists.filter(
        (t) =>
          t.user?.name?.toLowerCase().includes(s) ||
          t.user?.email?.toLowerCase().includes(s) ||
          t.touristId.toLowerCase().includes(s)
      );
    }
    if (status) {
      filtered = filtered.filter((t) => t.safetyStatus === status);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tourists/stats
router.get('/stats', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const total = await Tourist.countDocuments();
    const safe = await Tourist.countDocuments({ safetyStatus: 'Safe' });
    const atRisk = await Tourist.countDocuments({ safetyStatus: { $in: ['At Risk', 'Unsafe', 'Critical'] } });
    const active = await Tourist.countDocuments({ isActive: true });
    res.json({ total, safe, atRisk, active });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== TOURIST PORTAL ROUTES (must be before /:id) =====

// @route   GET /api/tourists/me
router.get('/me', protect, authorize('tourist'), async (req, res) => {
  try {
    const tourist = await getTouristForUser(req.user._id);
    if (!tourist) return res.status(404).json({ message: 'Tourist profile not found' });

    const alertCount = await Alert.countDocuments({ tourist: tourist._id });
    tourist.safetyScore = calculateSafetyScore(tourist, alertCount);
    await tourist.save();

    res.json(tourist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tourists/me/location
router.put('/me/location', protect, authorize('tourist'), async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const tourist = await Tourist.findOne({ user: req.user._id });
    if (!tourist) return res.status(404).json({ message: 'Tourist profile not found' });

    const updated = await updateTouristLocation(tourist, latitude, longitude, address);
    const populated = await Tourist.findById(updated._id).populate('user', 'name email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tourists/me/sos
router.post('/me/sos', protect, authorize('tourist'), async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ user: req.user._id });
    if (!tourist) return res.status(404).json({ message: 'Tourist profile not found' });

    const alert = await Alert.create({
      tourist: tourist._id,
      alertType: 'SOS alert',
      severity: 'Critical',
      status: 'Pending',
      location: {
        latitude: tourist.currentLocation.latitude,
        longitude: tourist.currentLocation.longitude,
        address: tourist.currentLocation.address,
      },
      description: req.body.description || 'Emergency SOS alert triggered by tourist',
    });

    tourist.totalAlerts += 1;
    tourist.safetyStatus = 'Critical';
    tourist.safetyScore = Math.max(0, tourist.safetyScore - 30);
    await tourist.save();

    const populated = await Alert.findById(alert._id).populate({
      path: 'tourist',
      populate: { path: 'user', select: 'name email phone' },
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tourists/me/alerts
router.get('/me/alerts', protect, authorize('tourist'), async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ user: req.user._id });
    if (!tourist) return res.status(404).json({ message: 'Tourist profile not found' });

    const alerts = await Alert.find({ tourist: tourist._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tourists/me/broadcasts
router.get('/me/broadcasts', protect, authorize('tourist'), async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({ status: 'Sent' })
      .populate('sentBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tourists/live
router.get('/live', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const tourists = await Tourist.find({ isActive: true })
      .populate('user', 'name email phone')
      .select('touristId safetyStatus safetyScore currentLocation totalAlerts')
      .sort({ 'currentLocation.lastUpdated': -1 });
    res.json(tourists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tourists/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id).populate('user', 'name email phone');
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' });
    if (!canAccessTourist(req, tourist)) {
      return res.status(403).json({ message: 'Not authorized to view this tourist' });
    }

    const alertCount = await Alert.countDocuments({ tourist: tourist._id });
    tourist.safetyScore = calculateSafetyScore(tourist, alertCount);
    await tourist.save();

    res.json(tourist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tourists
router.post('/', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const { name, email, password, phone, nationality, visitPurpose, emergencyContact, safetyStatus, safetyScore } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password: password || 'tourist123',
      phone: phone || '',
      role: 'tourist',
    });

    const tourist = await Tourist.create({
      user: user._id,
      touristId: generateTouristId(),
      nationality: nationality || 'Indian',
      visitPurpose: visitPurpose || 'Tourism',
      emergencyContact: emergencyContact || '',
      safetyStatus: safetyStatus || 'Safe',
      safetyScore: safetyScore ?? 100,
      currentLocation: req.body.currentLocation || {
        latitude: 28.6139,
        longitude: 77.209,
        address: 'New Delhi, India',
        lastUpdated: new Date(),
      },
    });

    const populated = await Tourist.findById(tourist._id).populate('user', 'name email phone');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tourists/:id
router.put('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id).populate('user');
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' });

    const { name, phone, nationality, visitPurpose, emergencyContact, safetyStatus, safetyScore, isActive, currentLocation } = req.body;

    if (name && tourist.user) {
      tourist.user.name = name;
      await tourist.user.save();
    }
    if (phone !== undefined && tourist.user) {
      tourist.user.phone = phone;
      await tourist.user.save();
    }
    if (nationality !== undefined) tourist.nationality = nationality;
    if (visitPurpose !== undefined) tourist.visitPurpose = visitPurpose;
    if (emergencyContact !== undefined) tourist.emergencyContact = emergencyContact;
    if (safetyStatus !== undefined) tourist.safetyStatus = safetyStatus;
    if (safetyScore !== undefined) tourist.safetyScore = safetyScore;
    if (isActive !== undefined) {
      tourist.isActive = isActive;
      if (tourist.user) {
        tourist.user.isActive = isActive;
        await tourist.user.save();
      }
    }
    if (currentLocation) {
      tourist.currentLocation = {
        latitude: currentLocation.latitude ?? tourist.currentLocation.latitude,
        longitude: currentLocation.longitude ?? tourist.currentLocation.longitude,
        address: currentLocation.address ?? tourist.currentLocation.address,
        lastUpdated: new Date(),
      };
    }

    await tourist.save();
    const populated = await Tourist.findById(tourist._id).populate('user', 'name email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/tourists/:id
router.delete('/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id);
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' });

    tourist.isActive = false;
    await tourist.save();

    await User.findByIdAndUpdate(tourist.user, { isActive: false });
    res.json({ message: 'Tourist deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tourists/:id/location
router.put('/:id/location', protect, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const tourist = await Tourist.findById(req.params.id).populate('user');
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' });
    if (!canAccessTourist(req, tourist)) {
      return res.status(403).json({ message: 'Not authorized to update this location' });
    }

    const updated = await updateTouristLocation(tourist, latitude, longitude, address);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tourists/:id/sos
router.post('/:id/sos', protect, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id).populate('user');
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' });
    if (!canAccessTourist(req, tourist)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const alert = await Alert.create({
      tourist: tourist._id,
      alertType: 'SOS alert',
      severity: 'Critical',
      status: 'Pending',
      location: {
        latitude: tourist.currentLocation.latitude,
        longitude: tourist.currentLocation.longitude,
        address: tourist.currentLocation.address,
      },
      description: req.body.description || 'Emergency SOS alert triggered by tourist',
    });

    tourist.totalAlerts += 1;
    tourist.safetyStatus = 'Critical';
    tourist.safetyScore = Math.max(0, tourist.safetyScore - 30);
    await tourist.save();

    const populated = await Alert.findById(alert._id).populate({
      path: 'tourist',
      populate: { path: 'user', select: 'name email phone' },
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
