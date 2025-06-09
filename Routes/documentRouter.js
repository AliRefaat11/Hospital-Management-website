const express = require('express');
const DocRouter = express.Router();
const documentController = require('../Controllers/documentController');

DocRouter.get('/', documentController.getAllDocuments); 

DocRouter.get('/:id', documentController.getDocumentById);
DocRouter.put('/:id', documentController.updateDocument); 
DocRouter.delete('/:id', documentController.deleteDocument);
DocRouter.get('/patient/:patientId', documentController.getDocumentsByPatient);

module.exports = DocRouter;