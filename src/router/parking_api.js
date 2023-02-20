import express from "express";
import {
  addParking,
  getAllParking,
  getParkingByCity,
} from "../controller/parking.js";
// import Router from 'express';


// const express = require('express');
const Router = express.Router();

// const Parking = require('../models/Parking');

Router.post("/addparking", addParking);
Router.get("/getallparkings", getAllParking);
Router.get("/getParking/:city", getParkingByCity);

// module.exports = Router;
export default Router;
