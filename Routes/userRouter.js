const express = require("express");
const UserRouter = express.Router();
const UserController = require("../Controllers/userController");
const { auth, allowedTo } = require("../middleware/authMiddleware");

// Public routes (no auth needed)
UserRouter.post("/signup", UserController.create);
UserRouter.post("/login", UserController.login);

// Protected routes (require authentication)
UserRouter.use(auth); // Apply auth middleware to all routes below

// Routes accessible by the user themselves
UserRouter.get("/profile", UserController.getProfile);
UserRouter.patch("/profile", UserController.update);
UserRouter.patch("/profile/password", UserController.updatePassword);

// Admin only routes
UserRouter.use(allowedTo('Admin')); // Apply admin role check to all routes below
UserRouter.get("/", UserController.getAll);
UserRouter.get("/:id", UserController.getById);
UserRouter.patch("/:id", UserController.update);
UserRouter.delete("/:id", UserController.deleteById);
UserRouter.patch("/:id/password", UserController.updatePassword);

module.exports = UserRouter;