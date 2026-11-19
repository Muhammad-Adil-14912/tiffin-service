const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const vendorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied: Meal Vendors only' });
  }

  if (req.user.vendorStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      code: 'VENDOR_APPROVAL_REQUIRED',
      vendorStatus: req.user.vendorStatus || 'pending',
      message: req.user.vendorStatus === 'rejected'
        ? 'Your vendor application was not approved. Please contact support.'
        : 'Your vendor account is pending administrator approval.',
    });
  }

  return next();
};

// Administrators are configured out-of-band; public signup can never grant admin access.
const adminOnly = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!req.user || !adminEmails.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: 'Administrator access required' });
  }

  return next();
};

module.exports = { protect, vendorOnly, adminOnly };
