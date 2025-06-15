const express = require('express');
const adminController = require('../Controllers/adminController');
const adminRouter = express.Router();
const { auth, allowedTo } = require('../middleware/authMiddleware');

adminRouter.get('/stats/users-roles-counts', async (req, res, next) => {
    try {
        const counts = await adminController.getUsersAndRolesCounts();
        res.status(200).json({
            status: "success",
            data: {
                usersCount: counts.usersCount,
                patientsCount: counts.patientsCount,
                doctorsCount: counts.doctorsCount,
                adminsCount: counts.adminsCount,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Main Admin Dashboard Page Route (dashboard.ejs)
adminRouter.get('/dashboard', auth, allowedTo('Admin'), adminController.getDashboardData);

// Admin Statistics Page Route (adminStat.ejs) - For dynamic tab loading
adminRouter.get('/tabs/statistics', auth, allowedTo('Admin'), async (req, res, next) => {
    try {
        const stats = await adminController.getDashboardStats();
        let admin = { FName: "Admin", LName: "User", role: "Administrator" }; // Placeholder admin data
        res.render('adminStat', { stats, admin, currentPage: 'stats' });
    } catch (error) {
        console.error("Error rendering admin stats tab page:", error);
        next(error);
    }
});

// Doctor Management Page Route (doctorManagement.ejs) - For dynamic tab loading
adminRouter.get('/doctor-management', auth, allowedTo('Admin'), (req, res) => {
    res.render('doctorManagement', { currentPage: 'doctor-management' });
});

// Patient Management Page Route (patientManagement.ejs) - For dynamic tab loading
adminRouter.get('/patient-management', auth, allowedTo('Admin'), (req, res) => {
    res.render('patientManagement', { currentPage: 'patient-management' });
});

// API Route for Dashboard Totals (used by dashboard.js for combined stats)
adminRouter.get('/stats/all', auth, allowedTo('Admin'), async (req, res, next) => {
    try {
        const stats = await adminController.getDashboardStats();
        res.status(200).json({
            status: "success",
            data: stats, // Return all stats in one go
        });
    } catch (error) {
        console.error("Error fetching all dashboard stats:", error);
        next(error);
    }
});

module.exports = adminRouter;