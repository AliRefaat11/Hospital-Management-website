const Doctor = require("../Models/doctorModel");
const User = require("../Models/userModel");

const getAll = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'name email')
            .populate('departmentId', 'name');
        res.status(200).json({
            status: 'success',
            results: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');
        
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'No doctor found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const create = async (req, res) => {
    const {FName,LName,Email,Password,Age,PhoneNumber,Gender,specialization,rating,schedule}= req.body;
    try{
        const newUser = new User({FName,LName,Email,Password,Age,PhoneNumber,Gender,role:"Patient"});
        const savedUser = await newUser.save();

        const newDoctor = await Doctor.create({userId:savedUser._id,specialization,rating,schedule});
        const savedDoctor = await newDoctor.save();

        return res.status(200).json({
            user:newUser,
            doctor:newDoctor
        })
    }
    catch(error){
        return res.status(500).json({
            message:error.message,
        })
    }
};

const update = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'No doctor found with that ID'
            });
        }
        res.status(200).json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const deleteById = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'No doctor found with that ID'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getByDepartment = async (req, res) => {
    try {
        const doctors = await Doctor.find({ departmentId: req.params.departmentId })
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        res.status(200).json({
            status: 'success',
            results: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getBySpecialization = async (req, res) => {
    try {
        const doctors = await Doctor.find({ specialization: req.params.specialization })
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        res.status(200).json({
            status: 'success',
            results: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
    getByDepartment,
    getBySpecialization
};