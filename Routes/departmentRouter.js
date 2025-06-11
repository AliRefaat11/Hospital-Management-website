const express = require('express');
const DepRouter = express.Router();
const departmentController = require('../Controllers/departmentController');

// ============================================
// SIMPLE VALIDATION MIDDLEWARE
// ============================================

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

// ============================================
// ROUTE DEFINITIONS
// ============================================

// CREATE - Create new department
DepRouter.post('/', validateDepartment, departmentController.createDepartment);

// READ - Get all departments
DepRouter.get('/', departmentController.getAllDepartments);

// READ - Get top departments
DepRouter.get('/top', departmentController.getTopDepartments);

// READ - Search departments
DepRouter.get('/search', departmentController.searchDepartments);

// READ - Get department by ID
DepRouter.get('/:id', departmentController.getDepartmentById);

// READ - Get department by name
DepRouter.get('/name/:name', departmentController.getDepartmentByName);

// READ - Render all departments
DepRouter.get('/view/all', departmentController.renderDepartmentsPage);

// UPDATE - Update department
DepRouter.put('/:id', departmentController.updateDepartment);

// DELETE - Delete department
DepRouter.delete('/:id', departmentController.deleteDepartment);

module.exports = DepRouter;