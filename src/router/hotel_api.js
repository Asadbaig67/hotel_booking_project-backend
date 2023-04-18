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
  getHotelByOwnerId,
  getTopHotels,
  getApprovedHotelByOwnerId,
  getUnapprovedHotelByOwnerId,
} from "../controller/hotel.js";

// Initialize multer with the storage configuration
const Router = express.Router();

// Add Hotel
Router.post("/addhotel", addHotel);

// Get All Hotels
Router.get("/getallhotels", getAllHotels);
// Get Pending Hotels
Router.get("/getPendinghotels", getPendingHotels);
// Get Hotel By id
Router.get("/gethotelbyid/:id", getHotelsById);
//Get Hotel by onwer id
Router.get("/gethotelbyonwerid/:id", getHotelByOwnerId);
//Get approved hotel by onwer id
Router.get("/getApprovedhotelbyonwerid/:id", getApprovedHotelByOwnerId);
//Get unapproved hotel by onwer id
Router.get("/getUnapprovedhotelbyonwerid/:id", getUnapprovedHotelByOwnerId);
// Get Hotel By City Name
Router.get("/gethotelbycity/:city", getHotelByCityName);
// Get Top 4 Hotels
Router.get("/gettophotels", getTopHotels);
// Get Hotel By City
Router.get("/search", getHotelByCity);
// Update Hotel
Router.patch("/updatehotel/:id", updateHotel);
//Approve Hotel
Router.put("/approvehotel/:id", approveHotel);
// Delete Hotel
Router.delete("/deletehotel/:id", deleteHotel);

export default Router;
