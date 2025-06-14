const express = require('express');
const router = express.Router();
const User = require('../Models/userModel');
const Doctor = require('../Models/doctorModel');
const Patient = require('../Models/patientModel');

// Get dashboard statistics
router.get('/statistics', async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const patientsCount = await Patient.countDocuments();
        const doctorsCount = await Doctor.countDocuments();
        
        // Since we don't have separate admin and staff models,
        // we'll count them from the User model based on role
        const adminsCount = await User.countDocuments({ role: 'admin' });
        const staffCount = await User.countDocuments({ role: 'staff' });

        res.render('dashboard', {
            usersCount,
            patientsCount,
            doctorsCount,
            adminsCount,
            staffCount
        });
    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        res.status(500).render('errorPage', {
            message: 'Error loading dashboard statistics'
        });
    }
});

module.exports = router; 