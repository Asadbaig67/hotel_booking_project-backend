import express from "express";
import {
  addhotelandparking,
  getAllhotelandparkings,
  gethotelandparkingbyCity,
  updateHotelAndParking,
  deleteHotelAndParking,
  getHotelAndParkingBySearch,
  incrementSlotsCount,
  gethotelandparkingbyId,
  getPendinghotelandparkings,
  approveHotelAndParking,
  getBothhotelandparkings,
  gethotelandparkingbyCitySearch,
} from "../controller/hotelandparking.js";

const Router = express.Router();

// Add Hotel And Parking
Router.post("/addhotelandparking", addhotelandparking);
// Get All Hotel And Parking
Router.get("/getallhotelandparkings", getAllhotelandparkings);
// Get Pending Hotel And Parking
Router.get("/getPendinghotelandparkings", getPendinghotelandparkings);
// Get Aprroved/unapproved Hotel And Parking
Router.get("/getBothhotelandparkings", getBothhotelandparkings);
// Get Hotel And Parking By Specific City
Router.get("/gethotel/:city", gethotelandparkingbyCity);
// Get Hotel And Parking By Specific City
Router.get("/cityhotel/:city", gethotelandparkingbyCitySearch);
// Get hotel and parking by id
Router.get("/gethotelandparkingbyid/:id", gethotelandparkingbyId);
// Search Hotel And Parking By Search Query
Router.get("/search", getHotelAndParkingBySearch);
// Update Hotel And Parking Booked Slots
Router.put("/Incrementbookedslots/:id", incrementSlotsCount);
// Update Hotel And Parking Approved Status
Router.put("/approveHotelAndParking/:id", approveHotelAndParking);
// Update Hotel And Parking
Router.patch("/updatehotelandparking/:id", updateHotelAndParking);
// Delete Hotel And Parking
Router.delete("/deletehotelandparking/:id", deleteHotelAndParking);

// Exporting Router
export default Router;
