const dotenv = require('dotenv');
dotenv.config({ path: "config.env" });

const express = require('express');
const dbconnection = require('./config/database');

const DrRouter = require('./Routes/doctorRouter');
const UserRouter = require('./Routes/userRouter');
const PatRouter = require('./Routes/patientRouter');
const DocRouter = require('./Routes/documentRouter');
const DepRouter = require('./Routes/departmentRouter');
const AppRouter = require('./Routes/appointmentRouter');
const InsurRouter = require('./Routes/insuranceRouter');
const MedRouter = require('./Routes/medicalreportRouter');
const TreatRouter = require('./Routes/treatmentplanRouter');

const app = express(); // Initialize app here

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes
app.use('/User', UserRouter);
app.use('/Doctor', DrRouter);
app.use('/Patient', PatRouter);
app.use('/Document', DocRouter);
app.use('/Department', DepRouter);
app.use('/Appointment', AppRouter);
app.use('/Insurance', InsurRouter);
app.use('/Treatment', TreatRouter); // TreatRouter is used here
app.use('/MedicalReport', MedRouter);

const hostname = "127.0.0.1";
const port = 3000;

// Connect to database
dbconnection();

app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});
