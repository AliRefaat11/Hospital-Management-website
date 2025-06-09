const Appointment = require('../models/Appointment');

const appointmentController = {

  // CREATE - Add new appointment
  createAppointment: async (req, res) => {
    try {
      const { doctorID, patientID, date, startingHour, status, reason } = req.body;

      // Create new appointment
      const appointment = new Appointment({
        doctorID,
        patientID,
        date,
        startingHour,
        status,
        reason
      });

      // Save to database
      const savedAppointment = await appointment.save();

      // Populate doctor and patient info
      await savedAppointment.populate('doctorID', 'name specialization');
      await savedAppointment.populate('patientID', 'name phone email');

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: savedAppointment
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to create appointment',
        error: error.message
      });
    }
  },

  // READ - Get all appointments
  getAllAppointments: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, date } = req.query;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (date) filter.date = new Date(date);

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      const appointments = await Appointment.find(filter)
        .populate('doctorID', 'name specialization')
        .populate('patientID', 'name phone email')
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
        .populate('patientID', 'name phone email address');

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

      // Build filter
      const filter = { doctorID };
      if (date) filter.date = new Date(date);
      if (status) filter.status = status;

      const appointments = await Appointment.find(filter)
        .populate('patientID', 'name phone email')
        .sort({ date: 1, startingHour: 1 });

      res.status(200).json({
        success: true,
        message: 'Doctor appointments retrieved successfully',
        data: appointments,
        count: appointments.length
      });

    } catch (error) {
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

      const appointment = await Appointment.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      ).populate('doctorID', 'name specialization')
       .populate('patientID', 'name phone email');

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

      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).populate('doctorID', 'name specialization')
       .populate('patientID', 'name phone email');

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
        message: 'Appointment deleted successfully',
        data: appointment
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete appointment',
        error: error.message
      });
    }
  },

  // EXTRA - Get today's appointments
  getTodayAppointments: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        date: {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('doctorID', 'name specialization')
        .populate('patientID', 'name phone')
        .sort({ startingHour: 1 });

      res.status(200).json({
        success: true,
        message: 'Today\'s appointments retrieved successfully',
        data: appointments,
        count: appointments.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve today\'s appointments',
        error: error.message
      });
    }
  },

  // EXTRA - Get appointments by date range
  getAppointmentsByDateRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const appointments = await Appointment.find({
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).populate('doctorID', 'name specialization')
        .populate('patientID', 'name phone')
        .sort({ date: 1, startingHour: 1 });

      res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: appointments,
        count: appointments.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve appointments',
        error: error.message
      });
    }
  }
};

module.exports = appointmentController;