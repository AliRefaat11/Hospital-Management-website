const {
    validateEmail,
    validatePhoneNumber,
    validatePassword,
    validateDate,
    validateNumeric,
    validateAlphanumeric,
    validateURL,
    validateObjectId,
    validateRequired,
    validateLength
} = require('./validation');

const validateRequest = (validationRules) => {
    return (req, res, next) => {
        const errors = {};

        // Validate each field according to the rules
        for (const [field, rules] of Object.entries(validationRules)) {
            const value = req.body[field];

            // Check if field is required
            if (rules.required && !validateRequired(value)) {
                errors[field] = `${field} is required`;
                continue;
            }

            // Skip other validations if value is not provided and not required
            if (!validateRequired(value)) {
                continue;
            }

            // Apply all validation rules
            if (rules.email && !validateEmail(value)) {
                errors[field] = 'Invalid email format';
            }
            if (rules.phone && !validatePhoneNumber(value)) {
                errors[field] = 'Invalid phone number format';
            }
            if (rules.password && !validatePassword(value)) {
                errors[field] = 'Password must be at least 8 characters long and contain at least one number, one uppercase and one lowercase letter';
            }
            if (rules.date && !validateDate(value)) {
                errors[field] = 'Invalid date format';
            }
            if (rules.numeric && !validateNumeric(value)) {
                errors[field] = 'Must be a number';
            }
            if (rules.alphanumeric && !validateAlphanumeric(value)) {
                errors[field] = 'Must contain only letters and numbers';
            }
            if (rules.url && !validateURL(value)) {
                errors[field] = 'Invalid URL format';
            }
            if (rules.objectId && !validateObjectId(value)) {
                errors[field] = 'Invalid ID format';
            }
            if (rules.length && !validateLength(value, rules.length)) {
                errors[field] = `Length must be between ${rules.length.min} and ${rules.length.max} characters`;
            }
        }

        // If there are any errors, return them
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                status: 'error',
                errors
            });
        }

        // If no errors, proceed to the next middleware
        next();
    };
};

module.exports = validateRequest; 