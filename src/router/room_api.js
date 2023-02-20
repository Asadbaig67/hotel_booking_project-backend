import express from "express";
import { addRoom, getAllRoom } from "../controller/room.js";
// import Router from "express";


// const express = require('express');
const Router = express.Router();

// const Room = require('../models/Room');

Router.post("/addroom", addRoom);

Router.get("/getallrooms", getAllRoom);

// module.exports = Router;
export default Router;
