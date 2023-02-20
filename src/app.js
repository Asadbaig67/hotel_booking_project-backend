import express from "express";
import dotenv from "dotenv";
import connect from "./db/connection.js";
import cookieParser from "cookie-parser";
import user from "./router/auth.js";
import Hotel from "./router/hotel_api.js";
import Parking from "./router/parking_api.js";
import Room from "./router/room_api.js";
import cors from "cors";
dotenv.config({ path: "./src/config/config.env" });
const db = process.env.DATABASE;
connect(db);

// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const Connection = require('./db/connection');
// const cookieParser = require('cookie-parser');
// const user = require('./router/auth');
// const Hotel = require('./router/hotel_api');
// const Parking = require('./router/parking_api');
// const Room = require('./router/room_api');
// const cors = require('cors');
const app = express();

// To parse cookies
app.use(cookieParser());

// To access private variables we added the path to file
// dotenv.config({ path: "./src/config/config.env" });
const port = process.env.PORT;

// To parse json data
app.use(express.json());

// Database Connection
// Connection();

// To avoid cors error
app.use(cors());

// To access static files
app.get("/", (req, res) => {
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
});
