const Department = require('../Models/departmentModel');
const Doctor = require("../Models/doctorModel");
const { validationResult } = require('express-validator');

const departmentController = {

  createDepartment: async (req, res) => {
    try {
      const { departmentName, description, numberOfDoctors } = req.body;

      // Create new department
      const department = new Department({
        departmentName,
        description,
        numberOfDoctors
      });

      // Save to database
      const savedDepartment = await department.save();

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: savedDepartment
      });

    } catch (error) {
      // Handle duplicate department name error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Department name already exists',
          error: 'Duplicate department name'
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to create department',
        error: error.message
      });
    }
  },

  // READ - Get all departments
  getAllDepartments: async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;

      // Build filter object for search
      const filter = {};
      if (search) {
        filter.$or = [
          { departmentName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      const departments = await Department.find(filter)
        .sort({ departmentName: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Department.countDocuments(filter);

      res.status(200).json({
        success: true,
        message: 'Departments retrieved successfully',
        data: departments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: departments.length,
          totalRecords: total
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve departments',
        error: error.message
      });
    }
  },

  // READ - Get department by ID
  getDepartmentById: async (req, res) => {
    try {
      const { id } = req.params;

      const department = await Department.findById(id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Department retrieved successfully',
        data: department
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve department',
        error: error.message
      });
    }
  },

  // READ - Get department by name
  getDepartmentByName: async (req, res) => {
    try {
      const { name } = req.params;

      const department = await Department.findOne({
        departmentName: { $regex: name, $options: 'i' }
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Department retrieved successfully',
        data: department
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve department',
        error: error.message
      });
    }
  },

  // UPDATE - Update department
  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const department = await Department.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      );

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: department
      });

    } catch (error) {
      // Handle duplicate department name error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Department name already exists',
          error: 'Duplicate department name'
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to update department',
        error: error.message
      });
    }
  },

  // DELETE - Delete department
  deleteDepartment: async (req, res) => {
    try {
      const { id } = req.params;

      const department = await Department.findByIdAndDelete(id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Department deleted successfully',
        data: department
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete department',
        error: error.message
      });
    }
  },

  // EXTRA - Get departments with most doctors
  getTopDepartments: async (req, res) => {
    try {
      const { limit = 5 } = req.query;

      const departments = await Department.find()
        .sort({ numberOfDoctors: -1 })
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Top departments retrieved successfully',
        data: departments,
        count: departments.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve top departments',
        error: error.message
      });
    }
  },

  // EXTRA - Search departments
  searchDepartments: async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const departments = await Department.find({
        $or: [
          { departmentName: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).sort({ departmentName: 1 });

      res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: departments,
        count: departments.length,
        searchQuery: query
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search departments',
        error: error.message
      });
    }
  },

  // Render all departments in a view
  renderDepartmentsPage: async (req, res) => {
    try {
      const departments = await Department.find();
      // For each department, fetch its doctors
      const departmentsWithDoctors = await Promise.all(
        departments.map(async (dept) => {
          const doctors = await Doctor.find({ departmentId: dept._id });
          return { ...dept.toObject(), doctors };
        })
      );
      res.render('departmentPage', { departments: departmentsWithDoctors, activePage: 'departments' });
    } catch (error) {
      res.status(500).send('Error loading departments');
    }
  },

  // Get all doctors in a specific department by department id
  getDoctorsByDepartmentId: async (req, res) => {
    try {
      const departmentId = req.params.id;
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
      const doctors = await Doctor.find({ departmentId })
        .populate('userId', 'FName LName Email PhoneNumber Gender Age')
        .populate('departmentId', 'departmentName');
      res.status(200).json({
        success: true,
        department: department.departmentName,
        doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = departmentController;