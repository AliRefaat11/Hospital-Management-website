const dotenv = require('dotenv');
dotenv.config({path:"config.env"});
const dbconnection = require('./config/database');
const express = require('express');
const path = require('path');
const { auth } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// Core Middleware - MUST be placed before any routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Ensure cookieParser is defined if not already imported

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
const User = require('./Models/userModel');
const Patient = require('./Models/patientModel');
const Department = require('./Models/departmentModel');

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
                icon: "/images/emergency-icon.png",
                description: "24/7 emergency medical services"
            },
            {
                name: "Outpatient Services",
                icon: "/images/outpatient-icon.png",
                description: "Comprehensive outpatient care"
            },
            {
                name: "Laboratory",
                icon: "/images/lab-icon.png",
                description: "State-of-the-art diagnostic services"
            },
            {
                name: "Radiology",
                icon: "/images/radiology-icon.png",
                description: "Advanced imaging services"
            },
            {
                name: "Pharmacy",
                icon: "/images/pharmacy-icon.png",
                description: "Full-service hospital pharmacy"
            },
            {
                name: "Specialized Care",
                icon: "/images/specialized-icon.png",
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
            { url: "/about", text: "About Us" },
            { url: "/departments", text: "Departments" },
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
            // If token is invalid, just continue with user as null
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
            siteName: 'PrimeCare'
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).send("Error loading home page.");
    }
});

app.get('/doctors', (req, res) => {
    const doctors = [
        { name: "Dr. Sarah Johnson", specialization: "Cardiology", profileImage: "/images/doctor-1.jpg" },
        { name: "Dr. Michael Chen", specialization: "Neurology", profileImage: "/images/doctor-2.jpg" },
        { name: "Dr. Emily Brown", specialization: "Pediatrics", profileImage: "/images/doctor-3.jpg" },
        { name: "Dr. James Wilson", specialization: "Orthopedics", profileImage: "/images/doctor-4.jpg" }
    ];
    const hospital = {
        name: "PrimeCare",
        address: "123 Health St, Wellness City",
        phone: "+1234567890",
        email: "info@primecare.com"
    };
    const user = null; // Replace with actual user if logged in
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
        { url: "/doctors", text: "Doctors" },
        { url: "/appointments", text: "Book Appointment" }
    ];
    const socialLinks = [
        { url: "#", icon: `<i class="fab fa-facebook-f"></i>` },
        { url: "#", icon: `<i class="fab fa-twitter"></i>` },
        { url: "#", icon: `<i class="fab fa-instagram"></i>` }
    ];
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
});

// Demo data for departments page (re-added as per request to revert)
app.get('/department/view/all', (req, res) => {
    const departments = [
        {
            departmentName: "Cardiology",
            description: "Heart care and cardiovascular treatments.",
            numberOfDoctors: 5,
            doctors: [
                { name: "Dr. Sarah Johnson", specialization: "Cardiology" }
            ]
        },
        {
            departmentName: "Neurology",
            description: "Brain and nervous system care.",
            numberOfDoctors: 3,
            doctors: [
                { name: "Dr. Michael Chen", specialization: "Neurology" }
            ]
        },
        {
            departmentName: "Pediatrics",
            description: "Child health and wellness.",
            numberOfDoctors: 4,
            doctors: [
                { name: "Dr. Emily Brown", specialization: "Pediatrics" }
            ]
        }
    ];
    const user = null; // Replace with actual user if logged in
    const activePage = 'departments';
    res.render('departmentPage', {
        departments,
        user,
        activePage
    });
});

// Route for Appointments Management Page
app.get('/appointments', async (req, res) => {
    try {
        // Fetch necessary data from backend for dropdowns and table display
        const doctors = await Doctor.find({});
        const patients = await Patient.find({});
        const departments = await Department.find({});

        // Placeholder data for EJS rendering. You'll need to populate these from your DB/logic.
        const admin = { name: "Admin User", role: "Administrator", profileImage: "/images/admin-avatar.png" };
        const notifications = { count: 0 };
        const messages = { count: 0 };
        const stats = {
            total: { count: 0, changeType: 'none', changePercent: 0 },
            today: { count: 0 },
            completed: { count: 0 },
            pending: { count: 0 }
        };
        const todaySchedule = { urgent: 0, late: 0, noShows: 0, avgWaitTime: '0m' };
        const nextAppointments = []; // This will be dynamically fetched by client-side JS
        const appointments = []; // Initialize an empty array for initial render

        res.render('appointmentsManagement', {
            admin,
            notifications,
            messages,
            stats,
            todaySchedule,
            nextAppointments,
            appointments, // Pass the appointments array to the EJS
            doctors, // Pass fetched doctors
            patients, // Pass fetched patients
            departments, // Pass fetched departments
            currentPage: 'appointments',
            appointmentTypes: ['Consultation', 'Follow-up', 'Checkup', 'Emergency', 'Therapy'] // Example types
        });
    } catch (error) {
        console.error("Error rendering appointments management page:", error);
        res.status(500).send("Error loading appointments management page.");
    }
});

// Temporary test route to diagnose routing issues
app.get('/test', (req, res) => {
    console.log("Hitting /test route");
    res.send('Test route hit successfully!');
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
});

// API Routes (mounted after page rendering routes)
app.use('/User', UserRouter);
app.use('/Doctor', DrRouter);
app.use('/Patient', PatRouter);
app.use('/Document', DocRouter);
app.use('/Department', DepRouter);
app.use('/Appointment', AppRouter);
app.use('/Insurance', InsurRouter);
app.use('/Treatment', TreatRouter);
app.use('/MedicalReport', MedRouter);

