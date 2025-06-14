const Doctor = require('../Models/doctorModel');
const Patient = require('../Models/patientModel');
const User = require('../Models/userModel');
const Appointment = require('../Models/appointmentModel');
const Department = require('../Models/departmentModel');
const MedicalReport = require('../Models/medicalreportModel');
const Insurance = require('../Models/insuranceModel');
const Document = require('../Models/documentModel');

const getDashboardStats = async () => {
    try {
        const totalDoctors = await Doctor.countDocuments();
        const totalPatients = await Patient.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const totalDepartments = await Department.countDocuments();
        const totalMedicalReports = await MedicalReport.countDocuments();
        const totalInsuranceRecords = await Insurance.countDocuments();
        const totalDocuments = await Document.countDocuments();

        return {
            success: true,
            data: {
                totalDoctors,
                totalPatients,
                totalUsers,
                totalAppointments,
                totalDepartments,
                totalMedicalReports,
                totalInsuranceRecords,
                totalDocuments,
            },
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message,
        };
    }
};

module.exports = {
    getDashboardStats,
};
