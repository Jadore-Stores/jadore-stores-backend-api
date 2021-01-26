const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  slug: String,
  name: {
    type: String,
    required: [true, 'product must have a name'],
    unique: true,
    minlength: [10, 'Product description must be at least 20 charactes'],
    maxlength: [50, 'Product description must not exceed 50 characters'],
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
  priceDiscount: Number,
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
  size: {
    type: String,
    required: [true, 'Please specify size of product!'],
    // enum: {
    //   values: ['s', 'm', 'l', 'xl', 'xxl'],
    //   message: ['Size of product is either s, m, l, xl, xxl'],
    // },
    trim: true,
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'Please specify a summary description for a product!'],
  },
  imageCover: {
    type: String,
    required: [true, 'A product must have a cover image!'],
  },
  images: [String],
  ratingsAverage: {
    type: Number,
    default: 4.0,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

// MIDDLEWARES

productSchema.pre('save', function (next) {
  this.slug = slugify(`${this.name}`, { lower: true });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
