const dotenv = require('dotenv');
dotenv.config({path:"config.env"});
const dbconnection = require('./config/database');
const express = require('express');
const path = require('path');
const { auth } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const appointmentController = require('./controllers/appointmentController');
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

app.get('/home', async (req, res) => {
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

        const features = [
            "24/7 Emergency Services",
            "Experienced Medical Staff",
            "Modern Medical Equipment",
            "Comfortable Patient Rooms",
            "Easy Appointment Booking",
            "Online Medical Records"
        ];

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
            siteName: 'PrimeCare'
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).send("Error loading home page.");
    }
});

app.get('/about', async (req, res) => {
    try {
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

        const aboutUsSections = [
            {
                title: "Our Mission",
                content: "To provide compassionate, high-quality healthcare services to our community, fostering wellness and promoting a healthier future for all."
            },
            {
                title: "Our Vision",
                content: "To be the leading healthcare provider, recognized for our excellence in patient care, innovative medical practices, and commitment to community health."
            },
            {
                title: "Our Values",
                list: [
                    "Patient-Centered Care: Prioritizing the needs and well-being of our patients.",
                    "Excellence: Striving for the highest standards in medical care and service.",
                    "Integrity: Upholding honesty, ethics, and transparency in all our actions.",
                    "Teamwork: Collaborating effectively to deliver comprehensive and coordinated care.",
                    "Innovation: Embracing new technologies and approaches to improve health outcomes."
                ]
            }
        ];

        res.render('aboutusPage', {
            currentPage: 'about',
            siteName: 'Prime Care',
            user,
            aboutUsSections
        });
    } catch (error) {
        console.error("Error rendering about page:", error);
        res.status(500).send("Error loading about page.");
    }
});

app.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find();
        const departmentsWithDoctors = await Promise.all(departments.map(async (department) => {
            const doctors = await Doctor.find({ departmentId: department._id })
                .populate('userId', 'FName LName Email PhoneNumber Gender Age')
                .populate('departmentId', 'departmentName');
            return {
                ...department.toObject(),
                doctors
            };
        }));
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
        res.render('departmentPage', {
            departments: departmentsWithDoctors,
            user,
            activePage: 'departments'
        });
    } catch (error) {
        console.error('Error loading departments:', error);
        res.status(500).send('Error loading departments page.');
    }
});

app.get('/doctors', async (req, res) => {
    console.log("Hitting /doctor page route");
    try {
        console.log("Attempting to fetch doctors from database...");
        const doctors = await Doctor.find()
            .populate('userId', 'name email')
            .populate('departmentId', 'name');
        console.log(`Successfully fetched ${doctors.length} doctors.`);

        const hospital = {
            name: "PrimeCare",
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

// Demo data for departments page
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

        // Placeholder data for EJS rendering
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
        const nextAppointments = [];
        const appointments = [];

        res.render('appointmentsManagement', {
            admin,
            notifications,
            messages,
            stats,
            todaySchedule,
            nextAppointments,
            appointments,
            doctors,
            patients,
            departments,
            currentPage: 'appointments',
            appointmentTypes: ['Consultation', 'Follow-up', 'Checkup', 'Emergency', 'Therapy']
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
app.use('/doctors', DrRouter);
app.use('/Patient', PatRouter);
app.use('/Document', DocRouter);
app.use('/Department', DepRouter);
app.use('/appointments', AppRouter);
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
            currentPage: 'book_appointment'
        });
    } catch (error) {
        console.error("Error rendering bookAppointment page:", error);
        res.status(500).send("Error loading book appointment page.");
    }
});

// Route for quick appointment page
app.get('/quick-appointment', async (req, res) => {
    try {
        const departments = await Department.find();
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
        res.render('quickAppointment', { 
            departments, 
            user,
            currentPage: 'quick-appointment'
        });
    } catch (error) {
        console.error("Error rendering quick appointment page:", error);
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
            userRecord = new User({
                name: `${firstName} ${lastName}`,
                email,
                Password: 'temp_password_123',
                role: 'patient'
            });
            await userRecord.save();
        }

        patientRecord = await Patient.findOne({ userId: userRecord._id });

        if (!patientRecord) {
            patientRecord = new Patient({
                userId: userRecord._id,
                DateOfBirth: new Date(new Date().getFullYear() - parseInt(age), 0, 1),
                Gender: gender,
                PhoneNumber: phone,
                Address: 'N/A',
                MedicalHistory: ''
            });
            await patientRecord.save();
        }

        req.body = {
            doctorID: doctor,
            patientID: patientRecord._id.toString(),
            date: date,
            startingHour: time,
            reason: reason,
            status: 'scheduled'
        };

        await appointmentController.createAppointment(req, res);

    } catch (error) {
        console.error("Error processing book appointment:", error);
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

        let userRecord = await User.findOne({ email });
        let patientRecord;

        if (!userRecord) {
            userRecord = new User({
                name: `${firstName} ${lastName}`,
                email,
                Password: 'temp_password_123',
                role: 'patient'
            });
            await userRecord.save();
        }

        patientRecord = await Patient.findOne({ userId: userRecord._id });

        if (!patientRecord) {
            patientRecord = new Patient({
                userId: userRecord._id,
                DateOfBirth: new Date('2000-01-01'),
                Gender: 'N/A',
                PhoneNumber: phone,
                Address: 'N/A', 
                MedicalHistory: '' 
            });
            await patientRecord.save();
        }

        req.body = {
            doctorID: doctor,
            patientID: patientRecord._id.toString(),
            date: date,
            startingHour: time,
            reason: notes || 'Quick appointment request',
            status: 'scheduled'
        };

        await appointmentController.createAppointment(req, res);

    } catch (error) {
        console.error("Error processing quick appointment:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to process quick appointment',
            error: error.message
        });
    }
});

app.get('/profile', auth, async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.redirect('/login');
        }

        res.render('userProfile', { user, currentPage: 'profile' });
    } catch (error) {
        console.error("Error rendering user profile page:", error);
        res.status(500).send("Error loading user profile page.");
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

const hostname = "127.0.0.1";
const port = 3000;

dbconnection();

app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});