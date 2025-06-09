const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient'); // Assuming you have a Patient model

// Display all medical records
exports.getAllRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patientId', 'name email') // Populate patient details
      .sort({ date: -1 });
    
    res.render('medical-records/index', {
      title: 'Medical Records',
      records: records,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    req.flash('error', 'Failed to fetch medical records');
    res.redirect('/');
  }
};

// Display form to create new medical record
exports.getCreateForm = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ name: 1 });
    
    res.render('medical-records/create', {
      title: 'Add New Medical Record',
      patients: patients,
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error loading create form:', error);
    req.flash('error', 'Failed to load form');
    res.redirect('/medical-records');
  }
};

// Create new medical record
exports.createRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, treatment, date, notes } = req.body;
    
    const newRecord = new MedicalRecord({
      patientId,
      diagnosis,
      treatment,
      date: new Date(date),
      notes
    });
    
    await newRecord.save();
    req.flash('success', 'Medical record created successfully');
    res.redirect('/medical-records');
  } catch (error) {
    console.error('Error creating medical record:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      req.flash('error', errors.join(', '));
    } else {
      req.flash('error', 'Failed to create medical record');
    }
    
    res.redirect('/medical-records/create');
  }
};

// Display single medical record
exports.getRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patientId', 'name email phone dateOfBirth');
    
    if (!record) {
      req.flash('error', 'Medical record not found');
      return res.redirect('/medical-records');
    }
    
    res.render('medical-records/show', {
      title: 'Medical Record Details',
      record: record,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    req.flash('error', 'Failed to fetch medical record');
    res.redirect('/medical-records');
  }
};

// Display form to edit medical record
exports.getEditForm = async (req, res) => {
  try {
    const [record, patients] = await Promise.all([
      MedicalRecord.findById(req.params.id),
      Patient.find().sort({ name: 1 })
    ]);
    
    if (!record) {
      req.flash('error', 'Medical record not found');
      return res.redirect('/medical-records');
    }
    
    res.render('medical-records/edit', {
      title: 'Edit Medical Record',
      record: record,
      patients: patients,
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error loading edit form:', error);
    req.flash('error', 'Failed to load edit form');
    res.redirect('/medical-records');
  }
};

// Update medical record
exports.updateRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, treatment, date, notes } = req.body;
    
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      {
        patientId,
        diagnosis,
        treatment,
        date: new Date(date),
        notes
      },
      { new: true, runValidators: true }
    );
    
    if (!record) {
      req.flash('error', 'Medical record not found');
      return res.redirect('/medical-records');
    }
    
    req.flash('success', 'Medical record updated successfully');
    res.redirect(`/medical-records/${record._id}`);
  } catch (error) {
    console.error('Error updating medical record:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      req.flash('error', errors.join(', '));
    } else {
      req.flash('error', 'Failed to update medical record');
    }
    
    res.redirect(`/medical-records/${req.params.id}/edit`);
  }
};

// Delete medical record
exports.deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    
    if (!record) {
      req.flash('error', 'Medical record not found');
      return res.redirect('/medical-records');
    }
    
    req.flash('success', 'Medical record deleted successfully');
    res.redirect('/medical-records');
  } catch (error) {
    console.error('Error deleting medical record:', error);
    req.flash('error', 'Failed to delete medical record');
    res.redirect('/medical-records');
  }
};

// Get records by patient ID
exports.getRecordsByPatient = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.params.patientId })
      .populate('patientId', 'name email')
      .sort({ date: -1 });
    
    if (records.length === 0) {
      req.flash('error', 'No medical records found for this patient');
      return res.redirect('/medical-records');
    }
    
    res.render('medical-records/patient-records', {
      title: `Medical Records - ${records[0].patientId.name}`,
      records: records,
      patient: records[0].patientId,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error fetching patient records:', error);
    req.flash('error', 'Failed to fetch patient records');
    res.redirect('/medical-records');
  }
};

// Search medical records
exports.searchRecords = async (req, res) => {
  try {
    const { query, dateFrom, dateTo } = req.query;
    let searchCriteria = {};
    
    if (query) {
      searchCriteria.$or = [
        { diagnosis: { $regex: query, $options: 'i' } },
        { treatment: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (dateFrom || dateTo) {
      searchCriteria.date = {};
      if (dateFrom) searchCriteria.date.$gte = new Date(dateFrom);
      if (dateTo) searchCriteria.date.$lte = new Date(dateTo);
    }
    
    const records = await MedicalRecord.find(searchCriteria)
      .populate('patientId', 'name email')
      .sort({ date: -1 });
    
    res.render('medical-records/search-results', {
      title: 'Search Results',
      records: records,
      searchQuery: query,
      dateFrom: dateFrom,
      dateTo: dateTo,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error searching medical records:', error);
    req.flash('error', 'Search failed');
    res.redirect('/medical-records');
  }
};

// Export records to CSV (optional)
exports.exportRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patientId', 'name email')
      .sort({ date: -1 });
    
    // Set CSV headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=medical-records.csv');
    
    // CSV header row
    let csv = 'Date,Patient Name,Patient Email,Diagnosis,Treatment,Notes\n';
    
    // Add data rows
    records.forEach(record => {
      const date = record.date.toISOString().split('T')[0];
      const patientName = record.patientId ? record.patientId.name : 'Unknown';
      const patientEmail = record.patientId ? record.patientId.email : 'Unknown';
      const diagnosis = record.diagnosis.replace(/"/g, '""');
      const treatment = record.treatment.replace(/"/g, '""');
      const notes = (record.notes || '').replace(/"/g, '""');
      
      csv += `"${date}","${patientName}","${patientEmail}","${diagnosis}","${treatment}","${notes}"\n`;
    });
    
    res.send(csv);
  } catch (error) {
    console.error('Error exporting records:', error);
    req.flash('error', 'Export failed');
    res.redirect('/medical-records');
  }
};