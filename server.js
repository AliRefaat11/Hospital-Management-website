const dotenv = require('dotenv');
dotenv.config({ path: "config.env" });

const express = require('express');
const dbconnection = require('./config/database');
dbconnection();
const path = require('path');
const { auth } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const adminController = require('./Controllers/adminController');
const doctorController = require('./Controllers/doctorController');
const DocController = require('./Controllers/documentController');

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

// View engine setup
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));
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

app.get('/', (req, res) => {
    res.render('homePage');
});

// Mount your routers
app.use('/doctors', DrRouter);
app.use('/User', UserRouter);
app.use('/Patient', PatRouter);
app.use('/Document', DocRouter);
app.use('/Department', DepRouter);
app.use('/appointments', AppRouter);
app.use('/insurance', InsurRouter);
app.use('/medicalreports', MedRouter);
app.use('/treatmentplans', TreatRouter);
app.use('/admin', AdminRouter);
app.use('/test-doctors', TestDrRouter);

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || 'Something went wrong!';

    if (err.name === 'JsonWebTokenError') {
        err.statusCode = 401;
        err.message = 'Invalid token. Please login again.';
    }
    if (err.name === 'TokenExpiredError') {
        err.statusCode = 401;
        err.message = 'Your token has expired. Please login again.';
    }

    if (req.accepts('html')) {
        res.status(err.statusCode).render('errorPage', {
            statusCode: err.statusCode,
            message: err.message,
            title: `Error ${err.statusCode}`
        });
    } else {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
});
