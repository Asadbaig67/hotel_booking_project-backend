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
  freeBookedParkingSlotsByBookingId,
  freeBookedHotelAndParkingByBookingId,
  freeBookedHotelRoomsByBookingId,
  getAllPreviousBooking,
  getPreviousBookingByHotelOwnerId,
  getPreviousBookingByParkingOwnerId,
  getPreviousBookingByHotelAndParkingOwnerId,
  getAllUpcomingBooking,
  getAllPreviousBookingByUserId,
  getAllUpcomingBookingByUserId,
  getBookingChartDataForHotel,
  getBookingChartDataForHotelandParking,
  getBookingChartDataForParking,
  getCombinedBookingChartDataForHotelPartner,
  getBookingChartDataForHotelPartner,
  getCombinedBookingChartDataForHotelParkingPartner,
  getCombinedBookingChartDataForParkingPartner,
  getBookingChartDataForHotelParkingPartner,
  getBookingChartDataForParkingPartner,
  getUserBookingChartDataForHotel,
  getUserBookingChartDataForParking,
  getUserBookingChartDataForHotelAndParking,
  getUserAllBookingChartData,
  getAllBookingsByUserId,
  getAllBookingChartDataForHotel,
  getAllBookingChartDataForParking,
  getAllBookingChartDataForHotelAndParking,
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
//Get all bookings by userId
router.get("/getAllBookingsByUserId/:id", getAllBookingsByUserId);
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

// Get All Previous Bookings
router.get("/getAllPreviousBookings", getAllPreviousBooking);

// Get All Previous Bookings By User Id
router.get(
  "/getAllPreviousBookingsByUserId/:id",
  getAllPreviousBookingByUserId
);

// Get Previous Bookings By Hotel Owner Id
router.get(
  "/getPreviousBookingsByHotelOwnerId/:id",
  getPreviousBookingByHotelOwnerId
);

// Get Hotel Booking Data For Chart
router.get("/chart/hotelbookings/:id", getBookingChartDataForHotel);

// Get Hotel and parking Booking Data For Chart
router.get(
  "/chart/hotelandparkingbookings/:id",
  getBookingChartDataForHotelandParking
);

//Get all hotel bookings data for chart
router.get("/chart/Allhotelbookings", getAllBookingChartDataForHotel);

//Get all hotel bookings data for chart
router.get("/chart/Allparkingbookings", getAllBookingChartDataForParking);

//Get all hotel bookings data for chart
router.get("/chart/Allhotelandparkingbookings", getAllBookingChartDataForHotelAndParking);

// Get parking Booking Data For Chart
router.get("/chart/parkingbookings/:id", getBookingChartDataForParking);

// Get Combined Partner Hotel Chart Data
router.get(
  "/chart/combinedpartnerhotel/:id",
  getCombinedBookingChartDataForHotelPartner
);

// Get Partner Hotel Booking Data For Chart For All Hotels
router.get(
  "/chart/partnerhotelbookings/:id",
  getBookingChartDataForHotelPartner
);

// Get Combined Partner Hotel Chart Data
router.get(
  "/chart/combinedpartnerhotelparking/:id",
  getCombinedBookingChartDataForHotelParkingPartner
);

// Get Partner Hotel Booking Data For Chart For All Hotels
router.get(
  "/chart/partnerhotelparkingbookings/:id",
  getBookingChartDataForHotelParkingPartner
);

// Get Combined Partner Hotel Chart Data
router.get(
  "/chart/combinedpartnerparking/:id",
  getCombinedBookingChartDataForParkingPartner
);

// Get Partner Hotel Booking Data For Chart For All Hotels
router.get(
  "/chart/partnerparkingbookings/:id",
  getBookingChartDataForParkingPartner
);

//Get User Hotel Booking Data For Chart For All Hotels
router.get("/chart/userhotelbookings/:id", getUserBookingChartDataForHotel);

//Get User Hotel Booking Data For Chart For All parkings
router.get("/chart/userparkingbookings/:id", getUserBookingChartDataForParking);

//Get User Hotel Booking Data For Chart For All Hotel and parkings
router.get(
  "/chart/userhotelandparkingbookings/:id",
  getUserBookingChartDataForHotelAndParking
);

//Get User Hotel Booking Data For Chart For All
router.get("/chart/userallbookings/:id", getUserAllBookingChartData);

// Get Previous Bookings By Parking Owner Id
router.get(
  "/getPreviousBookingsByParkingOwnerId/:id",
  getPreviousBookingByParkingOwnerId
);

// Get Previous Bookings By Hotel And Parking Owner Id
router.get(
  "/getPreviousBookingsByHotelAndParkingOwnerId/:id",
  getPreviousBookingByHotelAndParkingOwnerId
);

// Get All Upcomming Bookings
router.get("/getAllUpcommingBookings", getAllUpcomingBooking);

// Get All Upcomming Bookings By User Id
router.get(
  "/getAllUpcommingBookingsByUserId/:id",
  getAllUpcomingBookingByUserId
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
router.get("/getCancelledBookingsByUserId/:id", getCancelledBookingsByUserId);

//Get Cancelled Bookings By Hotel Id
router.get("/getCancelledBookingsByHotelId/:id", getCancelledBookingsByHotelId);

//Get Cancelled Bookings By Parking Id
router.get(
  "/getCancelledBookingsByParkingId/:id",
  getCancelledBookingsByParkingId
);

//Get Cancelled Bookings By Hotel And Parking Id
router.get(
  "/getCancelledBookingsByHotelAndParkingId/:id",
  getCancelledBookingsByHotelAndParkingId
);

//Get Cancelled Bookings By Hotel OwnerId
router.get(
  "/getCancelledBookingsByHotelOwnerId/:id",
  getCancelledBookingsByHotelOwnerId
);

//Get Cancelled Bookings By Parking OwnerId
router.get(
  "/getCancelledBookingsByParkingOwnerId/:id",
  getCancelledBookingsByParkingOwnerId
);

//Get Cancelled Bookings By Hotel And Parking OwnerId
router.get(
  "/getCancelledBookingsByHotelAndParkingOwnerId/:id",
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
router.delete(
  "/cancelHotelAndParkingReservation/:id",
  cancelHotelAndParkingReservation
);
// Free Hotel Rooms
router.delete("/freeHotelRooms/:id", freeBookedHotelRoomsByBookingId);
// Free Parking Slots
router.delete("/freeParkingSlots/:id", freeBookedParkingSlotsByBookingId);
// Free Hotel Rooms And Parking Slots
router.delete(
  "/freeHotelRoomsAndParkingSlots/:id",
  freeBookedHotelAndParkingByBookingId
);

export default router;
