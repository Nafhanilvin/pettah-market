const mongoose = require('mongoose');

const streetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Street name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    area: String,
    city: {
      type: String,
      default: 'Colombo'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  shopCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for shops
streetSchema.virtual('shops', {
  ref: 'Shop',
  localField: '_id',
  foreignField: 'street'
});

// Index for searching
streetSchema.index({ name: 'text', 'location.area': 'text' });

module.exports = mongoose.model('Street', streetSchema);
