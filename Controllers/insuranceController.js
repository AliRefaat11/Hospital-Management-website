const Insurance = require('../Models/insuranceModel');

exports.getAllInsurances = async (req, res) => {
    try {
        const insurances = await Insurance.find();
        res.status(200).json(insurances);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getInsuranceById = async (req, res) => {
    try {
        const insurance = await Insurance.findById(req.params.id);
        if (insurance) {
            res.status(200).json(insurance);
        } else {
            res.status(404).send('Insurance not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.createInsurance = async (req, res) => {
    try {
        const newInsurance = new Insurance(req.body);
        await newInsurance.save();
        res.status(201).json(newInsurance);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.updateInsurance = async (req, res) => {
    try {
        const insurance = await Insurance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (insurance) {
            res.status(200).json(insurance);
        } else {
            res.status(404).send('Insurance not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.deleteInsurance = async (req, res) => {
    try {
        const insurance = await Insurance.findByIdAndDelete(req.params.id);
        if (insurance) {
            res.status(204).send(); // No content to send back, successful deletion
        } else {
            res.status(404).send('Insurance not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}; 