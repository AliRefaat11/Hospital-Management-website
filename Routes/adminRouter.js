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

// Admin Dashboard Route
adminRouter.get('/dashboard', auth, allowedTo('Admin'), adminController.getDashboardData);

module.exports = adminRouter;