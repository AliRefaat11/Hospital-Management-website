const Document = require('../models/documentModel');

exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find().populate('patientId');
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate('patientId');
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDocumentsByPatient = async (req, res) => {
    try {
        const documents = await Document.find({ patientId: req.params.patientId });
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createDocument = async (req, res) => {
    try {
        const { patientId, documentUrl, notes } = req.body;
        const newDocument = await Document.create({ patientId, documentUrl, notes });
        res.status(201).json(newDocument);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateDocument = async (req, res) => {
    try {
        const updatedDocument = await Document.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json(updatedDocument);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const deletedDocument = await Document.findByIdAndDelete(req.params.id);
        if (!deletedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
