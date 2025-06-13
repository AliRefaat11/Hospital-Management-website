const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Patient = require("../Models/patientModel");
const User = require('../Models/userModel');

class ApiError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
      this.isOperational = true;
    }
  }
  
exports.ApiError = ApiError;

exports.createToken = (payload) =>
    jwt.sign({ id: payload }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  
exports.auth = asyncHandler(async (req, res, next) => {
    let token;
<<<<<<< HEAD
    console.log('Auth Middleware - req.headers.authorization:', req.headers.authorization);
    console.log('Auth Middleware - req.cookies:', req.cookies);

    // 1. Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.toLowerCase().startsWith("bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log('Auth Middleware - Token after header check:', token);

    // 2. If not found in header, check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    console.log('Auth Middleware - Token after cookie check:', token);

    if (!token) {
      return next(new ApiError("Please login to get access", 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ApiError("User not found", 401));
      }
      // Only check passwordChangedAt if it exists
      if (user.passwordChangedAt) {
        const passwordChangedTimeStamp = parseInt(
          user.passwordChangedAt.getTime() / 1000,
          10
        );
        if (passwordChangedTimeStamp > decoded.iat) {
          return next(new ApiError("user changed password, login again", 401));
        }
      }
      req.user = user; // Attach user to request object
      res.locals.user = user; // Make user available to EJS templates
      next();
    } catch (err) {
      // Handle invalid token or expired token
      return next(new ApiError("Invalid or expired token. Please login again.", 401));
    }
});
=======
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(new ApiError("Please login to get access", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError("User not found", 401));
    }
    const passwordChangedTimeStamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimeStamp > decoded.iat) {
      return next(new ApiError("user changed password, login again", 401));
    }
    req.user = user;
    next();
  });
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
  
exports.allowedTo = (...roles) =>
    asyncHandler(async (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ApiError("You are not allowed to access this route", 403)
        );
      }
      next();
    });