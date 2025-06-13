const express = require('express');
const router = express.Router();
const documentController = require('../Controllers/documentController');
router.get('/', documentController.getAllDocuments); 
router.get('/:id', documentController.getDocumentById);
router.get('/patient/:patientId', documentController.getDocumentsByPatient); 
router.put('/:id', documentController.updateDocument); 
router.delete('/:id', documentController.deleteDocument); 
module.exports = router;
