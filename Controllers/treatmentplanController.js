const TreatmentPlan = require('../Models/treatmentplanModel');

exports.getAllTreatmentPlans = async (req, res) => {
    try {
        const treatmentPlans = await TreatmentPlan.find()
            .populate('appointmentId')
            .populate('patientId');
        res.status(200).json(treatmentPlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTreatmentPlanById = async (req, res) => {
    try {
        const treatmentPlan = await TreatmentPlan.findById(req.params.id)
            .populate('appointmentId')
            .populate('patientId');
        if (!treatmentPlan) {
            return res.status(404).json({ message: 'Treatment plan not found' });
        }
        res.status(200).json(treatmentPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTreatmentPlansByPatient = async (req, res) => {
    try {
        const treatmentPlans = await TreatmentPlan.find({ patientId: req.params.patientId });
        res.status(200).json(treatmentPlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTreatmentPlansByAppointment = async (req, res) => {
    try {
        const treatmentPlans = await TreatmentPlan.find({ appointmentId: req.params.appointmentId });
        res.status(200).json(treatmentPlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTreatmentPlan = async (req, res) => {
    try {
        const { appointmentId, patientId, startDate, endDate, description } = req.body;
        const newTreatmentPlan = new TreatmentPlan({
            appointmentId,
            patientId,
            startDate,
            endDate,
            description
        });
        await newTreatmentPlan.save();
        res.status(201).json({ message: 'Treatment plan created successfully', treatmentPlan: newTreatmentPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllTreatmentPlans = async (req, res) => {
    try {
        // Fetch data from database logic here
        res.status(200).json({ message: 'All treatment plans fetched successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateTreatmentPlan = async (req, res) => {
    try {
        const updatedTreatmentPlan = await TreatmentPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedTreatmentPlan) {
            return res.status(404).json({ message: 'Treatment plan not found' });
        }
        res.status(200).json(updatedTreatmentPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTreatmentPlan = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTreatmentPlan = await TreatmentPlan.findByIdAndDelete(id);
    if (!deletedTreatmentPlan) {
      return res.status(404).json({ message: "Treatment plan not found" });
    }
    res.status(200).json({ message: "Treatment plan deleted successfully", deletedTreatmentPlan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};