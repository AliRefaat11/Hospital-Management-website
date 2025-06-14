const express = require('express');
const adminController = require('../Controllers/adminController');
const adminRouter = express.Router();

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

module.exports = adminRouter; 