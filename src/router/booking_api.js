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
  addBookingHotelAndParking,
  getPreviousBookingHotelByUserId,
  getPreviousBookingParkingByUserId,
  getPreviousBookingHotelandParkingByUserId,
  getUpcomingBookingHotelByUserId,
  getUpcomingBookingParkingByUserId,
  getUpcomingBookingHotelandParkingByUserId,
  cancelHotelReservation,
  cancelParkingReservation,
  cancelHotelAndParkingReservation
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

//Get Previous hotel booking by user id
router.get("/getPreviousBookingHotelByUserId/:id", getPreviousBookingHotelByUserId);

//Get Previous parking booking by user id
router.get("/getPreviousBookingParkingByUserId/:id", getPreviousBookingParkingByUserId);

//Get Previous hotel and parking booking by user id
router.get(
  "/getPreviousBookingHotelandParkingByUserId/:id",
  getPreviousBookingHotelandParkingByUserId
);

//Get Upcoming hotel booking by user id
router.get("/getUpcomingBookingHotelByUserId/:id", getUpcomingBookingHotelByUserId);

//Get Upcoming parking booking by user id
router.get("/getUpcomingBookingParkingByUserId/:id", getUpcomingBookingParkingByUserId);

//Get Upcoming hotel and parking booking by user id
router.get(
  "/getUpcomingBookingHotelandParkingByUserId/:id",
  getUpcomingBookingHotelandParkingByUserId
);
// Add New User Booking
router.post("/userBooking", UserBooking);
// Update Booking
router.put("/updateBooking/:id", updateBooking);
// Delete Booking
router.delete("/deleteBooking/:id", deleteBooking);
// Cancel Hotel Reservation
router.delete("/cancelHotelReservation/:id", cancelHotelReservation);
// Cancel Parking Reservation
router.delete("/cancelParkingReservation/:id", cancelParkingReservation);
// Cancel Hotel And Parking Reservation
router.delete("/cancelHotelAndParkingReservation/:id", cancelHotelReservation);



export default router;
