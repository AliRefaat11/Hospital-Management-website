const express = require('express');
const DocRouter = require('./routes/Doctor_router');
const app = express();

app.use(express.static("./frontend"));
app.use('/Doctors', DocRouter);
const port = 3000;



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});