const express = require('express');
const MedRouter = express.Router();
const medicalRecordController = require('../controllers/medicalreportController');

// Middleware for parsing form data
MedRouter.use(express.urlencoded({ extended: true }));
MedRouter.use(express.json());

// Method override for PUT and DELETE requests from HTML forms
//const methodOverride = require('method-override');
//MedRouter.use(methodOverride('_method'));

// GET ROUTES

// Display all medical records - Main index page
MedRouter.get('/', medicalRecordController.getAllRecords);

// Show search page and handle search queries
MedRouter.get('/search', medicalRecordController.searchRecords);

// Export records to CSV
MedRouter.get('/export/csv', medicalRecordController.exportRecords);

// Show form to create new medical record
MedRouter.get('/create', medicalRecordController.getCreateForm);

// Show all records for a specific patient
MedRouter.get('/patient/:patientId', medicalRecordController.getRecordsByPatient);

// Show single medical record details (must be after other GET routes)
MedRouter.get('/:id', medicalRecordController.getRecord);

// Show form to edit existing medical record
MedRouter.get('/:id/edit', medicalRecordController.getEditForm);

// POST ROUTES

// Create new medical record
MedRouter.post('/', medicalRecordController.createRecord);

// Alternative POST route for updates (for forms that can't use PUT)
MedRouter.post('/:id/update', medicalRecordController.updateRecord);

// Alternative POST route for deletes (for forms that can't use DELETE)
MedRouter.post('/:id/delete', medicalRecordController.deleteRecord);

// PUT ROUTES

// Update medical record via PUT method
MedRouter.put('/:id', medicalRecordController.updateRecord);

// DELETE ROUTES

// Delete medical record via DELETE method
MedRouter.delete('/:id', medicalRecordController.deleteRecord);

MedRouter.use((err, req, res, next) => {
  console.error('Medical Records Route Error:', err);
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    req.flash('error', `Validation Error: ${errors.join(', ')}`);
  } else if (err.name === 'CastError') {
    req.flash('error', 'Invalid medical record ID');
  } else if (err.code === 11000) {
    req.flash('error', 'Duplicate entry found');
  } else {
    req.flash('error', 'An error occurred while processing your request');
  }
  
  // Redirect to appropriate page based on the original URL
  if (req.originalUrl.includes('/create')) {
    res.redirect('/medical-records/create');
  } else if (req.originalUrl.includes('/edit')) {
    res.redirect('/medical-records');
  } else {
    res.redirect('/medical-records');
  }
});

// 404 handler for medical records routes
MedRouter.use((req, res) => {
  req.flash('error', 'The requested medical record page was not found');
  res.status(404).redirect('/medical-records');
});

module.exports = MedRouter;