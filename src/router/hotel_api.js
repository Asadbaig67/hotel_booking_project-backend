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
  getHotelByCityName,
} from "../controller/hotel.js";

// Initialize multer with the storage configuration
const Router = express.Router();

// Add Hotel
Router.post("/addhotel", addHotel)

// Get All Hotels
Router.get("/getallhotels", getAllHotels);
// Get Pending Hotels
Router.get("/getPendinghotels", getPendingHotels);
// Get Hotel By id
Router.get("/gethotelbyid/:id", getHotelsById);
// Get Hotel By City Name
Router.get("/gethotelbycity/:city", getHotelByCityName);
// Get Hotel By City
Router.get("/search", getHotelByCity);
// Update Hotel
Router.patch("/updatehotel/:id", updateHotel);
//Approve Hotel
Router.put("/approvehotel/:id", approveHotel);
// Delete Hotel
Router.delete("/deletehotel/:id", deleteHotel);

export default Router;
