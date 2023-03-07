import express from "express";
import {
  addParking,
  getAllParking,
  getParkingByCity,
  updateParking,
  deleteParking,
  getParkingBySearch,
} from "../controller/parking.js";


const Router = express.Router();


// Add Parking Route
Router.post("/addparking", addParking);
// Get Parking By Search Route
Router.get("/getparkingbysearch", getParkingBySearch);
// Get All Parking Route
Router.get("/getallparkings", getAllParking);
// Get Parking By City Route
Router.get("/getParking/:city", getParkingByCity);
// Update Parking Route
Router.patch("/updateparking/:id", updateParking);
// Delete Parking Route
Router.delete("/deleteparking/:id", deleteParking);

export default Router;
