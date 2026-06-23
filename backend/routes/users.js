const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await User.countDocuments({ role: { $in: ['authority', 'admin'] } });
    const active = await User.countDocuments({ role: { $in: ['authority', 'admin'] }, isActive: true });
    const authorities = await User.countDocuments({ role: 'authority' });
    const admins = await User.countDocuments({ role: 'admin' });
    res.json({ total, active, authorities, admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/officers
router.get('/officers', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const officers = await User.find({ role: { $in: ['authority', 'admin'] }, isActive: true })
      .select('name email badgeNumber department role')
      .sort({ name: 1 });
    res.json(officers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = { role: { $in: ['authority', 'admin'] } };

    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    let users = await User.find(query).select('-password').sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.badgeNumber?.toLowerCase().includes(s)
      );
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, role, badgeNumber, department } = req.body;

    if (!['authority', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be authority or admin' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password: password || 'police123',
      phone: phone || '',
      role,
      badgeNumber: badgeNumber || '',
      department: department || 'Tourist Safety Division',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      badgeNumber: user.badgeNumber,
      department: user.department,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.badgeNumber !== undefined) user.badgeNumber = req.body.badgeNumber;
    if (req.body.department !== undefined) user.department = req.body.department;
    if (req.body.role && ['authority', 'admin'].includes(req.body.role)) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      badgeNumber: updated.badgeNumber,
      department: updated.department,
      isActive: updated.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = false;
    await user.save();
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
