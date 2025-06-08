const express = require("express");
const PatRouter = express.Router();
const PatController = require("../Controllers/patientController");

PatRouter.get("/", PatController.getAll);