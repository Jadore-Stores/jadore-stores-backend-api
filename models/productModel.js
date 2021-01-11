const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  slug: String,
  name: {
    type: String,
    required: [true, 'product must have a name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'product must have a description!'],
    minlength: [20, 'Product description must be at least 20 charactes'],
    maxlength: [500, 'Product description must not exceed 500 characters'],
  },
  price: {
    type: Number,
    required: [true, 'product must have a price!'],
  },
  category: {
    type: String,
    required: [true, 'product must have a category'],
    enum: {
      values: ['men', 'women', 'wrist-watches', 'accessories'],
      message: ['Product must belong to a category'],
    },
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'product must have a quantity'],
  },
  images: [String],
  ratingsAverage: {
    type: Number,
    default: 4.0,
  },
  imageCover: String,
  ratingsQuantity: {
    type: Number,
    default: 5.0,
  },
});

// MIDDLEWARES

productSchema.pre('save', function (next) {
  this.slug = slugify(`${this.name}`, { lower: true });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
