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
} from "../controller/booking.js";

// Add Booking
router.post("/addBooking", addBooking);
// Get All Bookings
router.get("/getBooking", getBooking);
// Get Specific Booking By Id
router.get("/getBooking/:id", getBookingById);
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
