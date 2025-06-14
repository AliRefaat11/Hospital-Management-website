const mongoose = require('mongoose');
const Doctor = require('./Models/doctorModel');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Sample weekly schedules for different specializations
const defaultSchedules = {
    cardiology: [
        { dayOfWeek: "Monday", timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
        { dayOfWeek: "Wednesday", timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
        { dayOfWeek: "Friday", timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] }
    ],
    dermatology: [
        { dayOfWeek: "Tuesday", timeSlots: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"] },
        { dayOfWeek: "Thursday", timeSlots: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"] },
        { dayOfWeek: "Saturday", timeSlots: ["10:00", "11:00", "12:00"] }
    ],
    orthopedics: [
        { dayOfWeek: "Monday", timeSlots: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00"] },
        { dayOfWeek: "Wednesday", timeSlots: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00"] },
        { dayOfWeek: "Friday", timeSlots: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00"] }
    ],
    pediatrics: [
        { dayOfWeek: "Tuesday", timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
        { dayOfWeek: "Thursday", timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
        { dayOfWeek: "Saturday", timeSlots: ["09:00", "10:00", "11:00"] }
    ],
    Neurology: [
        { dayOfWeek: "Monday", timeSlots: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"] },
        { dayOfWeek: "Wednesday", timeSlots: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"] },
        { dayOfWeek: "Friday", timeSlots: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"] }
    ]
};

async function updateDoctorSchedules() {
    try {
        // Get all doctors
        const doctors = await Doctor.find();
        console.log(`Found ${doctors.length} doctors to update`);

        // Update each doctor with a default schedule based on their specialization
        for (const doctor of doctors) {
            const schedule = defaultSchedules[doctor.specialization] || defaultSchedules.cardiology;
            
            // Update the doctor with the schedule
            await Doctor.findByIdAndUpdate(doctor._id, {
                weeklySchedule: schedule,
                availableDays: schedule.map(s => s.dayOfWeek)
            });

            console.log(`Updated schedule for doctor ${doctor._id} (${doctor.specialization})`);
        }

        console.log('Successfully updated all doctor schedules');
    } catch (error) {
        console.error('Error updating doctor schedules:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the update function
updateDoctorSchedules(); 