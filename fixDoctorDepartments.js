const mongoose = require('mongoose');
const Doctor = require('./Models/doctorModel');
const Department = require('./Models/departmentModel');

const dbUri = 'mongodb+srv://ali2303933:pYYylBzXhc5VYTxr@cluster0.wbqfae0.mongodb.net/';

async function fixDoctorDepartments() {
  await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const doctors = await Doctor.find();
  let updatedCount = 0;
  for (const doc of doctors) {
    if (!doc.departmentId && doc.specialization) {
      const dept = await Department.findOne({ departmentName: { $regex: doc.specialization, $options: 'i' } });
      if (dept) {
        doc.departmentId = dept._id;
        await doc.save();
        console.log(`Linked doctor ${doc._id} (${doc.specialization}) to department ${dept.departmentName}`);
        updatedCount++;
      } else {
        console.log(`No department found for specialization: ${doc.specialization}`);
      }
    }
  }
  console.log(`Updated ${updatedCount} doctors.`);
  mongoose.disconnect();
}

fixDoctorDepartments().catch(err => {
  console.error('Error fixing doctor departments:', err);
  mongoose.disconnect();
}); 