const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Tiffin = require('../models/Tiffin');
const { protect, vendorOnly } = require('../middleware/auth');

// @route   GET /api/tiffins
// @desc    Get all tiffin plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tiffins = await Tiffin.find({ available: true }).populate('vendor', 'name email');
    res.json({ success: true, count: tiffins.length, data: tiffins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tiffins/vendor
// @desc    Get all tiffin plans created by the logged in vendor
// @access  Private/Vendor
router.get('/vendor', protect, vendorOnly, async (req, res) => {
  try {
    const tiffins = await Tiffin.find({ vendor: req.user.id });
    res.json({ success: true, count: tiffins.length, data: tiffins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tiffins/:id
// @desc    Get single tiffin plan details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid tiffin plan ID' });
    }
    const tiffin = await Tiffin.findOne({ _id: req.params.id, available: true })
      .populate('vendor', 'name email phone');
    if (!tiffin) {
      return res.status(404).json({ success: false, message: 'Tiffin plan not found' });
    }
    res.json({ success: true, data: tiffin });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load tiffin plan' });
  }
});

// @route   POST /api/tiffins
// @desc    Create new tiffin plan
// @access  Private/Vendor
router.post('/', protect, vendorOnly, async (req, res) => {
  try {
    const { title, description, price, category, menu, image } = req.body;

    const validText = (value, min, max) =>
      typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
    const validPrice = (value) => Number.isFinite(value) && value > 0 && value <= 1000000;

    if (
      !validText(title, 3, 100) ||
      !validText(description, 10, 2000) ||
      !price || typeof price !== 'object' ||
      !validPrice(price.daily) ||
      !validPrice(price.weekly) ||
      !validPrice(price.monthly) ||
      !['Veg', 'Non-Veg', 'Diet'].includes(category) ||
      (image !== undefined && (typeof image !== 'string' || image.length > 2048))
    ) {
      return res.status(400).json({ success: false, message: 'Please provide valid tiffin listing details and positive plan prices' });
    }

    const tiffin = await Tiffin.create({
      title,
      description,
      price,
      category,
      menu,
      image: image || '',
      vendor: req.user.id,
    });

    res.status(201).json({ success: true, data: tiffin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tiffins/:id
// @desc    Update tiffin plan
// @access  Private/Vendor
router.put('/:id', protect, vendorOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid tiffin plan ID' });
    }
    let tiffin = await Tiffin.findById(req.params.id);

    if (!tiffin) {
      return res.status(404).json({ success: false, message: 'Tiffin plan not found' });
    }

    // Check ownership
    if (tiffin.vendor.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this plan' });
    }

    // Only accept editable listing fields; never allow clients to transfer ownership
    // or overwrite internal fields such as vendor and createdAt.
    const allowedFields = ['title', 'description', 'price', 'category', 'menu', 'image', 'available'];
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid listing fields provided' });
    }

    tiffin = await Tiffin.findByIdAndUpdate(req.params.id, { $set: updates }, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: tiffin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tiffins/:id
// @desc    Delete tiffin plan
// @access  Private/Vendor
router.delete('/:id', protect, vendorOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid tiffin plan ID' });
    }
    const tiffin = await Tiffin.findById(req.params.id);

    if (!tiffin) {
      return res.status(404).json({ success: false, message: 'Tiffin plan not found' });
    }

    // Check ownership
    if (tiffin.vendor.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this plan' });
    }

    await Tiffin.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Tiffin plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
