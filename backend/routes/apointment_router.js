const express = require("express");
const AppRouter = express.Router();
const AppController = require("../controllers/patient_cont");
AppRouter.get("/all", AppController);