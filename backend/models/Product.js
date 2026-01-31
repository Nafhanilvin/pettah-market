const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop ID is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [150, 'Product name cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    default: null,
    validate: {
      validator: function(value) {
        if (value !== null && value >= this.price) {
          return false;
        }
        return true;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  images: {
    type: [String],
    default: []
  },
  inStock: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
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
productSchema.index({ shopId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);
