const mongoose = require('mongoose');
// const Department = require('./Models/departmentModel');

const dbUri = process.env.MONGODB_URI || 'mongodb+srv://ali2303933:pYYylBzXhc5VYTxr@cluster0.wbqfae0.mongodb.net/';

async function createDermatologyDepartment() {
  await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
  let dept = await Department.findOne({ departmentName: { $regex: '^dermatology$', $options: 'i' } });
  if (dept) {
    console.log('Dermatology department already exists:', dept);
  } else {
    dept = await Department.create({
      departmentName: 'dermatology',
      description: 'Handles all skin-related issues.'
    });
    console.log('Created dermatology department:', dept);
  }
  mongoose.disconnect();
}

createDermatologyDepartment().catch(err => {
  console.error('Error creating dermatology department:', err);
  mongoose.disconnect();
}); 