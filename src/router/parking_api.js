import express from "express";
import {
  addParking,
  getAllParking,
  getParkingByCity,
  updateParking,
  deleteParking,
} from "../controller/parking.js";
// import Router from 'express';


// const express = require('express');
const Router = express.Router();

// const Parking = require('../models/Parking');

Router.post("/addparking", addParking);
Router.get("/getallparkings", getAllParking);
Router.get("/getParking/:city", getParkingByCity);
Router.patch("/updateparking/:id", updateParking);
Router.delete("/deleteparking/:id", deleteParking);

// module.exports = Router;
export default Router;
