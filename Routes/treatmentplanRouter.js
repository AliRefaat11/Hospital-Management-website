const express = require('express');
const TreatRouter = express.Router();
const treatmentPlanController = require('../Controllers/treatmentplanController');

<<<<<<< HEAD
TreatRouter.get('/', treatmentPlanController.getAllTreatmentPlans); 
TreatRouter.post('/', treatmentPlanController.createTreatmentPlan); 
=======
TreatRouter.post('/create', (req, res) => {
    res.send('Treatment plan created');
});


TreatRouter.get('/', treatmentPlanController.getAllTreatmentPlans); 
TreatRouter.post('/', treatmentPlanController.createTreatmentPlan);
>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
TreatRouter.get('/:id', treatmentPlanController.getTreatmentPlanById); 
TreatRouter.put('/:id', treatmentPlanController.updateTreatmentPlan);
TreatRouter.delete('/:id', treatmentPlanController.deleteTreatmentPlan);
TreatRouter.get('/patient/:patientId', treatmentPlanController.getTreatmentPlansByPatient); 
TreatRouter.get('/appointment/:appointmentId', treatmentPlanController.getTreatmentPlansByAppointment);

<<<<<<< HEAD
=======

>>>>>>> 99de3df2183c3bdf5d283e3f000943eea2e2ee8a
module.exports = TreatRouter;