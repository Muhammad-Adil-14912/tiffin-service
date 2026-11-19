const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/signup
// @desc Register a customer or submit a vendor application
// @access Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!name || typeof name !== 'string' || !normalizedEmail || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (role !== undefined && !['customer', 'vendor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be customer or vendor' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountRole = role || 'customer';
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: accountRole,
      vendorStatus: accountRole === 'vendor' ? 'pending' : 'not_applicable',
      phone: typeof phone === 'string' ? phone.trim() : '',
      address: typeof address === 'string' ? address.trim() : '',
    });

    return res.status(201).json({
      success: true,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorStatus: user.vendorStatus,
      phone: user.phone,
      address: user.address,
      token: generateToken(user._id),
      message: accountRole === 'vendor'
        ? 'Vendor application submitted. Your account is pending administrator approval.'
        : 'Account created successfully.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    return res.status(500).json({ success: false, message: 'Unable to create account' });
  }
});

// @route POST /api/auth/login
// @desc Authenticate user and return current vendor approval status
// @access Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorStatus: user.vendorStatus || (user.role === 'vendor' ? 'pending' : 'not_applicable'),
      phone: user.phone,
      address: user.address,
      token: generateToken(user._id),
      message: user.role === 'vendor' && user.vendorStatus !== 'approved'
        ? 'Your vendor account is awaiting administrator approval.'
        : 'Login successful.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to log in' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
