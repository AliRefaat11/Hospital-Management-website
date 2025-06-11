const dotenv = require('dotenv');
dotenv.config({path:"config.env"});
const dbconnection = require('./config/database');
const express = require('express');
const path = require('path');

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

app.set('views', 'Views');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

app.use(express.static('public'));

const Doctor = require('./Models/doctorModel');

app.get('/doctors', async (req, res) => {
    console.log("Hitting /doctor page route");
    try {
        console.log("Attempting to fetch doctors from database...");
        const doctors = await Doctor.find()
            .populate('userId', 'name email')
            .populate('departmentId', 'name');
        console.log(`Successfully fetched ${doctors.length} doctors.`);

        const hospital = {
            name: "PrimeCare Hospital",
            address: "123 Health St, Wellness City",
            phone: "+1234567890",
            email: "info@primecare.com"
        };
        const user = null;
        const currentPage = 'doctors';
        const pageContent = {
            heroTitle: "Meet Our Expert Doctors",
            heroSubtitle: "Our team of highly skilled and compassionate doctors is here to provide you with the best care possible."
        };
        const searchQuery = '';
        const footerLinks = [
            { url: "/", text: "Home" },
            { url: "/about", text: "About Us" },
            { url: "/departments", text: "Departments" },
            { url: "/doctors-page", text: "Doctors" },
            { url: "/appointments", text: "Book Appointment" }
        ];
        const socialLinks = [
            { url: "#", icon: `<i class="fab fa-facebook-f"></i>` },
            { url: "#", icon: `<i class="fab fa-twitter"></i>` },
            { url: "#", icon: `<i class="fab fa-instagram"></i>` }
        ];
        console.log("Attempting to render doctorPage.ejs...");
        res.render('doctorPage', {
            hospital,
            user,
            currentPage,
            pageContent,
            searchQuery,
            doctors,
            footerLinks,
            socialLinks
        });
    } catch (error) {
        console.error("Error rendering doctors page:", error);
        res.status(500).send("Error loading doctors page.");
    }
});

// Temporary test route to diagnose routing issues
app.get('/test', (req, res) => {
    console.log("Hitting /test route");
    res.send('Test route hit successfully!');
});

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

//app.use(express.static("./frontend"));
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