const User = require("../Models/userModel");
const { auth, createToken, allowedTo, ApiError } = require("../middleware/authMiddleware");
const bcrypt = require('bcryptjs');
const validator = require('validator');
const asyncHandler = require('express-async-handler');
const Patient = require("../Models/patientModel");

const getAll = async (req, res) => {
    try {
        const users = await User.find().select('-Password');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users
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
        const user = await User.findById(req.params.id).select('-Password');
        
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const create = async (req, res) => {
    const {FName,LName,Email,Password,PhoneNumber,Gender,DateOfBirth,role}= req.body;
    try {
        const existingUser = await User.findOne({ 
            $or: [
                { Email: req.body.Email },
                { PhoneNumber: req.body.PhoneNumber}
            ]
        });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'User with this email or phone number already exists'
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.Password, salt);
        const newUser = await User.create({
            ...req.body,
            DateOfBirth: new Date(DateOfBirth),
            Password: hashedPassword
        });
        const token = createToken(newUser._id);
        const userResponse = newUser.toObject();
        delete userResponse.Password;

        res.status(201).json({
            status: 'success',
            token,
            data: userResponse
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const login = asyncHandler(async (req, res, next) => {
    const {Email, Password} = req.body;
    console.log(`Login attempt for Email: ${Email}, Password: ${Password}`);

    const user = await User.findOne({ Email: Email });
    console.log('User found:', user ? user.Email : 'None');

    if (!user) {
        console.log('No user found for the provided email.');
        return next(new ApiError("Invalid email or password", 401));
    }

    const isPasswordCorrect = await bcrypt.compare(Password, user.Password);
    console.log(`Password comparison result: ${isPasswordCorrect}`);

    if (!isPasswordCorrect) {
        console.log('Password does not match.');
        return next(new ApiError("Invalid email or password", 401));
    }

    const token = createToken(user._id);
    // Set JWT as HTTP-only cookie (always secure: false for local dev)
    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Always false for local development
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    console.log('Login successful, token created and cookie set.');
    res.status(200).json({
        status: "success",
        token,
        data: {
            user: {
                id: user._id,
                role: user.role,
                email: user.Email,
                name: `${user.FName} ${user.LName}`
            }
        }
    });
});

const update = async (req, res) => {
    try {
        if (req.body.Password) {
            delete req.body.Password;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select('-Password');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user found with that ID'
            });
        }

        // Check current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.Password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'fail',
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.Password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, dob, gender, phone, address, doctor, insurance } = req.body;
        const userId = req.user._id;

        // Update User Model
        const [FName, LName] = name.split(' ');

        const updatedUser = await User.findByIdAndUpdate(userId, {
            FName,
            LName,
            Email: email,
            PhoneNumber: phone,
            Gender: gender,
            Address: address,
            DateOfBirth: dob ? new Date(dob) : undefined, // Convert DOB string to Date object
        },
        {
            new: true,
            runValidators: true
        }).select('-Password');

        if (!updatedUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found.'
            });
        }

        // If user is a patient, update Patient Model as well
        if (updatedUser.role === 'Patient') {
            const updatedPatient = await Patient.findOneAndUpdate(
                { userId: updatedUser._id },
                { primaryDoctor: doctor, insuranceName: insurance },
                {
                    new: true,
                    runValidators: true,
                    upsert: true
                }
            );
            if (!updatedPatient) {
                console.log('Patient record not found for user but created new one.');
            }
        }

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully!',
            data: {
                user: updatedUser,
            }
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const deleteById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user found with that ID'
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

// Get user profile (protected route)
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-Password');
        
        res.status(200).json({
            status: 'success',
            data: user
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
    login,
    update,
    updatePassword,
    updateProfile,
    deleteById,
    getProfile
};