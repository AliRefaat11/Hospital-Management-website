const dotenv = require('dotenv');
dotenv.config({path:"config.env"});
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

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'Views');

// Add static file middleware
app.use(express.static('public'));

const Doctor = require('./Models/doctorModel'); // Import Doctor model here

// New route to render the doctors page
app.get('/doctors-page', async (req, res) => {
    console.log("Hitting /doctor page route"); // Updated for clarity
    try {
        console.log("Attempting to fetch doctors from database...");
        const doctors = await Doctor.find()
            .populate('userId', 'name email')
            .populate('departmentId', 'name');
        console.log(`Successfully fetched ${doctors.length} doctors.`);

        // Placeholder data for other EJS variables used in doctorPage.ejs
        const hospital = {
            name: "PrimeCare Hospital",
            address: "123 Health St, Wellness City",
            phone: "+1234567890",
            email: "info@primecare.com"
        };
        const user = null; // Assuming no user is logged in for a public page
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
            doctors, // Pass the fetched doctors data
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