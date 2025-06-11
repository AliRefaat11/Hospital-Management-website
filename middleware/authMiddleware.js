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
  
exports.allowedTo = (...roles) =>
    asyncHandler(async (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ApiError("You are not allowed to access this route", 403)
        );
      }
      next();
    });