const dotenv = require('dotenv');
dotenv.config({ path: "config.env" });

const express = require('express');
const dbconnection = require('./config/database');
const express = require('express');
const path = require('path');
const { auth } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');

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
const User = require('./Models/userModel');

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

// Demo data for doctors page
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
        { url: "#", icon: `<i class=\"fab fa-facebook-f\"></i>` },
        { url: "#", icon: `<i class=\"fab fa-twitter\"></i>` },
        { url: "#", icon: `<i class=\"fab fa-instagram\"></i>` }
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

// Remove the duplicate signup and login routes since they're handled in the routers
// app.get('/signup', ...) - Remove this
// app.get('/login', ...) - Remove this

//app.use(express.static("./frontend"));
app.use('/User', UserRouter);
app.use('/Doctor', DrRouter);
app.use('/Patient', PatRouter);
app.use('/Document', DocRouter);
app.use('/Department', DepRouter);
app.use('/Appointment', AppRouter);
app.use('/Insurance', InsurRouter);
app.use('/Treatment', TreatRouter); // TreatRouter is used here
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

// View engine setup
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
});

// Removed global auth middleware - auth should be applied within specific routers
// app.use(auth); // THIS LINE WAS POTENTIALLY CAUSING ISSUES, REMOVED

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
            { url: "/appointments", text: "Book Appointment" },
            { url: "/User/privacy-policy", text: "Privacy Policy" },
            { url: "/User/terms-of-service", text: "Terms of Service" },
            { url: "/User/contact-us", text: "Contact Us" }
        ];

        const socialLinks = [
            { url: "#", icon: "fab fa-facebook-f" },
            { url: "#", icon: "fab fa-twitter" },
            { url: "#", icon: "fab fa-instagram" },
            { url: "#", icon: "fab fa-linkedin" }
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

        // Fetch doctors from the database
        const doctors = await Doctor.find()
            .populate('userId', 'FName LName Email PhoneNumber Gender Age')
            .populate('departmentId', 'name');

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
            doctors, // Pass dynamic doctors instead of featuredDoctors
            siteName: 'PrimeCare'
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).send("Error loading home page.");
    }
});

// Mount routers
app.use('/User', UserRouter);
app.use('/doctors', DrRouter);
app.use('/Patient', PatRouter);
app.use('/Document', DocRouter);
app.use('/Department', DepRouter);
app.use('/appointments', AppRouter);
app.use('/Insurance', InsurRouter);
app.use('/Treatment', TreatRouter);
app.use('/MedicalReport', MedRouter);

// Server setup
const hostname = "127.0.0.1";
const port = 3000;

// Connect to database
dbconnection();

app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});
