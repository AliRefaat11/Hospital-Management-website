const express = require('express');
const router = express.Router();
const treatmentPlanController = require('../Controllers/treatmentplanController');
router.get('/', treatmentPlanController.getAllTreatmentPlans); 
router.get('/:id', treatmentPlanController.getTreatmentPlanById); 
router.get('/patient/:patientId', treatmentPlanController.getTreatmentPlansByPatient); 
router.get('/appointment/:appointmentId', treatmentPlanController.getTreatmentPlansByAppointment);
router.post('/', treatmentPlanController.createTreatmentPlan); 
router.put('/:id', treatmentPlanController.updateTreatmentPlan);
router.delete('/:id', treatmentPlanController.deleteTreatmentPlan);

module.exports = router;
