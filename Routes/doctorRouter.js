const express = require("express");
const DocRouter = express.Router();
const DocController = require("../Controllers/doctorController");

DocRouter.get("/", DocController.getAll);
DocRouter.get("/:id", DocController.getById);
DocRouter.post("/", DocController.create);
DocRouter.patch("/:id", DocController.update);
DocRouter.delete("/:id", DocController.deleteById);

DocRouter.get("/department/:departmentId", DocController.getByDepartment);
DocRouter.get("/specialization/:specialization", DocController.getBySpecialization);

module.exports = DocRouter;