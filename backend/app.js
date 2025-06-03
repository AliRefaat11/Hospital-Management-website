const express = require('express');
const DocRouter = require('./routes/Doctor_router');
const PatRouter = require('./routes/patient_router');
const AppRouter = require('./routes/appointment_router');
const app = express();

app.use(express.static("./frontend"));
app.use('/Doctors', DocRouter);
app.use('/Patients', PatRouter);
app.use('/Appointments', AppRouter);

const port = 3000;



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});