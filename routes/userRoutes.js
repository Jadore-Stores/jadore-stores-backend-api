const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);

router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  userController.getAllUsers
);

router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.deleteUser
);

module.exports = router;
