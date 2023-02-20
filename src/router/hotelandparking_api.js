import express from "express";
import { addhotelandparking, getAllhotelandparkings, gethotelandparkingbyCity } from "../controller/hotelandparking.js"
// import Router from 'express';

// const express = require('express');
const Router = express.Router();

// const Hotel = require('../models/Hotel');

Router.post('/addhotelandparking', addhotelandparking);

Router.get('/getallhotelandparkings', getAllhotelandparkings);

Router.get('/gethotel/:city', gethotelandparkingbyCity);



// module.exports = Router;

export default Router;
