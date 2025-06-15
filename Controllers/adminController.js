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

const getDashboardStats = async () => {
    // Patients by Blood Type
    const patientsByBloodType = await Patient.aggregate([
        { $group: { _id: '$bloodType', count: { $sum: 1 } } },
        { $project: { bloodType: '$_id', count: 1, _id: 0 } }
    ]);

    // Doctors by Department
    const doctorsByDepartment = await Doctor.aggregate([
        { $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'department' } },
        { $unwind: '$department' },
        { $group: { _id: '$department.departmentName', count: { $sum: 1 } } },
        { $project: { departmentName: '$_id', count: 1, _id: 0 } }
    ]);

    // Appointments by Status
    const appointmentsByStatus = await Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Monthly Appointments (Last 6 months example)
    const monthlyAppointments = await Appointment.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$appointmentDate' } }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
        { $limit: 6 }, // Adjust as needed
        { $project: { month: '$_id', count: 1, _id: 0 } }
    ]);

    // Get basic counts
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalDepartments = await Department.countDocuments();

    // Placeholder values for other stats needed by adminStat.ejs
    const availableDoctors = totalDoctors; // Assuming all doctors are available for now
    const averageAppointmentTime = 30; // Placeholder in minutes
    const onTimeRate = 95; // Placeholder percentage
    const coverageRate = 80; // Placeholder percentage

    const usersCount = await User.countDocuments();
    const adminsCount = await User.countDocuments({ role: 'Admin' });

    return {
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalDepartments,
        availableDoctors,
        averageAppointmentTime,
        onTimeRate,
        coverageRate,
        patientsByBloodType,
        doctorsByDepartment,
        appointmentsByStatus,
        monthlyAppointments,
        // Also include the basic counts as adminStat.ejs expects them directly for the top cards
        usersCount: usersCount,
        // Use the fetched counts for these as well
        patientsCount: totalPatients,
        doctorsCount: totalDoctors,
        adminsCount: adminsCount
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
    getDashboardData,
    getDashboardStats
};