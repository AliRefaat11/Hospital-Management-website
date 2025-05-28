const express = require("express");
const PatRouter = express.Router();
const PatController = require("../controllers/patient_cont");
PatRouter.get("/all", PatController);