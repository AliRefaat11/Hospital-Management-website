const express = require('express');
const AppRouter = express.Router();
const appointmentController = require('../Controllers/appointmentController');

const validateAppointment = (req, res, next) => {
  const { doctorID, patientID, date, startingHour, reason } = req.body;
  
  if (!doctorID) {
    return res.status(400).json({
      success: false,
      message: 'Doctor ID is required'
    });
  }
  
  if (!patientID) {
    return res.status(400).json({
      success: false,
      message: 'Patient ID is required'
    });
  }
  
  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required'
    });
  }
  
  if (!startingHour) {
    return res.status(400).json({
      success: false,
      message: 'Starting hour is required'
    });
  }
  
  if (!reason || reason.length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Reason is required and must be at least 5 characters'
    });
  }
  
  next();
};

// Middleware to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const { id, doctorID, patientID } = req.params;
  const mongoose = require('mongoose');
  
  const idToCheck = id || doctorID || patientID;
  
  if (idToCheck && !mongoose.Types.ObjectId.isValid(idToCheck)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

AppRouter.get('/book', appointmentController.renderBookingPage);
AppRouter.post('/', validateAppointment, appointmentController.createAppointment);
AppRouter.get('/', appointmentController.getAllAppointments);
AppRouter.get('/today', appointmentController.getTodayAppointments);
AppRouter.get('/date-range', appointmentController.getAppointmentsByDateRange);
AppRouter.get('/:id', validateObjectId, appointmentController.getAppointmentById);
AppRouter.get('/doctor/:doctorID', validateObjectId, appointmentController.getAppointmentsByDoctor);
AppRouter.get('/patient/:patientID', validateObjectId, appointmentController.getAppointmentsByPatient);
AppRouter.put('/:id', validateObjectId, appointmentController.updateAppointment);
AppRouter.patch('/:id/status', validateObjectId, appointmentController.updateAppointmentStatus);
AppRouter.delete('/:id', validateObjectId, appointmentController.deleteAppointment);

module.exports = AppRouter;

// ============================================
// API ENDPOINTS SUMMARY
// ============================================

/*
Available Endpoints:

POST   /api/appointments                    - Create new appointment
GET    /api/appointments                    - Get all appointments (with pagination)
GET    /api/appointments/today              - Get today's appointments
GET    /api/appointments/date-range         - Get appointments by date range
GET    /api/appointments/:id                - Get appointment by ID
GET    /api/appointments/doctor/:doctorID   - Get doctor's appointments
GET    /api/appointments/patient/:patientID - Get patient's appointments
PUT    /api/appointments/:id                - Update appointment
PATCH  /api/appointments/:id/status         - Update appointment status only
DELETE /api/appointments/:id                - Delete appointment

Query Parameters:
- page: Page number for pagination (default: 1)
- limit: Items per page (default: 10)
- status: Filter by appointment status
- date: Filter by specific date
- startDate & endDate: For date range queries

Example Requests:

1. Create Appointment:
POST /api/appointments
{
  "doctorID": "60d5ec49f1b2c8b1f8e4c1a1",
  "patientID": "60d5ec49f1b2c8b1f8e4c1a2",
  "date": "2024-12-15",
  "startingHour": "10:30",
  "reason": "Regular checkup"
}

2. Get All Appointments (with pagination):
GET /api/appointments?page=1&limit=10&status=scheduled

3. Get Doctor's Appointments:
GET /api/appointments/doctor/60d5ec49f1b2c8b1f8e4c1a1?date=2024-12-15

4. Update Appointment Status:
PATCH /api/appointments/60d5ec49f1b2c8b1f8e4c1a3/status
{
  "status": "completed"
}

5. Get Appointments by Date Range:
GET /api/appointments/date-range?startDate=2024-12-01&endDate=2024-12-31
*/