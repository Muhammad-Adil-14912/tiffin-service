const mongoose = require('mongoose');

const TiffinSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a tiffin title'],
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    minlength: 10,
    maxlength: 2000,
  },
  price: {
    daily: { type: Number, required: true, min: 0.01 },
    weekly: { type: Number, required: true, min: 0.01 },
    monthly: { type: Number, required: true, min: 0.01 },
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: ['Veg', 'Non-Veg', 'Diet'],
  },
  menu: {
    monday: { type: String, default: '' },
    tuesday: { type: String, default: '' },
    wednesday: { type: String, default: '' },
    thursday: { type: String, default: '' },
    friday: { type: String, default: '' },
    saturday: { type: String, default: '' },
    sunday: { type: String, default: '' },
  },
  image: {
    type: String,
    default: '',
    maxlength: 2048,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Tiffin', TiffinSchema);
