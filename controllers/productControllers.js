const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  if (!product) {
    return next(new AppError('Error creating a product, try again!', 400));
  }

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

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
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product with that ID was found! 😰', 404));
  }

  res.status(200).json({
    status: 'success',
    product,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No product with that ID was found! 😰', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id, req.body);

  if (!product) {
    return next(new AppError('No product with that ID was found! 😰', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
