const model = require("../models/patientModel");
const PatModel = new model();

getAll=async (req, res) => {
    let data = await PatModel.getAllPatients();
    res.send(data);
}

module.exports={getAll}