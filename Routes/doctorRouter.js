const express = require("express");
const DrRouter = express.Router();
const DocController = require("../Controllers/doctorController");
const Department = require('../Models/departmentModel');

DrRouter.get("/", DocController.getAll);
DrRouter.get("/search", DocController.search);
DrRouter.get("/:id", DocController.getById);
DrRouter.post("/", DocController.create);
DrRouter.patch("/:id", DocController.update);
DrRouter.delete("/:id", DocController.deleteById);
DrRouter.get("/department/:departmentId", DocController.getByDepartment);
DrRouter.get("/specialization/:specialization", DocController.getBySpecialization);

module.exports = DrRouter;