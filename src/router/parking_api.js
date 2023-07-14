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
  getApprovedParkingByOwnerId,
  getUnapprovedParkingByOwnerId,
  UpdateParkingNew,
  deleteParkingImages,
  approveParkingAndUpdateRating,
  getChartDataForParking,
  getDelistedParkingByOwnerId,
  getAllDelistedParking,
  addParkingToList
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
//Get Approved Parking By Owner Id Route
Router.get("/getApprovedParkingByOwnerId/:id", getApprovedParkingByOwnerId);
//Get unapproved Parking By Owner Id Route
Router.get("/getUnapprovedParkingByOwnerId/:id", getUnapprovedParkingByOwnerId);
//Get delisted Parking By Owner Id Route
Router.get("/getDelistedParkingByOwnerId/:id", getDelistedParkingByOwnerId);
// Add to the list parking route
Router.post("/addParkingToList", addParkingToList);
//Get All delisted Parking Route
Router.get("/getAllDelistedParking", getAllDelistedParking);
// Get Chart Data For Admin Hotel
Router.get("/chart/parkingData", getChartDataForParking);
// Update Parking Route
Router.patch("/updateparking/:id", updateParking);
// Update Parking New
Router.patch("/updateparkingdata/:id", UpdateParkingNew);
// Increment Booked Slots Route
Router.put("/increasebookedslots/:id", updateParkingBookedSlots);
//Approve Parking Route
Router.put("/approveParking/:id", approveParking);
//Approve Parking Route and update rating
Router.put("/approveParkingAndUpdateRating/:id", approveParkingAndUpdateRating);
// Delete Parking Route
Router.delete("/deleteparking/:id", deleteParking);
// Delete Parking Images
Router.delete("/deleteparkingimage/:id", deleteParkingImages);

export default Router;
