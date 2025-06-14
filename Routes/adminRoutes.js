const express = require('express');
const adminController = require('../Controllers/adminController');
const adminRouter = express.Router();

// Route to get dashboard statistics
adminRouter.get('/dashboard-stats', adminController.getDashboardStats);

module.exports = adminRouter; 