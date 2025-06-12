const mongoose = require('mongoose');
const Doctor = require('./Models/doctorModel');
const Department = require('./Models/departmentModel');

const dbUri = 'mongodb+srv://ali2303933:pYYylBzXhc5VYTxr@cluster0.wbqfae0.mongodb.net/';

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const doctors = await Doctor.find().populate('departmentId', 'departmentName');
    if (doctors.length === 0) {
      console.log('No doctors found in the database.');
    } else {
      doctors.forEach(doc => {
        console.log({
          _id: doc._id,
          specialization: doc.specialization,
          departmentId: doc.departmentId ? doc.departmentId._id : null,
          departmentName: doc.departmentId ? doc.departmentId.departmentName : null
        });
      });
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('DB connection error:', err);
  }); 