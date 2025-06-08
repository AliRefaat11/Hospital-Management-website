const express = require("express");
const AppRouter = express.Router();
const AppController = require("../controllers/appointmentController");

AppRouter.get("/", AppController.getAll);