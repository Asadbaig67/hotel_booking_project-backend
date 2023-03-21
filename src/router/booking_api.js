import express from "express";
const router = express.Router();
import { addBooking, getBooking, getBookingById, updateBooking, deleteBooking, UserBooking } from "../controller/booking.js";

// Add Booking
router.post("/addBooking", addBooking);
// Get All Bookings
router.get("/getBooking", getBooking);
// Get Specific Booking By Id
router.get("/getBooking/:id", getBookingById);
// Add New User Booking
router.post("/UserBooking", UserBooking);
// Update Booking
router.put("/updateBooking/:id", updateBooking);
// Delete Booking
router.delete("/deleteBooking/:id", deleteBooking);

export default router;
