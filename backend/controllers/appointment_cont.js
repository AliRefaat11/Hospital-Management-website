const model = require("../models/appointment_mod");
const AppModel = new model();

getAll=async (req, res) => {
    let data = await AppModel.getAllAppointments();
    res.send(data);
}

module.exports={getAll}