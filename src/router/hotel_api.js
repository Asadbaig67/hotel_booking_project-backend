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
  getHotelByCityCount,
  getHotelByRatingFilter,
  deleteHotelImages,
  UpdateHotel,
  approveHotelAndUpdateRating,
  getChartDataForHotel,
  getDeListedByOwnerId,
  getAllDeListedHotels,
  addHotelToList
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
//Get count of approved hotel by city name
Router.get("/getcountofapprovedhotelbycity/:city", getHotelByCityCount);
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
// Get Chart Data For Admin Hotel
Router.get("/chart/hotelData", getChartDataForHotel);
// Update Hotel New
Router.patch("/updatehoteldata/:id", UpdateHotel);
// Update Hotel Old
Router.patch("/updatehotel/:id", updateHotel);
//Approve Hotel
Router.put("/approvehotel/:id", approveHotel);
//Approve Hotel and update rating
Router.put("/approvehotelAndUpdateRating/:id", approveHotelAndUpdateRating);
//Get delisted hotel by onwer id
Router.get("/getdelistedhotelbyonwerid/:id", getDeListedByOwnerId);
// Add hotel to the listing
Router.put("/addHotelToList", addHotelToList);
//Get all delisted hotel
Router.get("/getalldelistedhotel", getAllDeListedHotels);
// Delete Hotel
Router.delete("/deletehotel/:id", deleteHotel);
//Filter data
Router.get("/filterRating", getHotelByRatingFilter);

Router.delete("/deletehotelImage/:id", deleteHotelImages);

export default Router;
