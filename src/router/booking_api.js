import express from "express";
const router = express.Router();
import {
  addBooking,
  getBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  UserBooking,
  getBookingHotelByOwnerId,
  getBookingParkingByOwnerId,
  getBookingHotelandParkingByOwnerId,
  getBookingByType,
  addBookingParking,
  addBookingHotelAndParking
} from "../controller/booking.js";

// Add Hotel Booking
router.post("/addBooking", addBooking);
// Add Parking Booking
router.post("/addParkingBooking", addBookingParking);
// Add Hotel and Parking Booking
router.post("/addHotelAndParkingBooking", addBookingHotelAndParking);
// Get All Bookings
router.get("/getBooking", getBooking);
// Get Specific Booking By Id
router.get("/getBooking/:id", getBookingById);
//Get booking by type
router.get("/getBookingByType/:type", getBookingByType);
//Get Specific Hotel Booking By Owner Id
router.get("/getBookingHotelByOwnerId/:id", getBookingHotelByOwnerId);
//Get Specific Parking Booking By Owner Id
router.get("/getBookingParkingByOwnerId/:id", getBookingParkingByOwnerId);
//Get Specific Hotel Booking By Owner Id
router.get(
  "/getBookingHotelandParkingByOwnerId/:id",
  getBookingHotelandParkingByOwnerId
);


// Add New User Booking
router.post("/userBooking", UserBooking);
// Update Booking
router.put("/updateBooking/:id", updateBooking);
// Delete Booking
router.delete("/deleteBooking/:id", deleteBooking);

export default router;
