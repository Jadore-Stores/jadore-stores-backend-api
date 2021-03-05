const express = require('express');
const productControllers = require('../controllers/productControllers');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use(authController.isLoggedIn);

// POST /product/98034/reviews
// GET /product/98034/reviews
// GET /product/98034/reviews/8935

router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(productControllers.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    productControllers.createProduct
  );

router
  .route('/:id')
  .get(productControllers.getProduct)
  .patch(authController.restrictTo('admin'), productControllers.updateProduct)
  .delete(authController.restrictTo('admin'), productControllers.deleteProduct);

module.exports = router;
