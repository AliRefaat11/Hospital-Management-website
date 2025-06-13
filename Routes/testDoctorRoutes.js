const express = require("express");
const TestDrRouter = express.Router();

// Temporary route to render doctorManagement.ejs with dummy data (bypasses auth and real DB data)
TestDrRouter.get('/simple-manage', async (req, res) => {
    try {
        console.log('Accessing /doctors/simple-manage route (DEBUGGING - NO AUTH).');

        // Dummy data for testing - ensure 'admin' object has 'profileImage' and 'name' properties
        const doctors = [
            {
                _id: 'doc1',
                userId: { FName: 'Dummy', LName: 'Doctor', Email: 'dummy@example.com' },
                departmentId: { departmentName: 'General Practice' },
                specialization: 'General Practitioner',
                lastActive: new Date(),
                status: 'active'
            }
        ];

        const departments = [{ _id: 'dep1', departmentName: 'General Practice' }];
        const specializations = ['General Practitioner', 'Cardiologist'];
        const employmentTypes = ['Full-Time', 'Part-Time'];

        const admin = {
            _id: 'adminTest',
            FName: 'Test',
            LName: 'User',
            name: 'Test User', // Ensure 'name' property is present
            Email: 'test@example.com',
            PhoneNumber: '123-456-7890',
            Gender: 'Male',
            Age: 30,
            role: 'System Administrator',
            profileImage: '/images/admin-avatar.png' // Ensure 'profileImage' property is present
        };

        const stats = {
            totalDoctors: 1,
            doctorsChange: 0,
            activeDoctors: 1,
            specialistDoctors: 0,
            generalDoctors: 1
        };

        const activities = [
            { icon: 'fa-info-circle', description: 'Test activity', timestamp: new Date() }
        ];

        res.render('doctorManagement', {
            doctors,
            departments,
            specializations,
            employmentTypes,
            admin,
            stats,
            activities,
            currentPage: 'doctors-management'
        });

    } catch (error) {
        console.error("Error rendering simple doctor management page:", error);
        res.status(500).send("Error loading simple doctor management page.");
    }
});

module.exports = TestDrRouter; 