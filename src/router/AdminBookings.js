import express from "express";
import { AddHotelBooking, AddHotelAndParkingBooking,AddParkingBooking } from '../controller/AdminBookings.js';
const Router = express.Router();

// Post Apis
Router.post("/hotelbooking", AddHotelBooking);
Router.post("/hotelandparkingbooking", AddHotelAndParkingBooking);
Router.post("/parkingbooking", AddParkingBooking);


// Get Apis




// Put Apis



// Delete Apis










export default Router;