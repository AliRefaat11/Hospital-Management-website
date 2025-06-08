const express = require("express");
const DocRouter = express.Router();
const DocController = require("../Controllers/doctorController");

DocRouter.get("/", DocController.getAll);