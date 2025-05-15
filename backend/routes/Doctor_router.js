const express = require("express");
const DocRouter = express.Router();
const DocController = require("../controllers/Doctor_cont");
DocRouter.get("/all", DocController);