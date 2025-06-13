const express = require('express');
const DepRouter = express.Router();
const departmentController = require('../Controllers/departmentController');

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

DepRouter.post('/', validateDepartment, departmentController.createDepartment);
DepRouter.get('/', departmentController.getAllDepartments);
DepRouter.get('/top', departmentController.getTopDepartments);
DepRouter.get('/search', departmentController.searchDepartments);
DepRouter.get('/:id', departmentController.getDepartmentById);
DepRouter.get('/name/:name', departmentController.getDepartmentByName);

// READ - Render all departments
DepRouter.get('/view/all', departmentController.renderDepartmentsPage);

// UPDATE - Update department
DepRouter.put('/:id', departmentController.updateDepartment);
DepRouter.delete('/:id', departmentController.deleteDepartment);

module.exports = DepRouter;