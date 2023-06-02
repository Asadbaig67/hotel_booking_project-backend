import express from "express";
const router = express.Router();
import {
  addBooking,
  getBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  UserBookings,
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
  cancelHotelAndParkingReservation,
  getBookingByHotelId,
  getBookingByParkingId,
  getBookingByHotelAndParkingId,
  getUpcommingBookingsByHotelOwnerId,
  getUpcommingBookingsByHotelParkingOwnerId,
  getUpcommingBookingsByParkingOwnerId,
  getUpcommingBookingsByHotelId,
  getUpcommingBookingsByHotelParkingId,
  getUpcommingBookingsByParkingId,
  getAllCancelledBookings,
  getCancelledBookingsByUserId,
  getCancelledBookingsByHotelId,
  getCancelledBookingsByParkingId,
  getCancelledBookingsByHotelAndParkingId,
  getCancelledBookingsByHotelOwnerId,
  getCancelledBookingsByParkingOwnerId,
  getCancelledBookingsByHotelAndParkingOwnerId,
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
router.get(
  "/getPreviousBookingHotelByUserId/:id",
  getPreviousBookingHotelByUserId
);

//Get Previous parking booking by user id
router.get(
  "/getPreviousBookingParkingByUserId/:id",
  getPreviousBookingParkingByUserId
);

//Get Previous hotel and parking booking by user id
router.get(
  "/getPreviousBookingHotelandParkingByUserId/:id",
  getPreviousBookingHotelandParkingByUserId
);

//Get Upcoming hotel booking by user id
router.get(
  "/getUpcomingBookingHotelByUserId/:id",
  getUpcomingBookingHotelByUserId
);

//Get Upcoming parking booking by user id
router.get(
  "/getUpcomingBookingParkingByUserId/:id",
  getUpcomingBookingParkingByUserId
);

//Get Upcoming hotel and parking booking by user id
router.get(
  "/getUpcomingBookingHotelandParkingByUserId/:id",
  getUpcomingBookingHotelandParkingByUserId
);

// Get Upcoming Bookings By Hotel Owner Id
router.get(
  "/getUpcommingBookingsByHotelOwnerId/:id",
  getUpcommingBookingsByHotelOwnerId
);

// Get Upcoming Bookings By Hotel And Parking Owner Id
router.get(
  "/getUpcommingBookingsByHotelparkingOwnerId/:id",
  getUpcommingBookingsByHotelParkingOwnerId
);

// Get Upcoming Bookings By Parking Owner Id
router.get(
  "/getUpcommingBookingsByParkingOwnerId/:id",
  getUpcommingBookingsByParkingOwnerId
);

// Get Upcoming Bookings By Hotel Owner Id
router.get("/getUpcommingBookingsByHotelId/:id", getUpcommingBookingsByHotelId);

// Get Upcoming Bookings By Hotel And Parking Owner Id
router.get(
  "/getUpcommingBookingsByHotelparkingId/:id",
  getUpcommingBookingsByHotelParkingId
);

// Get Upcoming Bookings By Parking Owner Id
router.get(
  "/getUpcommingBookingsByParkingId/:id",
  getUpcommingBookingsByParkingId
);

//Get Specific Parking Booking By Hotel Id
router.get("/getBookingByHotelId/:id", getBookingByHotelId);

//Get Specific Parking Booking By Hotel Id
router.get("/getBookingByParkingId/:id", getBookingByParkingId);

//Get Specific Parking Booking By Hotel Id
router.get("/getBookingByHotelAndParkingId/:id", getBookingByHotelAndParkingId);

//Get All Cancelled Bookings
router.get("/getCancelledBookings", getAllCancelledBookings);

//Get Cancelled Bookings By User Id
router.get("/getCancelledBookings", getCancelledBookingsByUserId);

//Get Cancelled Bookings By Hotel Id
router.get("/getCancelledBookings", getCancelledBookingsByHotelId);

//Get Cancelled Bookings By Parking Id
router.get("/getCancelledBookings", getCancelledBookingsByParkingId);

//Get Cancelled Bookings By Hotel And Parking Id
router.get("/getCancelledBookings", getCancelledBookingsByHotelAndParkingId);

//Get Cancelled Bookings By Hotel OwnerId
router.get("/getCancelledBookings", getCancelledBookingsByHotelOwnerId);

//Get Cancelled Bookings By Parking OwnerId
router.get("/getCancelledBookings", getCancelledBookingsByParkingOwnerId);

//Get Cancelled Bookings By Hotel And Parking OwnerId
router.get(
  "/getCancelledBookings",
  getCancelledBookingsByHotelAndParkingOwnerId
);

// Add New User Booking
router.post("/userBooking", UserBookings);
// Update Booking
router.put("/updateBooking/:id", updateBooking);
// Delete Booking
router.delete("/deleteBooking/:id", deleteBooking);
// Cancel Hotel Reservation
router.delete("/cancelHotelReservation/:id", cancelHotelReservation);
// Cancel Parking Reservation
router.delete("/cancelParkingReservation/:id", cancelParkingReservation);
// Cancel Hotel And Parking Reservation
router.delete("/cancelHotelAndParkingReservation/:id", cancelHotelAndParkingReservation);

export default router;
