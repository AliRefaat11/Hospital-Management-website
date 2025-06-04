const express = require("express");
const PatRouter = express.Router();
const PatController = require("../controllers/patientController");

PatRouter.get("/", PatController.getAll);