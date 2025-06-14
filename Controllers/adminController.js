const Appointment = require('../Models/appointmentModel');

const Department = require('../Models/departmentModel');
const Doctor = require('../Models/doctorModel');

const Document = require('../Models/documentModel');
const Insurance = require('../Models/insuranceModel');
const MedicalReport = require('../Models/medicalreportModel');
const Patient = require('../Models/patientModel');
const TreatmentPlan = require('../Models/treatmentplanModel');
const User = require('../Models/userModel');

const getUsersAndRolesCounts = async () => {
    const usersCount = await User.countDocuments();
    const patientsCount = await Patient.countDocuments();
    const doctorsCount = await Doctor.countDocuments();
    const appointmentsCount = await Appointment.countDocuments(); 
    const adminsCount = await User.countDocuments({ role: 'Admin' });

    return {
        usersCount,
        patientsCount,
        doctorsCount,
        adminsCount,
        appointmentsCount,
    };
};

const getDashboardData = async (req, res, next) => {
    try {
        const usersCount = await User.countDocuments();
        const patientsCount = await Patient.countDocuments();
        const doctorsCount = await Doctor.countDocuments();
        const appointmentsCount = await Appointment.countDocuments();
        const departmentsCount = await Department.countDocuments();
        const adminsCount = await User.countDocuments({ role: 'Admin' });

        res.render('dashboard', {
            usersCount,
            patientsCount,
            doctorsCount,
            appointmentsCount,
            departmentsCount,
            adminsCount,
            currentPage: 'dashboard'
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        next(error);
    }
};

module.exports = {
    getUsersAndRolesCounts,
    getDashboardData
};