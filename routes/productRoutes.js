const express = require('express');
const productControllers = require('../controllers/productControllers');
const authController = require('../controllers/authController');

const router = express.Router();

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
  .patch(productControllers.updateProduct)
  .delete(productControllers.deleteProduct);
module.exports = router;
