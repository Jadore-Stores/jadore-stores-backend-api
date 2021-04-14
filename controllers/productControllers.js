const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('./handlerFactory');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Execute the query
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  if (!products) {
    return next(new AppError('No Product Found! 😰', 404));
  }

  res.status(200).json({
    status: 'success',
    result: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'reviews',
  });

  if (!product) {
    return next(new AppError('No product with that ID was found! 😰', 404));
  }

  res.status(200).json({
    status: 'success',
    product,
  });
});

exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
