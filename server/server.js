const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
    res.send("What next?...");
});

app.listen(port, () => { console.log(`Running on ${port}`) });

const dotenv = require('dotenv');
const cors = require('cors')

dotenv.config();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json(), cors());

const authRoute = require('./routes/auth');
const authDashboard = require('./routes/authDashboard');
const passwordMgmt = require('./routes/passwordMgmt');
const payment = require('./routes/payment');
const notification = require('./routes/notification');
const util = require('./routes/util');

const hooks = require('./routes/hooks/hooks');
const book = require('./routes/into-the-wind/index');

app.use("/api/users", authRoute);
app.use("/api/dashboard", authDashboard);
app.use("/api/password", passwordMgmt);
app.use("/api/payment", payment);
app.use("/api/util", util);

app.use("/api/hooks", hooks);
app.use("/api/notification", notification);
app.use("/api/into-the-wind", book);

