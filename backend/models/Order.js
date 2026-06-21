const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tiffin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tiffin',
    required: true,
  },
  planType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  deliveryTime: {
    type: String,
    enum: ['Lunch', 'Dinner'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Cooking', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
