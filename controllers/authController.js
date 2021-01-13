const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    homeAddress,
    password,
    passwordConfirm,
  } = req.body;

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    homeAddress,
    phone,
    password,
    passwordConfirm,
  });

  // create and sign token
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // if everything is ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  }

  // Verify signToken
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exits
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError('The user that has this token no longer exist.', 401)
    );
  }

  //Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, please log in again.', 401)
    );
  }

  // Grant access to protected routes

  // Put user details in to the global request
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user']

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1. Find user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Ther is no user with that email address', 404));
  }

  // 2. Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password?? Please click on the link below to reset your password.\nIf you didn't forget your password, please ignore this email!\n\n${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token. (Only valid for 10mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link has been sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token has not expired, and the user exist, set the new passwordResetToken
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.PasswordResetExpires = undefined;
  await user.save();

  // 3. Update changedPasswordAt property for the user

  // 4. Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});