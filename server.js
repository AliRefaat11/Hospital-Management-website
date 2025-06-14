const dotenv = require('dotenv');
dotenv.config({path:"config.env"});
const dbconnection = require('./config/database');
dbconnection(); // Call the database connection function
const express = require('express');
const path = require('path');
const { auth } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const appointmentController = require('./Controllers/appointmentController');
const cookieParser = require('cookie-parser');
const adminController = require('./Controllers/adminController'); // Import the adminController
const Doctor = require('./Models/doctorModel'); // Single, correct declaration
const Department = require('./Models/departmentModel'); // Single, correct declaration
const User = require('./Models/userModel'); // Single, correct declaration

const app = express();

// Import routers
const DrRouter = require('./Routes/doctorRouter');
const TestDrRouter = require('./Routes/testDoctorRoutes');
const UserRouter = require('./Routes/userRouter');
const PatRouter = require('./Routes/patientRouter');
const DocRouter = require('./Routes/documentRouter');
const DepRouter = require('./Routes/departmentRouter');
const AppRouter = require('./Routes/appointmentRouter');
const InsurRouter = require('./Routes/insuranceRouter');
const MedRouter = require('./Routes/medicalreportRouter');
const TreatRouter = require('./Routes/treatmentplanRouter');
const AdminRouter = require('./Routes/adminRoutes');
const TreatmentPlan = require('./Models/treatmentplanModel');
const MedicalReport = require('./Models/medicalreportModel');

// View engine setup
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');

// Middleware - Place express.static at the very beginning to serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
});

// Models
// const Patient = require('./Models/patientModel');

// Home page route
app.get('/', async (req, res) => {
    try {
        const hospital = {
            name: "PrimeCare",
            address: "123 Health St, Wellness City",
            phone: "+1234567890",
            email: "info@primecare.com",
            tagline: "Your Health is Our Priority",
            subTagline: "Providing quality healthcare services for you and your family",
            about: "PrimeCare Hospital is committed to providing exceptional healthcare services with a focus on patient care and medical excellence."
        };

        const currentPage = 'home';
        const pageContent = {
            heroTitle: "Welcome to PrimeCare Hospital",
            heroSubtitle: "Your Health is Our Priority"
        };

        // Add services data
        const services = [
            {
                name: "Emergency Care",
                icon: "/images/ambulance_icon.jpg",
                description: "24/7 emergency medical services"
            },
            {
                name: "Outpatient Services",
                icon: "/images/istockphoto-1330046035-612x612.jpg",
                description: "Comprehensive outpatient care"
            },
            {
                name: "Radiology",
                icon: "/images/Neurology_Icon.jpg",
                description: "Advanced imaging services"
            },
            {
                name: "Specialized Care",
                icon: "/images/surgery_icon.jpg",
                description: "Expert care in various specialties"
            }
        ];

        // Add features data
        const features = [
            "24/7 Emergency Services",
            "Experienced Medical Staff",
            "Modern Medical Equipment",
            "Comfortable Patient Rooms",
            "Easy Appointment Booking",
            "Online Medical Records"
        ];

        // Add testimonials data
        const testimonials = [
            {
                content: "The care I received at PrimeCare was exceptional. The staff was professional and caring.",
                author: "John Smith"
            },
            {
                content: "Modern facilities and excellent doctors. Highly recommended!",
                author: "Sarah Johnson"
            },
            {
                content: "Quick service and great medical attention. Thank you PrimeCare!",
                author: "Michael Brown"
            }
        ];

        // Add CTA data
        const cta = {
            heading: "Ready to Book Your Appointment?",
            buttonText: "Book Now"
        };

        const footerLinks = [
            { url: "/", text: "Home" },
            { url: "/User/about", text: "About Us" },
            { url: "/Department/view", text: "Departments" },
            { url: "/doctors", text: "Doctors" },
            { url: "/appointments", text: "Book Appointment" }
        ];

        const socialLinks = [
            { url: "#", icon: `<i class="fab fa-facebook-f"></i>` },
            { url: "#", icon: `<i class="fab fa-twitter"></i>` },
            { url: "#", icon: `<i class="fab fa-instagram"></i>` }
        ];

        // Add featured doctors demo data
        const featuredDoctors = [
            {
                name: "Dr. Sarah Johnson",
                specialization: "Cardiology",
                profileImage: "/images/doctor-1.jpg",
                rating: 4.8,
                experience: "15 years"
            },
            {
                name: "Dr. Michael Chen",
                specialization: "Neurology",
                profileImage: "/images/doctor-2.jpg",
                rating: 4.9,
                experience: "12 years"
            },
            {
                name: "Dr. Emily Brown",
                specialization: "Pediatrics",
                profileImage: "/images/doctor-3.jpg",
                rating: 4.7,
                experience: "10 years"
            },
            {
                name: "Dr. James Wilson",
                specialization: "Orthopedics",
                profileImage: "/images/doctor-4.jpg",
                rating: 4.8,
                experience: "14 years"
            }
        ];

        let user = null;
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
            }
        } catch (error) {
            console.log('Token verification failed:', error.message);
        }

        res.render('homePage', {
            hospital,
            user,
            currentPage,
            pageContent,
            services,
            features,
            testimonials,
            cta,
            footerLinks,
            socialLinks,
            featuredDoctors,
            siteName: 'PrimeCare Hospital - Updated'
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).send("Error loading home page.");
    }
});

// Temporary test route for admin doctor management
app.get('/test-admin-doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'departmentName');

        const departments = await Department.find();

        // Placeholder admin user for testing
        let admin = {
            name: "Test Admin",
            role: "System Administrator",
            profileImage: "/images/admin-avatar.png" // Or any default image
        };

        // Placeholder stats and activities data
        const stats = {
            totalDoctors: doctors.length,
            doctorsChange: 5, // Example value
            activeDoctors: doctors.filter(doc => doc.status === 'active').length, // Assuming a status field exists
            specialistDoctors: doctors.filter(doc => doc.specialization).length, // Example of specialists
            generalDoctors: doctors.filter(doc => doc.specialization === 'General Practitioner').length // Example of general practitioners
        };

        const activities = [
            { icon: 'fa-plus-circle', description: 'Test Doctor added', timestamp: new Date() },
            { icon: 'fa-edit', description: 'Test Doctor updated', timestamp: new Date() },
        ];

        // Additional data required by doctorManagement.ejs
        const specializations = ["Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Neurology", "General Practitioner"];
        const employmentTypes = ["Full-Time", "Part-Time", "Consultant"];
        const csrfToken = 'test-csrf-token'; // Placeholder, replace with actual CSRF token in production

        res.render('doctorManagement', {
            doctors,
            departments,
            admin,
            stats,
            activities,
            specializations,
            employmentTypes,
            csrfToken,
            currentPage: 'doctors-management' // Active page for sidebar highlighting
        });
    } catch (error) {
        console.error("Error rendering test admin doctor management page:", error);
        res.status(500).send("Error loading test admin doctor management page.");
    }
});

// Mount routers
app.use('/User', UserRouter);
app.use('/doctors', TestDrRouter);
app.use('/doctors', DrRouter);
app.use('/Patient', PatRouter);
app.use('/documents', DocRouter);
app.use('/Department', DepRouter);
app.use('/appointments', AppRouter);
app.use('/Insurance', InsurRouter);
app.use('/MedicalReport', MedRouter);
app.use('/TreatmentPlan', TreatRouter);

// Server setup
const hostname = "127.0.0.1";
const port = 3000;

// Connect to database
dbconnection();

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});