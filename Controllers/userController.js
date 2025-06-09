const User = require("../Models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const validateLoginInput = (email, password) => {
    const errors = [];
    
    if (!email || !validator.isEmail(email.trim())) {
        errors.push('Please provide a valid email address');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    return errors;
};

const getAll = async (req, res) => {
    try {
        const users = await User.find().select('-Password'); // Exclude password from response
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
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { Email: req.body.Email },
                { PhoneNumber: req.body.PhoneNumber }
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

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.Password;

        res.status(201).json({
            status: 'success',
            token,
            data: userResponse
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const validationErrors = validateLoginInput(Email, Password);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'fail',
                message: validationErrors.join(', ')
            });
        }
        const normalizedEmail = Email.trim().toLowerCase();

        const user = await User.findOne({ 
            Email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
        });

        if (!user) {

            console.log(`Failed login attempt for email: ${normalizedEmail}`);
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(Password.trim(), user.Password);
        if (!isPasswordCorrect) {
            // Log failed login attempt
            console.log(`Failed login attempt for user: ${user._id}`);
            
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Create token with expiration
        const token = createToken(user._id);

        // Prepare user response without sensitive data
        const userResponse = user.toObject();
        delete userResponse.Password;
        delete userResponse.__v;

        // Log successful login
        console.log(`Successful login for user: ${user._id}`);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: userResponse,
                tokenExpiresIn: process.env.JWT_EXPIRES_IN
            }
        });
    } catch (error) {
        // Log error
        console.error('Login error:', error);
        
        res.status(500).json({
            status: 'error',
            message: 'An error occurred during login. Please try again later.'
        });
    }
};

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

// Delete user
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
    deleteById,
    getProfile
};

