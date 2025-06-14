const express = require('express');
const DepRouter = express.Router();
const departmentController = require('../Controllers/departmentController');
const { auth } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const Doctor = require('../Models/doctorModel');
const Department = require('../Models/departmentModel');

const validateDepartment = (req, res, next) => {
  const { departmentName, description } = req.body;
  
  if (!departmentName) {
    return res.status(400).json({
      success: false,
      message: 'Department name is required'
    });
  }
  
  if (!description) {
    return res.status(400).json({
      success: false,
      message: 'Description is required'
    });
  }
  
  next();
};

// API Routes
DepRouter.post('/', validateDepartment, departmentController.createDepartment);
DepRouter.get('/', departmentController.getAllDepartments);
DepRouter.get('/top', departmentController.getTopDepartments);
DepRouter.get('/search', departmentController.searchDepartments);
DepRouter.get('/view', async (req, res) => {
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
        console.log('Departments with Doctors data sent to EJS:', JSON.stringify(departmentsWithDoctors, null, 2));
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
        console.error(error.stack);
        res.status(500).send('Error loading departments page.');
    }
});
DepRouter.get('/:id', departmentController.getDepartmentById);
DepRouter.get('/name/:name', departmentController.getDepartmentByName);
DepRouter.get('/:id/doctors', departmentController.getDoctorsByDepartmentId);
DepRouter.put('/:id', departmentController.updateDepartment);
DepRouter.delete('/:id', departmentController.deleteDepartment);

module.exports = DepRouter;