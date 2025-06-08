const DocRouter = require('./routes/doctorRouter');
const PatRouter = require('./routes/patientRouter');
const AppRouter = require('./routes/appointmentRouter');

const express = require('express');
const app = express();

app.use(express.static("./frontend"));
app.use('/Doctor', DocRouter);
app.use('/Patient', PatRouter);
app.use('/Appointment', AppRouter);

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});