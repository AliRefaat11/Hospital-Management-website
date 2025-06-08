const express = require("express");
const DocRouter = express.Router();
const DocController = require("../controllers/doctorController");

DocRouter.get("/", DocController.getAll);