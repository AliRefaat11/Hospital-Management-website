const DocRouter = require('./Routes/doctorRouter');
const PatRouter = require('./Routes/patientRouter');
const AppRouter = require('./Routes/apointmentRouter');
const dotenv = require('dotenv');
dotenv.config({path:"config.env"});
const dbconnection = require('./config/database');

const express = require('express');
const app = express();

// app.use(express.static("./frontend"));
app.use('/Doctor', DocRouter);
// app.use('/Patient', PatRouter);
// app.use('/Appointment', AppRouter);

const hostname = "127.0.0.1";
const port = 3000;

dbconnection();

app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});