const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Connection = require('./db/connection');
const cookieParser = require('cookie-parser');
const user = require('./router/auth');
const Hotel = require('./router/hotel_api');
const Parking = require('./router/parking_api');
const Room = require('./router/room_api');
const cors = require('cors');
const app = express();

// To parse cookies
app.use(cookieParser());

// To access private variables we added the path to file
dotenv.config({ path: './config/config.env' });
const port = process.env.PORT;

// To parse json data
app.use(express.json());

// To avoid deprication warning
mongoose.set('strictQuery', false);

// Database Connection
Connection();

// To avoid cors error
app.use(cors());

// To access static files
app.get('/', (req, res) => {
    res.send("This is server");
});

// To access private routes
app.use(user);
app.use(Hotel);
app.use(Parking);
app.use(Room);

// To listen to port
app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
})