const mongoose = require("mongoose");

const dbconnection = () => {
    console.log(`data base urlv= ${process.env.DB_URI}`);
  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(`connected to database: ${conn.connection.host}`);
  });
};

module.exports = dbconnection;