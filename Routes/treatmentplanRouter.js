const express = require('express');
const router = express.Router();
const treatmentPlanController = require('../Controllers/treatmentplanController');

router.get('/', treatmentPlanController.getAllTreatmentPlans); 
router.post('/', treatmentPlanController.createTreatmentPlan); 

router.get('/:id', treatmentPlanController.getTreatmentPlanById); 
router.put('/:id', treatmentPlanController.updateTreatmentPlan);
router.delete('/:id', treatmentPlanController.deleteTreatmentPlan);

router.get('/patient/:patientId', treatmentPlanController.getTreatmentPlansByPatient); 
router.get('/appointment/:appointmentId', treatmentPlanController.getTreatmentPlansByAppointment);

module.exports = router;