const User = require("../Models/userModel");
const { auth, createToken, allowedTo, ApiError } = require("../middleware/authMiddleware");
const bcrypt = require('bcryptjs');
const validator = require('validator');
const asyncHandler = require('express-async-handler');

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
    const {FName,LName,Email,Password,PhoneNumber,Gender,Age,role}= req.body;
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
    console.log('User role from database:', user ? user.role : 'N/A');

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
    
    if (user.role === 'Admin') {
        return res.redirect('/admin/dashboard'); // Redirect admin to the new dashboard page
    } else {
        res.redirect('/');
    }
});

const update = async (req, res) => {
    try {
        if (req.body.Password) {
            delete req.body.Password;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                ...req.body,
                // Assuming emailNotifications, smsNotifications, privateProfile are boolean and may not always be present in req.body
                // Spreading req.body handles direct updates to these if they are sent.
                // If you need to explicitly ensure these are set to false when not present,
                // you would need additional logic here (e.g., emailNotifications: req.body.emailNotifications || false).
                // For now, we'll rely on ...req.body to pass any present fields.
            },
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
            data: user,
            message: 'Settings updated successfully!'
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
        const user = await User.findById(req.params.id);
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
const getProfile = asyncHandler(async (req, res, next) => {
    try {
        // Fetch the profile of the currently authenticated user
        const user = await User.findById(req.user.id).select('-Password');

        if (!user) {
            return next(new ApiError("User not found", 404));
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        next(new ApiError("Failed to fetch user profile", 500));
    }
});

module.exports = {
    getAll,
    getById,
    create,
    login,
    update,
    updatePassword,
    deleteById,
    getProfile
};