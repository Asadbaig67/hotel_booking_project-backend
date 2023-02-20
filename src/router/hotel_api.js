import express from "express";
import { addHotel, getAllHotels, getHotelByCity } from "../controller/hotel.js";
// import Router from 'express';
import Hotel from "../models/Hotel.js";
// const express = require('express');
const Router = express.Router();

// const Hotel = require('../models/Hotel');

Router.post("/addhotel", addHotel);
Router.get("/getallhotels", getAllHotels);
Router.get("/gethotel/:city", getHotelByCity);

// module.exports = Router;

export default Router;
