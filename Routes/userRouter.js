const express = require("express");
const UserRouter = express.Router();
const UserController = require("../Controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

UserRouter.post("/signup", UserController.create);
UserRouter.post("/login", UserController.login);

// Protect all routes after this middleware
UserRouter.use(authMiddleware);

UserRouter.get("/profile", UserController.getProfile);
UserRouter.get("/", UserController.getAll);
UserRouter.get("/:id", UserController.getById);
UserRouter.patch("/:id", UserController.update);
UserRouter.delete("/:id", UserController.deleteById);
UserRouter.patch("/:id/password", UserController.updatePassword);

module.exports = UserRouter;
