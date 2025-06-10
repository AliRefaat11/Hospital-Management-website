const dotenv = require('dotenv');
dotenv.config({path:"config.env"});
const dbconnection = require('./config/database');
const path = require('path');
const express = require('express');
const app = express();

const DrRouter = require('./Routes/doctorRouter');
const UserRouter = require('./Routes/userRouter');
const PatRouter = require('./Routes/patientRouter');
const DocRouter = require('./Routes/documentRouter');
const DepRouter = require('./Routes/departmentRouter');
const AppRouter = require('./Routes/appointmentRouter');
const InsurRouter = require('./Routes/insuranceRouter');
const MedRouter = require('./Routes/medicalreportRouter');
const TreatRouter = require('./Routes/treatmentplanRouter');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
});

app.get('/signup', (req, res) => {
    res.render('signupPage', { 
        title: 'Patient Sign Up',
        formTitle: 'Create Patient Account',
        currentPage: 'signup'
    });
});

app.get('/login', (req, res) => {
    res.render('loginPage', { 
        title: 'Patient Login',
        formTitle: 'Login to PrimeCare',
        currentPage: 'login',
        siteName: 'Prime Care'
    });
});

app.use('/User', UserRouter);
app.use('/Doctor', DrRouter);
app.use('/Patient', PatRouter);
app.use('/Document', DocRouter);
app.use('/Department', DepRouter);
app.use('/Appointment', AppRouter);
app.use('/Insurance', InsurRouter);
app.use('/Treatment', TreatRouter);
app.use('/MedicalReport', MedRouter);

const hostname = "127.0.0.1";
const port = 3000;

dbconnection();

app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});