const express = require('express');
const router = express.Router();
const documentController = require('../Controllers/documentController');

router.get('/', documentController.getAllDocuments); 

router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocument); 
router.delete('/:id', documentController.deleteDocument);
router.get('/patient/:patientId', documentController.getDocumentsByPatient);

module.exports = DocRouter;