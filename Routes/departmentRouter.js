const express = require('express');
const router = express.Router();
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
router.post('/', validateDepartment, departmentController.createDepartment);

// READ - Get all departments
router.get('/', departmentController.getAllDepartments);

// READ - Get top departments
router.get('/top', departmentController.getTopDepartments);

// READ - Search departments
router.get('/search', departmentController.searchDepartments);

// READ - Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// READ - Get department by name
router.get('/name/:name', departmentController.getDepartmentByName);

// UPDATE - Update department
router.put('/:id', departmentController.updateDepartment);

// DELETE - Delete department
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;