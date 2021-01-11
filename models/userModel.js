const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  slug: String,
  firstName: {
    type: String,
    required: [true, 'Please input your first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please input your last name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please input your email address!'],
    unique: [true, 'A user already exists with that email address!'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phone: {
    type: Number,
    required: [true, 'Please provide your phone number!'],
    unique: [true, 'A user already exists with that phone number!'],
    trim: true,
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, 'Please input a password with at least 8 characters!'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirm should match password!'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  homeAddress: [String],
  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['user', 'admin'],
      message: ['Role is either user or admin'],
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// MIDDLEWARES

userSchema.pre('save', function (next) {
  this.slug = slugify(`${this.firstName}-${this.lastName}`, { lower: true });
  next();
});

// INSTANCE METHOD TO HASH PASSWORD DURING USER SIGNUP

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the password confirm field
  this.passwordConfirm = undefined;

  next();
});

// Instance method to check if incoming password matches existing user password during user login
userSchema.methods.correctPassword = async function (
  incomingPassword,
  userPassword
) {
  return await bcrypt.compare(incomingPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // False means password not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
