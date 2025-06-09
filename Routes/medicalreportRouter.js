const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

// Middleware for parsing form data
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Method override for PUT and DELETE requests from HTML forms
const methodOverride = require('method-override');
router.use(methodOverride('_method'));

// GET ROUTES

// Display all medical records - Main index page
router.get('/', medicalRecordController.getAllRecords);

// Show search page and handle search queries
router.get('/search', medicalRecordController.searchRecords);

// Export records to CSV
router.get('/export/csv', medicalRecordController.exportRecords);

// Show form to create new medical record
router.get('/create', medicalRecordController.getCreateForm);

// Show all records for a specific patient
router.get('/patient/:patientId', medicalRecordController.getRecordsByPatient);

// Show single medical record details (must be after other GET routes)
router.get('/:id', medicalRecordController.getRecord);

// Show form to edit existing medical record
router.get('/:id/edit', medicalRecordController.getEditForm);

// POST ROUTES

// Create new medical record
router.post('/', medicalRecordController.createRecord);

// Alternative POST route for updates (for forms that can't use PUT)
router.post('/:id/update', medicalRecordController.updateRecord);

// Alternative POST route for deletes (for forms that can't use DELETE)
router.post('/:id/delete', medicalRecordController.deleteRecord);

// PUT ROUTES

// Update medical record via PUT method
router.put('/:id', medicalRecordController.updateRecord);

// DELETE ROUTES

// Delete medical record via DELETE method
router.delete('/:id', medicalRecordController.deleteRecord);

// ERROR HANDLING

// Error handling middleware specific to medical records routes
router.use((err, req, res, next) => {
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
router.use((req, res) => {
  req.flash('error', 'The requested medical record page was not found');
  res.status(404).redirect('/medical-records');
});

module.exports = router;