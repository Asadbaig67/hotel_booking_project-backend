import express from "express";
import {
  addParking,
  getAllParking,
  getParkingByCity,
  updateParking,
  deleteParking,
  getParkingBySearch,
  updateParkingBookedSlots,
  getParkingById,
  getPendingParking,
  approveParking,
  getParkingByOwnerId,
} from "../controller/parking.js";

const Router = express.Router();

// Add Parking Route
Router.post("/addparking", addParking);
// Get Parking By Search Route
Router.get("/search", getParkingBySearch);
// Get All Parking Route
Router.get("/getallparkings", getAllParking);
// Get pending parkings
Router.get("/getpendingparkings", getPendingParking);
// Get Parking By City Route
Router.get("/getParking/:city", getParkingByCity);
// Get Parking By Id Route
Router.get("/getParkingById/:id", getParkingById);
//Get Parking By Owner Id Route
Router.get("/getParkingByOwnerId/:id", getParkingByOwnerId);
// Update Parking Route
Router.patch("/updateparking/:id", updateParking);
// Increment Booked Slots Route
Router.put("/increasebookedslots/:id", updateParkingBookedSlots);
//Approve Parking Route
Router.put("/approveParking/:id", approveParking);
// Delete Parking Route
Router.delete("/deleteparking/:id", deleteParking);

export default Router;
