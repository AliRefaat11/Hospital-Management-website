const express = require('express');
const TreatRouter = express.Router();
const treatmentPlanController = require('../Controllers/treatmentplanController');

// API Routes
TreatRouter.get('/', treatmentPlanController.getAllTreatmentPlans);
TreatRouter.post('/', treatmentPlanController.createTreatmentPlan);
TreatRouter.get('/:id', treatmentPlanController.getTreatmentPlanById);
TreatRouter.put('/:id', treatmentPlanController.updateTreatmentPlan);
TreatRouter.delete('/:id', treatmentPlanController.deleteTreatmentPlan);
TreatRouter.get('/patient/:patientId', treatmentPlanController.getTreatmentPlansByPatient);
TreatRouter.get('/appointment/:appointmentId', treatmentPlanController.getTreatmentPlansByAppointment);

module.exports = TreatRouter;