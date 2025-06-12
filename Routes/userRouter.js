const express = require("express");
const UserRouter = express.Router();
const UserController = require("../Controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

// Validation rules
const signupValidation = {
    email: { required: true, email: true },
    password: { required: true, password: true },
    name: { required: true, length: { min: 2, max: 50 } },
    phone: { required: true, phone: true }
};

const loginValidation = {
    email: { required: true, email: true },
    password: { required: true }
};

const updatePasswordValidation = {
    currentPassword: { required: true },
    newPassword: { required: true, password: true }
};

const updateValidation = {
    name: { length: { min: 2, max: 50 } },
    email: { email: true },
    phone: { phone: true }
};

UserRouter.post("/signup", validateRequest(signupValidation), UserController.create);
UserRouter.post("/login", validateRequest(loginValidation), UserController.login);

// Protect all routes after this middleware
UserRouter.use(authMiddleware);

UserRouter.get("/profile", UserController.getProfile);
UserRouter.get("/", UserController.getAll);
UserRouter.get("/:id", UserController.getById);
UserRouter.patch("/:id", validateRequest(updateValidation), UserController.update);
UserRouter.delete("/:id", UserController.deleteById);
UserRouter.patch("/:id/password", validateRequest(updatePasswordValidation), UserController.updatePassword);

module.exports = UserRouter;
