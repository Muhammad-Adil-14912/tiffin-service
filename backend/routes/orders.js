const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const Tiffin = require('../models/Tiffin');
const { protect, vendorOnly, customerOnly } = require('../middleware/auth');
const { canTransitionOrderStatus } = require('../utils/orderStatus');

// @route   POST /api/orders
// @desc    Create new order/subscription
// @access  Private (Customer only)
router.post('/', protect, customerOnly, async (req, res) => {
  try {
    const {
      tiffinId,
      planType,
      startDate,
      deliveryAddress,
      deliveryTime,
    } = req.body || {};

    if (
      typeof tiffinId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(tiffinId) ||
      !['daily', 'weekly', 'monthly'].includes(planType) ||
      typeof startDate !== 'string' ||
      !startDate.trim() ||
      typeof deliveryAddress !== 'string' ||
      deliveryAddress.trim().length < 5 ||
      deliveryAddress.trim().length > 300 ||
      !['Lunch', 'Dinner'].includes(deliveryTime)
    ) {
      return res.status(400).json({ success: false, message: 'Please provide valid order details' });
    }

    const parsedStartDate = new Date(startDate);
    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid start date' });
    }

    const tiffin = await Tiffin.findById(tiffinId);
    if (!tiffin) {
      return res.status(404).json({ success: false, message: 'Tiffin plan not found' });
    }

    if (!tiffin.available) {
      return res.status(409).json({ success: false, message: 'This tiffin plan is currently unavailable' });
    }

    const price = tiffin.price?.[planType];
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'The selected plan does not have a valid price' });
    }

    const order = await Order.create({
      user: req.user.id,
      tiffin: tiffinId,
      planType,
      price,
      startDate: parsedStartDate,
      deliveryAddress: deliveryAddress.trim(),
      deliveryTime,
    });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Order creation failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to create order' });
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
        populate: { path: 'vendor', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Customer order lookup failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load orders' });
  }
});

// @route   GET /api/orders/vendor
// @desc    Get subscriptions for meals owned by this vendor
// @access  Private/Vendor
router.get('/vendor', protect, vendorOnly, async (req, res) => {
  try {
    const myTiffins = await Tiffin.find({ vendor: req.user.id }).select('_id');
    const tiffinIds = myTiffins.map((tiffin) => tiffin._id);

    const orders = await Order.find({ tiffin: { $in: tiffinIds } })
      .populate('user', 'name email phone')
      .populate('tiffin', 'title category')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Vendor order lookup failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load vendor orders' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Move an order to the next allowed fulfillment status
// @access  Private/Vendor
router.put('/:id/status', protect, vendorOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const { status } = req.body || {};
    if (typeof status !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid status' });
    }

    const order = await Order.findById(req.params.id).populate('tiffin');
    if (!order || !order.tiffin) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.tiffin.vendor || order.tiffin.vendor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this order' });
    }

    if (!canTransitionOrderStatus(order.status, status)) {
      return res.status(409).json({
        success: false,
        message: 'Invalid order status transition',
        currentStatus: order.status,
      });
    }

    order.status = status;
    await order.save();

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Order status update failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update order status' });
  }
});

module.exports = router;
