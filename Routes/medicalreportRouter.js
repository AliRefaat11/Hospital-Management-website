const express = require('express');
const MedRouter = express.Router();
const medicalRecordController = require('../controllers/medicalreportController');

// Middleware for parsing form data
MedRouter.use(express.urlencoded({ extended: true }));
MedRouter.use(express.json());
MedRouter.get('/', medicalRecordController.getAllRecords);
MedRouter.get('/search', medicalRecordController.searchRecords);
MedRouter.get('/export/csv', medicalRecordController.exportRecords);
MedRouter.get('/create', medicalRecordController.getCreateForm);
MedRouter.get('/patient/:patientId', medicalRecordController.getRecordsByPatient);
MedRouter.get('/:id', medicalRecordController.getRecord);
MedRouter.get('/:id/edit', medicalRecordController.getEditForm);

MedRouter.post('/', medicalRecordController.createRecord);
MedRouter.post('/:id/update', medicalRecordController.updateRecord);
MedRouter.post('/:id/delete', medicalRecordController.deleteRecord);

MedRouter.put('/:id', medicalRecordController.updateRecord);

MedRouter.delete('/:id', medicalRecordController.deleteRecord);

MedRouter.use((err, req, res, next) => {
  console.error('Medical Records Route Error:', err);
  
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
  if (req.originalUrl.includes('/create')) {
    res.redirect('/medical-records/create');
  } else if (req.originalUrl.includes('/edit')) {
    res.redirect('/medical-records');
  } else {
    res.redirect('/medical-records');
  }
});

MedRouter.use((req, res) => {
  req.flash('error', 'The requested medical record page was not found');
  res.status(404).redirect('/medical-records');
});

module.exports = MedRouter;