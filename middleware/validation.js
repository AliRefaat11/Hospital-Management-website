const validator = require('validator');

const validateEmail = (email) => {
    return validator.isEmail(email);
};

const validatePhoneNumber = (phone) => {
    // Basic phone number validation (adjust regex based on your requirements)
    return validator.matches(phone, /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/);
};

const validatePassword = (password) => {
    // Password should be at least 8 characters long and contain at least one number
    return validator.isLength(password, { min: 8 }) && 
           validator.matches(password, /[0-9]/) &&
           validator.matches(password, /[A-Z]/) &&
           validator.matches(password, /[a-z]/);
};

const validateDate = (date) => {
    return validator.isDate(date);
};

const validateNumeric = (value) => {
    return validator.isNumeric(value);
};

const validateAlphanumeric = (value) => {
    return validator.isAlphanumeric(value);
};

const validateURL = (url) => {
    return validator.isURL(url);
};

const validateObjectId = (id) => {
    return validator.isMongoId(id);
};

const validateRequired = (value) => {
    return value !== undefined && value !== null && value !== '';
};

const validateLength = (value, { min, max }) => {
    return validator.isLength(value, { min, max });
};

module.exports = {
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
}; 