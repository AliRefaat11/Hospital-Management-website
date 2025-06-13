const Appointment = require('../Models/appointmentModel');
const Doctor = require('../Models/doctorModel');
const Department = require('../Models/departmentModel');
const User = require('../Models/userModel');
const jwt = require('jsonwebtoken');

const appointmentController = {

  // CREATE - Add new appointment
  createAppointment: async (req, res) => {
    try {
      const { doctor, patientID, date, startingHour, status, reason } = req.body;
      console.log('Received doctor in createAppointment (now as doctor):', doctor);

      // Validate doctor exists
      const doctorFound = await Doctor.findById(doctor);
      if (!doctorFound) {
        return { success: false, message: 'Doctor not found' };
      }

      // Validate patient exists
      const patient = await User.findById(patientID);
      if (!patient) {
        return { success: false, message: 'Patient not found' };
      }

      // Check for conflicting appointments
      const existingAppointment = await Appointment.findOne({
        doctorID: doctor,
        date,
        startingHour,
        status: { $nin: ['cancelled', 'no-show'] }
      });

      if (existingAppointment) {
        return { success: false, message: 'Time slot is already booked' };
      }

      // Create new appointment
      const appointment = new Appointment({
        doctorID: doctor,
        patientID,
        date,
        startingHour,
        status: status || 'scheduled',
        reason
      });

      // Save to database
      const savedAppointment = await appointment.save();

      // Populate doctor and patient info
      await savedAppointment.populate('doctorID', 'name specialization');
      await savedAppointment.populate('patientID', 'FName LName email');

      return { success: true, message: 'Appointment created successfully', data: savedAppointment };

    } catch (error) {
      console.error('Create appointment error:', error);
      return { success: false, message: 'Failed to create appointment', error: error.message };
    }
  },

  // READ - Get all appointments
  getAllAppointments: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, date, doctorID, patientID } = req.query;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (date) filter.date = new Date(date);
      if (doctorID) filter.doctorID = doctorID;
      if (patientID) filter.patientID = patientID;

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      const appointments = await Appointment.find(filter)
        .populate('doctorID', 'name specialization')
        .populate('patientID', 'FName LName email')
        .sort({ date: 1, startingHour: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Appointment.countDocuments(filter);

      res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: appointments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: appointments.length,
          totalRecords: total
        }
      });

    } catch (error) {
      console.error('Get all appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve appointments',
        error: error.message
      });
    }
  },

  // READ - Get appointment by ID
  getAppointmentById: async (req, res) => {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id)
        .populate('doctorID', 'name specialization phone email')
        .populate('patientID', 'FName LName email phone');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment retrieved successfully',
        data: appointment
      });

    } catch (error) {
      console.error('Get appointment by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve appointment',
        error: error.message
      });
    }
  },

  // READ - Get appointments by doctor
  getAppointmentsByDoctor: async (req, res) => {
    try {
      const { doctorID } = req.params;
      const { date, status } = req.query;

      // Validate doctor exists
      const doctor = await Doctor.findById(doctorID);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      // Build filter
      const filter = { doctorID };
      if (date) filter.date = new Date(date);
      if (status) filter.status = status;

      const appointments = await Appointment.find(filter)
        .populate('patientID', 'FName LName email phone')
        .sort({ date: 1, startingHour: 1 });

      res.status(200).json({
        success: true,
        message: 'Doctor appointments retrieved successfully',
        data: appointments,
        count: appointments.length
      });

    } catch (error) {
      console.error('Get doctor appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctor appointments',
        error: error.message
      });
    }
  },

  // READ - Get appointments by patient
  getAppointmentsByPatient: async (req, res) => {
    try {
      const { patientID } = req.params;
      const { status } = req.query;

      // Validate patient exists
      const patient = await User.findById(patientID);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Build filter
      const filter = { patientID };
      if (status) filter.status = status;

      const appointments = await Appointment.find(filter)
        .populate('doctorID', 'name specialization')
        .sort({ date: 1, startingHour: 1 });

      res.status(200).json({
        success: true,
        message: 'Patient appointments retrieved successfully',
        data: appointments,
        count: appointments.length
      });

    } catch (error) {
      console.error('Get patient appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve patient appointments',
        error: error.message
      });
    }
  },

  // UPDATE - Update appointment
  updateAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check for conflicting appointments if time is being updated
      if (updateData.date || updateData.startingHour) {
        const existingAppointment = await Appointment.findOne({
          _id: { $ne: id },
          doctorID: updateData.doctorID,
          date: updateData.date,
          startingHour: updateData.startingHour,
          status: { $nin: ['cancelled', 'no-show'] }
        });

        if (existingAppointment) {
          return res.status(400).json({
            success: false,
            message: 'Time slot is already booked'
          });
        }
      }

      const appointment = await Appointment.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      ).populate('doctorID', 'name specialization')
       .populate('patientID', 'FName LName email');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: appointment
      });

    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update appointment',
        error: error.message
      });
    }
  },

  // UPDATE - Update appointment status
  updateAppointmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment status'
        });
      }

      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).populate('doctorID', 'name specialization')
       .populate('patientID', 'FName LName email');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        data: appointment
      });

    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update appointment status',
        error: error.message
      });
    }
  },

  // DELETE - Delete appointment
  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByIdAndDelete(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully'
      });

    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete appointment',
        error: error.message
      });
    }
  },

  // READ - Get today's appointments
  getTodayAppointments: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const appointments = await Appointment.find({
        date: today
      })
      .populate('doctorID', 'name specialization')
      .populate('patientID', 'FName LName email')
      .sort({ startingHour: 1 });

      res.status(200).json({
        success: true,
        message: 'Today\'s appointments retrieved successfully',
        data: appointments,
        count: appointments.length
      });

    } catch (error) {
      console.error('Get today appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve today\'s appointments',
        error: error.message
      });
    }
  },

  // READ - Get appointments by date range
  getAppointmentsByDateRange: async (req, res) => {
    try {
      const { startDate, endDate, status } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const filter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      if (status) filter.status = status;

      const appointments = await Appointment.find(filter)
        .populate('doctorID', 'name specialization')
        .populate('patientID', 'FName LName email')
        .sort({ date: 1, startingHour: 1 });

      res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: appointments,
        count: appointments.length
      });

    } catch (error) {
      console.error('Get date range appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve appointments',
        error: error.message
      });
    }
  },

  // Render book appointment page
  renderBookAppointmentPage: async (req, res) => {
    try {
      const doctorId = req.query.doctor; 
      let selectedDoctor = null;
      if (doctorId) {
          selectedDoctor = await Doctor.findById(doctorId)
              .populate('userId', 'FName LName')
              .populate('departmentId', 'departmentName');
      }

      // Fetch all doctors for the dropdown, including their availableDays and weeklySchedule
      const doctors = await Doctor.find()
          .populate('userId', 'FName LName')
          .populate('departmentId', 'departmentName');

      const departments = await Department.find();

      let user = null;
      try {
          const token = req.cookies?.token;
          if (token) {
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              user = await User.findById(decoded.id).select('-Password');
          }
      } catch (error) {
          console.log('Token verification failed:', error.message);
      }

      res.render('bookAppointment', {
          departments,
          user,
          selectedDoctor: selectedDoctor ? {
              _id: selectedDoctor._id,
              userId: selectedDoctor.userId,
              departmentId: selectedDoctor.departmentId,
              specialization: selectedDoctor.specialization,
              rating: selectedDoctor.rating,
              departmentName: selectedDoctor.departmentName,
              weeklySchedule: selectedDoctor.weeklySchedule || [] // Ensure weeklySchedule is passed for selectedDoctor
          } : null,
          doctors: doctors.map(doc => ({
              _id: doc._id,
              userId: doc.userId,
              departmentId: doc.departmentId,
              specialization: doc.specialization,
              rating: doc.rating,
              departmentName: doc.departmentName,
              weeklySchedule: doc.weeklySchedule
          })),
          currentPage: 'book',
          siteName: 'PrimeCare'
      });
    } catch (error) {
      console.error("Error rendering book appointment page:", error);
      res.status(500).send("Error loading booking page.");
    }
  },

  // Render quick appointment page
  renderQuickAppointmentPage: async (req, res) => {
    try {
        const departments = await Department.find();
        let user = null;
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
            }
        } catch (error) {
            console.log('Token verification failed:', error.message);
        }
        res.render('quickAppointment', { 
            departments, 
            user, 
            currentPage: 'appointments',
            siteName: 'PrimeCare'
        });
    } catch (error) {
        console.error("Error rendering quick appointment page:", error);
        res.status(500).send("Error loading quick appointment page.");
    }
  }
};

module.exports = appointmentController;