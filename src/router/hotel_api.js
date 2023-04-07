import express from "express";
import {
  addHotel,
  getAllHotels,
  getHotelByCity,
  updateHotel,
  deleteHotel,
  getHotelsById,
  getPendingHotels,
  approveHotel,
} from "../controller/hotel.js";

const Router = express.Router();

// Add Hotel
Router.post("/addhotel", addHotel);
// Get All Hotels
Router.get("/getallhotels", getAllHotels);
// Get Pending Hotels
Router.get("/getPendinghotels", getPendingHotels);
// Get Hotel By id
Router.get("/gethotelbyid/:id", getHotelsById);
// Get Hotel By City
Router.get("/search", getHotelByCity);
// Update Hotel
Router.patch("/updatehotel/:id", updateHotel);
//Approve Hotel
Router.put("/approvehotel/:id", approveHotel);
// Delete Hotel
Router.delete("/deletehotel/:id", deleteHotel);

export default Router;
