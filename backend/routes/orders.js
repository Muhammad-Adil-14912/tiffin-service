const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Tiffin = require('../models/Tiffin');
const { protect, vendorOnly } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order/subscription
// @access  Private (Customer only)
router.post('/', protect, async (req, res) => {
  try {
    const { tiffinId, planType, price, startDate, deliveryAddress, deliveryTime } = req.body;

    if (!tiffinId || !planType || !price || !startDate || !deliveryAddress || !deliveryTime) {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    const tiffin = await Tiffin.findById(tiffinId);
    if (!tiffin) {
      return res.status(404).json({ success: false, message: 'Tiffin plan not found' });
    }

    const order = await Order.create({
      user: req.user.id,
      tiffin: tiffinId,
      planType,
      price,
      startDate,
      deliveryAddress,
      deliveryTime,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/user
// @desc    Get current user's subscriptions
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'tiffin',
        populate: { path: 'vendor', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/vendor
// @desc    Get subscriptions for meals owned by this vendor
// @access  Private/Vendor
router.get('/vendor', protect, vendorOnly, async (req, res) => {
  try {
    // 1. Find all tiffins owned by this vendor
    const myTiffins = await Tiffin.find({ vendor: req.user.id }).select('_id');
    const tiffinIds = myTiffins.map(t => t._id);

    // 2. Find orders for these tiffins
    const orders = await Order.find({ tiffin: { $in: tiffinIds } })
      .populate('user', 'name email phone')
      .populate('tiffin', 'title category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order/subscription status
// @access  Private/Vendor
router.put('/:id/status', protect, vendorOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status' });
    }

    let order = await Order.findById(req.params.id).populate('tiffin');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify vendor owns the tiffin associated with this order
    if (order.tiffin.vendor.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update status for this order' });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
