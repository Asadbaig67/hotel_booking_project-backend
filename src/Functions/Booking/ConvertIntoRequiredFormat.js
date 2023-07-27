import Parking from "../../models/Parking.js";
import Hotel from "../../models/Hotel.js";
import User from "../../models/user.js";
import HotelandParking from "../../models/Hotel_Parking.js";

export const convertIntoRequiredFormat = async (data) => {
  const bookingOut = [];
  await Promise.all(
    data.map(async (booking, i) => {
      bookingOut[i] = {};
      bookingOut[i]._id = booking._id;
      bookingOut[i].total_price = booking.total_price;
      bookingOut[i].Booking_type = booking.Booking_type;
      bookingOut[i].bookingData = booking;
      bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
      bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
      bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
      if (booking.userid)
        bookingOut[i].userId = await User.findById(booking.userId);
      bookingOut[i].canceled = booking.canceled;
      if (booking.bookedBy) bookingOut[i].bookedBy = booking.bookedBy;

      if (bookingOut[i].userId)
        bookingOut[i].userName =
          bookingOut[i].userId.firstName + " " + bookingOut[i].userId.lastName;
      else if (booking.user_info)
        bookingOut[i].userName = booking.user_info.name;
      if (booking.HotelAndParkingId) {
        bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
          booking.HotelAndParkingId
        );
        if (bookingOut[i].HotelAndParkingId)
          bookingOut[i].hotelAndParkingName =
            bookingOut[i].HotelAndParkingId.hotel_name;
        else bookingOut[i].hotelAndParkingName = "N/A";
        bookingOut[i].propertyName = bookingOut[i].hotelAndParkingName;
      } else if (booking.parkingId) {
        bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
        if (bookingOut[i].parkingData)
          bookingOut[i].parkingName = bookingOut[i].parkingData.name;
        else bookingOut[i].parkingName = "N/A";
        bookingOut[i].propertyName = bookingOut[i].parkingName;
      } else if (booking.hotelId) {
        bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
        if (bookingOut[i].hotelData)
          bookingOut[i].hotelName = bookingOut[i].hotelData.name;
        else bookingOut[i].hotelName = "N/A";
        bookingOut[i].propertyName = bookingOut[i].hotelName;
      }
    })
  );

  if (bookingOut.length === 0) return { status: 200, data: [] };
  else return { status: 200, data: bookingOut };
};