// Render login page
app.get('/login', (req, res) => {
    res.render('loginPage', {
        title: 'Patient Login',
        formTitle: 'Login to PrimeCare',
        currentPage: 'login',
        siteName: 'PrimeCare'
    });
});

// Render patient signup page
app.get('/patient/signup', (req, res) => {
    res.render('signupPage', {
        title: 'Patient Sign Up',
        formTitle: 'Create Patient Account',
        currentPage: 'signup',
        siteName: 'PrimeCare',
        role: 'Patient'
    });
});

// Route for book appointment page
app.get('/book_appointment', async (req, res) => {
    try {
        let user = null;
        // Check for logged-in user (replicate logic from '/' route)
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-Password');
            }
        } catch (error) {
            console.log('Token verification failed for book_appointment page:', error.message);
        }

        const doctors = await Doctor.find({});
        const departments = await Department.find({});

        res.render('bookAppointment', {
            user: user,
            doctors: doctors,
            departments: departments,
            currentPage: 'book_appointment' // Optional: for highlighting nav links
        });
    } catch (error) {
        console.error("Error rendering bookAppointment page:", error);
        res.status(500).send("Error loading book appointment page.");
    }
});

// Route for quick appointment page
app.get('/quick-appointment', async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        const departments = await Department.find({});
        res.render('quickAppointment', {
            user: req.user,
            doctors: doctors,
            departments: departments
        });
    } catch (error) {
        console.error("Error rendering quickAppointment page:", error);
        res.status(500).send("Error loading quick appointment page.");
    }
});

// Handle form submission from bookAppointment.ejs
app.post('/appointments/book', async (req, res) => {
    try {
        const { 
            firstName, lastName, phone, email, gender, age,
            department, doctor, date, time, reason, terms
        } = req.body;

        // --- Patient Creation/Lookup Logic ---
        let userRecord = await User.findOne({ email });
        let patientRecord;

        if (!userRecord) {
            // If user doesn't exist, create a new user (with dummy password for now, improve security later)
            userRecord = new User({
                name: `${firstName} ${lastName}`,
                email,
                Password: 'temp_password_123', // !!! IMPORTANT: Hash passwords in a real application !!!
                role: 'patient' // Assuming this is for patient users
            });
            await userRecord.save();
        }

        patientRecord = await Patient.findOne({ userId: userRecord._id });

        if (!patientRecord) {
            // If patient doesn't exist, create a new patient linked to the user
            patientRecord = new Patient({
                userId: userRecord._id,
                DateOfBirth: new Date(new Date().getFullYear() - parseInt(age), 0, 1), // Approximate DoB from age
                Gender: gender,
                PhoneNumber: phone,
                Address: 'N/A', // Assuming address is not collected here
                MedicalHistory: '' // Assuming medical history is not collected here
            });
            await patientRecord.save();
        }
        // --- End Patient Creation/Lookup Logic ---

        // Prepare request body for appointmentController.createAppointment
        req.body = {
            doctorID: doctor, // 'doctor' field from form is already the ID
            patientID: patientRecord._id.toString(),
            date: date,
            startingHour: time,
            reason: reason,
            status: 'scheduled' // Default status
        };

        // Call the appointment controller to create the appointment
        // The controller will send the JSON response itself.
        await appointmentController.createAppointment(req, res);

    } catch (error) {
        console.error("Error processing book appointment:", error);
        // Send an error response back to the frontend
        res.status(500).json({
            success: false,
            message: 'Failed to process book appointment',
            error: error.message
        });
    }
});

// Handle form submission from quickAppointment.ejs
app.post('/appointments/quick-book', async (req, res) => {
    try {
        const {
            firstName, lastName, phone, email,
            department, doctor, date, time, notes
        } = req.body;

        // --- Patient Creation/Lookup Logic ---
        let userRecord = await User.findOne({ email });
        let patientRecord;

        if (!userRecord) {
            // If user doesn't exist, create a new user (with dummy password for now)
            userRecord = new User({
                name: `${firstName} ${lastName}`,
                email,
                Password: 'temp_password_123', // !!! IMPORTANT: Hash passwords in a real application !!!
                role: 'patient'
            });
            await userRecord.save();
        }

        patientRecord = await Patient.findOne({ userId: userRecord._id });

        if (!patientRecord) {
            // If patient doesn't exist, create a new patient linked to the user
            patientRecord = new Patient({
                userId: userRecord._id,
                DateOfBirth: new Date('2000-01-01'), // Default/dummy age for quick appt
                Gender: 'N/A', // Not collected in quick form
                PhoneNumber: phone,
                Address: 'N/A', 
                MedicalHistory: '' 
            });
            await patientRecord.save();
        }
        // --- End Patient Creation/Lookup Logic ---

        // Prepare request body for appointmentController.createAppointment
        req.body = {
            doctorID: doctor, // 'doctor' field from form is already the ID
            patientID: patientRecord._id.toString(),
            date: date,
            startingHour: time,
            reason: notes || 'Quick appointment request', // Map notes to reason
            status: 'scheduled' // Default status
        };

        // Call the appointment controller to create the appointment
        // The controller will send the JSON response itself.
        await appointmentController.createAppointment(req, res);

    } catch (error) {
        console.error("Error processing quick appointment:", error);
        // Send an error response back to the frontend
        res.status(500).json({
            success: false,
            message: 'Failed to process quick appointment',
            error: error.message
        });
    }
});

const hostname = "127.0.0.1";
const port = 3000;

dbconnection();

app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});