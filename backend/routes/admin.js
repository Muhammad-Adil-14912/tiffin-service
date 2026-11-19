const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/admin/vendors/pending
// @desc List vendor applications awaiting review
// @access Admin (ADMIN_EMAILS allowlist)
router.get('/vendors/pending', protect, adminOnly, async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', vendorStatus: 'pending' })
      .select('name email phone address createdAt vendorStatus')
      .sort({ createdAt: 1 });
    return res.json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load vendor applications' });
  }
});

// @route PATCH /api/admin/vendors/:id/status
// @desc Approve or reject a vendor application
// @access Admin (ADMIN_EMAILS allowlist)
router.patch('/vendors/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor', vendorStatus: 'pending' },
      { $set: { vendorStatus: status } },
      { new: true, runValidators: true }
    ).select('name email vendorStatus');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Pending vendor application not found' });
    }

    return res.json({
      success: true,
      data: vendor,
      message: status === 'approved' ? 'Vendor approved successfully' : 'Vendor application rejected',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
    }
    return res.status(500).json({ success: false, message: 'Unable to update vendor application' });
  }
});

module.exports = router;
