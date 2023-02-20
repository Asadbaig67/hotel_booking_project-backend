import express from "express";
import { addParking, getAllParking } from "../controller/parking.js";
// import Router from 'express';
import Parking from "../models/Parking.js";

// const express = require('express');
const Router = express.Router();

// const Parking = require('../models/Parking');

Router.post("/addparking", addParking);
Router.get("/getallparkings", getAllParking);

// module.exports = Router;
export default Router;
