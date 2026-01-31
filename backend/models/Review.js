const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer ID is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required']
  },
  targetType: {
    type: String,
    enum: ['PRODUCT', 'SHOP'],
    required: [true, 'Target type is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    minlength: [10, 'Comment must be at least 10 characters']
  },
  images: {
    type: [String],
    default: []
  },
  helpful: {
    type: Number,
    default: 0
  },
  unhelpful: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED'
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ targetId: 1 });
reviewSchema.index({ targetType: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ targetId: 1, targetType: 1 });

module.exports = mongoose.model('Review', reviewSchema);
