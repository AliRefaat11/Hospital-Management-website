const model = require("../models/doctorModel");
const DocModel = new model();

getAll=async (req, res) => {
    let data = await DocModel.getAllDoctors();
    res.send(data);
}

module.exports={getAll}