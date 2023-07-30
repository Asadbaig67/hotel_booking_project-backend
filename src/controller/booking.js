import mongoose, { Promise } from "mongoose";
import booking from "../models/booking.js";
import Parking from "../models/Parking.js";
import Hotel from "../models/Hotel.js";
import User from "../models/user.js";
import HotelandParking from "../models/Hotel_Parking.js";
import { validateBooking } from "../Functions/Booking/ValidateData.js";
import { updateunavailabledates } from "../Functions/Booking/UpdateUnavailableDates.js";
import { updateRoomDates } from "../Functions/Booking/UpdateRoomDates.js";
import { SendEmail } from "../Functions/Emails/SendEmail.js";
import { createNotificationProperty } from "../Functions/Notification/createNotification.js";
import { convertIntoRequiredFormat } from "../Functions/Booking/ConvertIntoRequiredFormat.js";
import { getData } from "../Functions/ChartData/GetData.js";
import AdminBookings from "../models/AdminBookings.js";

// Add Hotel Booking Function Updated
export const addBooking = async (req, res) => {
  let { userId, hotelId, room, checkIn, checkOut, adults, children } =
    req.query;

  if (!userId || !hotelId || !room || !checkIn || !checkOut) {
    return res
      .status(400)
      .json({ message: "Please enter all fields. All fields are required." });
  }

  room = JSON.parse(room);
  checkIn = new Date(checkIn);
  checkOut = new Date(checkOut);
  const createdAt = Date.now();

  // res.status(200).json({ message: "ok", data: { userId, hotelId, room, checkIn, checkOut, createdAt } });

  const hotel = await Hotel.findById(hotelId).exec();

  const theuser = await User.findById(userId);

  // On Successfull Booking Make API Request To Update The Rooms That Has Been Reserved In This Booking
  const result = await updateunavailabledates(room, checkIn, checkOut);

  // If Any Of The Rooms Failed To Update, Send Error
  if (!result.some((result) => result)) {
    return res.status(400).json({ msg: "Booking ==> Failed" });
  }

  const total_price = room.reduce((accumulator, currentRoom) => {
    return accumulator + currentRoom.Room_price;
  }, 0);

  const persons = {
    adults: adults,
    children: children,
  };

  // Make New Booking document and save
  const newBooking = new booking({
    Booking_type: "hotel",
    userId,
    hotelId,
    room,
    persons,
    checkIn,
    checkOut,
    total_price,
    createdAt,
  });

  try {
    // Save New Booking
    const booking_success = await newBooking.save();
    // If Booking Not Successfull Saved, Send Error
    if (!booking_success) {
      return res.status(400).json({ msg: "Booking Failed" });
    }

    createNotificationProperty(
      "booking",
      "Hotel Booked",
      `Your booking for ${hotel.name} has been confirmed in dates ${checkIn} to ${checkOut}.`,
      Date.now(),
      userId
    );
    const ownerId = hotel.ownerId;
    createNotificationProperty(
      "booking",
      "Hotel Booked",
      `New booking has been placed in dates ${checkIn} to ${checkOut} at hotel ${hotel.name}.`,
      Date.now(),
      ownerId
    );
    // await User.find({ account_type: "admin" }).map((admin) => {
    //   createNotificationProperty(
    //     "booking",
    //     "Hotel Booked",
    //     `New booking has been placed in dates ${checkIn} to ${checkOut} at hotel ${hotel.name}.`,
    //     Date.now(),
    //     admin._id
    //   );
    // });
    // If Booking Successfull, Send Success Message

    await SendEmail({
      name: theuser.firstName + " " + theuser.lastName,
      email: theuser.email,
      subject: "Booking Confirmation",
      message: `Your booking has been confirmed. Your booking details are as follows: </br>
      Hotel Name: ${hotel.name} \n
      Check In: ${checkIn} \n
      Check Out: ${checkOut} \n
      Room(s): ${room.map((r) => r.Room_no)} \n
      Total Price: ${total_price} \n
      `,
    });

    res
      .status(200)
      .json({ msg: "Booking ==> Success", details: booking_success });
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Add Hotel And Parking Booking Function Updated
export const addBookingHotelAndParking = async (req, res) => {
  let { userId, HotelAndParkingId, room, checkIn, checkOut, parking } =
    req.query;

  if (
    !userId ||
    !HotelAndParkingId ||
    !room ||
    !checkIn ||
    !checkOut ||
    !parking
  ) {
    return res
      .status(400)
      .json({ message: "Please enter all fields. All fields are required." });
  }

  room = JSON.parse(room);
  parking = JSON.parse(parking);
  checkIn = new Date(checkIn);
  checkOut = new Date(checkOut);
  const createdAt = Date.now();

  const theUser = await User.findById(userId);

  // On Successfull Booking Make API Request To Update The Rooms That Has Been Reserved In This Booking
  const result = await updateunavailabledates(room, checkIn, checkOut);
  // If Any Of The Rooms Failed To Update, Send Error
  if (!result.some((result) => result)) {
    return res.status(400).json({ msg: "Booking ==> Failed" });
  }

  // Update Parking Booked Slots
  const Existing = await HotelandParking.findByIdAndUpdate(
    { _id: HotelAndParkingId },
    { $inc: { parking_booked_slots: parking.Total_slots } },
    { new: true }
  );
  if (!Existing) {
    return res.status(400).json({ msg: "Booking ==> Failed" });
  }
  // Rooms And Parking Price Calculation
  let total_price = room.reduce((accumulator, currentRoom) => {
    return accumulator + currentRoom.Room_price;
  }, 0);
  total_price = total_price + parking.Total_slots * parking.Parking_price;

  // Make New Booking document and save
  const newBooking = new booking({
    Booking_type: "hotelandparking",
    userId,
    HotelAndParkingId,
    room,
    checkIn,
    checkOut,
    total_price,
    parking,
    createdAt,
  });

  try {
    // Save New Booking
    const booking_success = await newBooking.save();
    // If Booking Not Successfull Saved, Send Error
    if (!booking_success) {
      return res.status(400).json({ msg: "Booking Failed" });
    }

    const hotel = await HotelandParking.findById(HotelAndParkingId);

    createNotificationProperty(
      "booking",
      "Hotel And Parking Booked",
      `Your booking for ${hotel.hotel_name} has been confirmed in dates ${checkIn} to ${checkOut}.`,
      Date.now(),
      userId
    );

    const ownerId = hotel.ownerId;
    createNotificationProperty(
      "booking",
      "Hotel Booked",
      `New booking has been placed in dates ${checkIn} to ${checkOut} at hotel and Parking ${hotel.hotel_name}.`,
      Date.now(),
      ownerId
    );
    await User.find({ account_type: "admin" }).forEach((admin) => {
      createNotificationProperty(
        "booking",
        "Hotel Booked",
        `New booking has been placed in dates ${checkIn} to ${checkOut} at hotel and parking ${hotel.hotel_name}.`,
        Date.now(),
        admin._id
      );
    });
    // If Booking Successfull, Send Success Message

    await SendEmail({
      name: theUser.firstName + " " + theUser.lastName,
      email: theUser.email,
      subject: "Booking Confirmation",
      message: `Your booking has been confirmed. Your booking details are as follows:
      Hotel Name: ${Existing.name} \n
      Check In: ${checkIn} \n
      Check Out: ${checkOut} \n
      Room(s): ${room.map((r) => r.Room_no)} \n
      Total Price: ${total_price} \n
      `,
    });

    return res
      .status(200)
      .json({ msg: "Booking ==> Success", details: booking_success });
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Add Parking Booking Function Updated
export const addBookingParking = async (req, res) => {
  let { userId, parkingId, checkIn, checkOut, parking } = req.query;

  if (!userId || !parkingId || !parking || !checkIn || !checkOut) {
    throw new Error("Please enter all fields. All fields are required.");
  }

  parking = JSON.parse(parking);
  const createdAt = Date.now();
  let total_price = parking.Total_slots * parking.Parking_price;
  let slots = parking.Total_slots;
  // res.send({ msg: "Booking ==> Success", details: { userId, parkingId, parking, checkIn, checkOut, total_price } });
  const newBooking = new booking({
    Booking_type: "parking",
    userId,
    parkingId,
    parking,
    total_price,
    checkIn,
    checkOut,
    createdAt,
  });

  try {
    const booking = await newBooking.save();
    if (!booking) {
      return res.status(400).json({ message: "Booking Failed !" });
    }
    const Existing_parking = await Parking.findByIdAndUpdate(
      parkingId,
      { $inc: { booked_slots: slots } },
      { new: true }
    );

    if (!Existing_parking) {
      const deleteBooking = await booking.findByIdAndDelete({
        _id: booking._id.toString(),
      });
      return res.status(409).json({ message: "Error Occured Booking Denied!" });
    }

    const theUser = await User.findById(userId);

    await SendEmail({
      name: theUser.firstName + " " + theUser.lastName,
      email: theUser.email,
      subject: "Booking Confirmation",
      message: `Your booking has been confirmed. Your booking details are as follows:
      Parking Name: ${Existing_parking.name} \n
      Check In: ${checkIn} \n
      Check Out: ${checkOut} \n
      Total Slots: ${slots} \n
      Total Price: ${total_price} \n
      `,
    });

    const parking = await Parking.findById(parkingId);

    createNotificationProperty(
      "booking",
      "Parking Booked",
      `Your booking for ${parking.name} has been confirmed in dates ${checkIn} to ${checkOut}.`,
      Date.now(),
      userId
    );
    const ownerId = parking.ownerId;
    createNotificationProperty(
      "booking",
      "Hotel Booked",
      `New booking has been placed in dates ${checkIn} to ${checkOut} at hotel and Parking ${parking.name}.`,
      Date.now(),
      ownerId
    );
    // await User.find({ account_type: "admin" }).forEach((admin) => {
    //   createNotificationProperty(
    //     "booking",
    //     "Hotel Booked",
    //     `New booking has been placed in dates ${checkIn} to ${checkOut} at hotel and parking ${parking.name}.`,
    //     Date.now(),
    //     admin._id
    //   );
    // });

    // return res.status(200).json({ msg: "Booking ==> Success", data: { userId, parkingId, parking, checkIn, checkOut, total_price } });

    return res.status(200).json(booking);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get All Bookings Function
export const getBooking = async (req, res) => {
  try {
    const userbookings = await booking.find();
    const adminBooking = await AdminBookings.find();
    const bookings = [...userbookings, ...adminBooking];
    const data = bookings.filter((booking) => booking.canceled === false);
    const result = await convertIntoRequiredFormat(data);
    res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get Specific Booking By Id
export const getBookingById = async (req, res) => {
  try {
    let bookingById = await booking.findById(req.params.id);
    const bookingOut = {};
    if (!bookingById) {
      bookingById = await AdminBookings.findById(req.params.id);
    }
    if (bookingById) {
      bookingOut._id = bookingById._id;
      bookingOut.total_price = bookingById.total_price;
      bookingOut.Booking_type = bookingById.Booking_type;
      bookingOut.bookingData = bookingById;
      bookingOut.createdAt = new Date(bookingById.createdAt).toLocaleString();
      bookingOut.checkIn = new Date(bookingById.checkIn).toLocaleString();
      bookingOut.checkOut = new Date(bookingById.checkOut).toLocaleString();
      bookingOut.userId = await User.findById(bookingById.userId);
      bookingOut.canceled = bookingById.canceled;
      bookingOut.room = bookingById.room;
      if (bookingOut.userId)
        bookingOut.userName =
          bookingOut.userId.firstName + " " + bookingOut.userId.lastName;
      else bookingOut.userName = "N/A";
      if (bookingById.HotelAndParkingId) {
        bookingOut.HotelAndParkingId = await HotelandParking.findById(
          bookingById.HotelAndParkingId
        );
        if (bookingOut.HotelAndParkingId)
          bookingOut.hotelAndParkingName =
            bookingOut.HotelAndParkingId.hotel_name;
        else bookingOut.hotelAndParkingName = "N/A";
      } else if (bookingById.parkingId) {
        bookingOut.parkingData = await Parking.findById(bookingById.parkingId);
        if (bookingOut.parkingData)
          bookingOut.parkingName = bookingOut.parkingData.name;
        else bookingOut.parkingName = "N/A";
      } else if (bookingById.hotelId) {
        bookingOut.hotelData = await Hotel.findById(bookingById.hotelId);
        if (bookingOut.hotelData)
          bookingOut.hotelName = bookingOut.hotelData.name;
        else bookingOut.hotelName = "N/A";
      }
    }
    if (bookingOut.canceled === true) {
      return res.status(404).json("Booking not found");
    }
    res.status(200).json(bookingOut);
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("Booking not found");
    // console.log("Error: ", error);
  }
};

// Get Specific Booking By Type
export const getBookingByType = async (req, res) => {
  const Booking_type = req.params.type;
  try {
    const userBookingByType = await booking.find({ Booking_type });
    const adminBookingByType = await AdminBookings.find({ Booking_type });
    const bookingByType = [...userBookingByType, ...adminBookingByType];
    const data = bookingByType.filter((booking) => booking.canceled === false);
    const result = await convertIntoRequiredFormat(data);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(404).json("Booking not found");
    // console.log("Error: ", error);
  }
};

// Get Chart Data For Hotel Function
export const getBookingChartDataForHotel = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotel = await Hotel.find({ ownerId });
    if (hotel.length === 0) return res.status(200).json(new Array(12).fill(0));
    const hotelIds = hotel.map((hotel) => hotel._id);
    const hotelName = hotel.map((hotel) => hotel.name);
    const result = [];
    for (let i = 0; i < hotelIds.length; i++) {
      const hotelId = hotelIds[i];
      const userBooking = await booking.find({
        $and: [{ canceled: false }, { Booking_type: "hotel" }, { hotelId }],
      });
      const adminBooking = await AdminBookings.find({
        $and: [{ canceled: false }, { Booking_type: "hotel" }, { hotelId }],
      });
      const data = [...userBooking, ...adminBooking];
      result.push({ name: hotelName[i], data: getData(data) });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

// Get Chart Data For Hotel Function
export const getCombinedBookingChartDataForHotelPartner = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    // get all hotels of this owner
    const hotels = await Hotel.find({ ownerId });

    // get all bookings of these hotels
    const hotelIds = hotels.map((hotel) => hotel._id);

    const userbookings = await booking.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotel" },
        { hotelId: { $in: hotelIds } },
      ],
    });
    const adminbookings = await AdminBookings.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotel" },
        { hotelId: { $in: hotelIds } },
      ],
    });
    const result = [...userbookings, ...adminbookings];
    const data = getData(result);

    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

// Get Chart Data For Hotel Function
export const getBookingChartDataForHotelPartner = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    // get all hotels of this owner
    let hotels = await Hotel.find({ ownerId });

    // get all bookings of these hotels
    const hotelIds = Object.values(hotels).map((hotel) => hotel._id);

    const userbookings = await booking.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotel" },
        { hotelId: { $in: hotelIds } },
      ],
    });
    const adminbookings = await AdminBookings.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotel" },
        { hotelId: { $in: hotelIds } },
      ],
    });

    const result = [...userbookings, ...adminbookings];

    const DataArray = hotelIds.map((hotelId) => {
      const hotelBookings = result.filter(
        (booking) => booking.hotelId.toString() === hotelId.toString()
      );
      const data = getData(hotelBookings);
      return data;
    });

    res.send(DataArray);
  } catch (error) {
    console.log(error);
  }
};

// Get Chart Data For Hotel Function
export const getCombinedBookingChartDataForHotelParkingPartner = async (
  req,
  res
) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    // get all hotels of this owner
    const hotels = await Hotel.find({ ownerId });

    // get all bookings of these hotels
    const hotelIds = hotels.map((hotel) => hotel._id);
    const userbookings = await booking.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotelandparking" },
        { HotelAndParkingId: { $in: hotelIds } },
      ],
    });
    const adminbookings = await AdminBookings.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotelandparking" },
        { HotelAndParkingId: { $in: hotelIds } },
      ],
    });
    const result = [...userbookings, ...adminbookings];
    const data = getData(result);

    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

// Get Chart Data For Hotel Function
export const getBookingChartDataForHotelParkingPartner = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    // get all hotels of this owner
    let hotels = await Hotel.find({ ownerId });

    // get all bookings of these hotels
    const hotelIds = Object.values(hotels).map((hotel) => hotel._id);
    const userbooking = await booking.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotelandparking" },
        { HotelAndParkingId: { $in: hotelIds } },
      ],
    });
    const adminbooking = await AdminBookings.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotelandparking" },
        { HotelAndParkingId: { $in: hotelIds } },
      ],
    });
    const result = [...userbooking, ...adminbooking];
    const DataArray = hotelIds.map((hotelId) => {
      const hotelBookings = result.filter(
        (booking) => booking.HotelAndParkingId.toString() === hotelId.toString()
      );
      const data = getData(hotelBookings);
      return data;
    });

    res.send(DataArray);
  } catch (error) {
    console.log(error);
  }
};

// Get Chart Data For Hotel Function
export const getCombinedBookingChartDataForParkingPartner = async (
  req,
  res
) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    // get all hotels of this owner
    const parkings = await Hotel.find({ ownerId });

    // get all bookings of these hotels
    const parkingIds = parkings.map((parking) => parking._id);

    const userbooking = await booking.find({
      $and: [
        { canceled: false },
        { Booking_type: "parking" },
        { parkingId: { $in: parkingIds } },
      ],
    });
    const adminbooking = await AdminBookings.find({
      $and: [
        { canceled: false },
        { Booking_type: "parking" },
        { parkingId: { $in: parkingIds } },
      ],
    });
    const result = [...userbooking, ...adminbooking];

    const data = getData(result);

    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

// Get Chart Data For Hotel Function
export const getBookingChartDataForParkingPartner = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    // get all hotels of this owner
    let parkings = await Hotel.find({ ownerId });

    // get all bookings of these hotels
    const parkingIds = Object.values(parkings).map((parking) => parking._id);

    const userbooking = await booking.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotelandparking" },
        { parkingId: { $in: parkingIds } },
      ],
    });
    const adminbooking = await AdminBookings.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotelandparking" },
        { parkingId: { $in: parkingIds } },
      ],
    });
    const result = [...userbooking, ...adminbooking];

    const DataArray = parkingIds.map((parkingId) => {
      const parkingBookings = result.filter(
        (booking) => booking.parkingId.toString() === parkingId.toString()
      );
      const data = getData(parkingBookings);
      return data;
    });

    res.send(DataArray);
  } catch (error) {
    console.log(error);
  }
};

//Get user booking chart data for hotels
export const getUserBookingChartDataForHotel = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const userbooking = await booking.find({
      $and: [{ canceled: false }, { Booking_type: "hotel" }, { userId }],
    });
    const adminbooking = await AdminBookings.find({
      $and: [{ canceled: false }, { Booking_type: "hotel" }, { userId }],
    });
    const result = [...userbooking, ...adminbooking];
    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

//Get user booking chart data for parkings
export const getUserBookingChartDataForParking = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const userbooking = await booking.find({
      $and: [{ canceled: false }, { Booking_type: "parking" }, { userId }],
    });
    const adminbooking = await AdminBookings.find({
      $and: [{ canceled: false }, { Booking_type: "parking" }, { userId }],
    });
    const result = [...userbooking, ...adminbooking];
    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

//Get user booking chart data for hotel and parking
export const getUserBookingChartDataForHotelAndParking = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const userbooking = await booking.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotelandparking" },
        { userId },
      ],
    });
    const adminbooking = await AdminBookings.find({
      $and: [
        { canceled: false },
        { Booking_type: "hotelandparking" },
        { userId },
      ],
    });
    const result = [...userbooking, ...adminbooking];
    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

//Get user booking chart data for hotels
export const getUserAllBookingChartData = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const userbooking = await booking.find({
      $and: [{ canceled: false }, { userId }],
    });
    const adminbooking = await AdminBookings.find({
      $and: [{ canceled: false }, { userId }],
    });
    const result = [...userbooking, ...adminbooking];

    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

// Get Chart Data For Hotel Function
export const getBookingChartDataForHotelandParking = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotel = await HotelandParking.find({ ownerId });
    if (hotel.length === 0) return res.status(200).json(new Array(12).fill(0));
    const hotelIds = hotel.map((hotel) => hotel._id);
    const hotelName = hotel.map((hotel) => hotel.hotel_name);
    const result = [];
    for (let i = 0; i < hotelIds.length; i++) {
      const hotelId = hotelIds[i];
      const userbooking = await booking.find({
        $and: [
          { canceled: false },
          { Booking_type: "hotelandparking" },
          { HotelAndParkingId: hotelId },
        ],
      });
      const adminbooking = await AdminBookings.find({
        $and: [
          { canceled: false },
          { Booking_type: "hotelandparking" },
          { HotelAndParkingId: hotelId },
        ],
      });
      const data = [...userbooking, ...adminbooking];
      result.push({ name: hotelName[i], data: getData(data) });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
// Get Chart Data For Hotel Function
export const getBookingChartDataForParking = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const parking = await Parking.find({ ownerId });
    if (parking.length === 0)
      return res.status(200).json(new Array(12).fill(0));
    const parkingIds = parking.map((parking) => parking._id);
    const parkingName = parking.map((parking) => parking.name);
    const result = [];
    for (let i = 0; i < parkingIds.length; i++) {
      const parkingId = parkingIds[i];
      const userbooking = await booking.find({
        $and: [{ canceled: false }, { Booking_type: "parking" }, { parkingId }],
      });
      const adminbooking = await AdminBookings.find({
        $and: [{ canceled: false }, { Booking_type: "parking" }, { parkingId }],
      });
      const data = [...userbooking, ...adminbooking];
      result.push({ name: parkingName[i], data: getData(data) });
      console.log(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

// Get All Booking Chart Data For Hotel Function
export const getAllBookingChartDataForHotel = async (req, res) => {
  try {
    const userbooking = await booking.find({
      $and: [{ canceled: false }, { Booking_type: "hotel" }],
    });
    const adminbooking = await AdminBookings.find({
      $and: [{ canceled: false }, { Booking_type: "hotel" }],
    });
    const result = [...userbooking, ...adminbooking];
    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

// Get All Booking Chart Data For Hotel Function
export const getAllBookingChartDataForParking = async (req, res) => {
  try {
    const userbooking = await booking.find({
      $and: [{ canceled: false }, { Booking_type: "parking" }],
    });
    const adminbooking = await AdminBookings.find({
      $and: [{ canceled: false }, { Booking_type: "parking" }],
    });
    const result = [...userbooking, ...adminbooking];
    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

// Get All Booking Chart Data For Hotel Function
export const getAllBookingChartDataForHotelAndParking = async (req, res) => {
  try {
    const userbooking = await booking.find({
      $and: [{ canceled: false }, { Booking_type: "hotelandparking" }],
    });
    const adminbooking = await AdminBookings.find({
      $and: [{ canceled: false }, { Booking_type: "hotelandparking" }],
    });
    const result = [...userbooking, ...adminbooking];
    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

// Get Specific Booking By Owner Id
export const getBookingHotelByOwnerId = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotel = await Hotel.find({ ownerId });
    if (!hotel) {
      return res.status(404).json("Hotel not found");
    }
    const hotelId = hotel.map((hotel) => hotel._id);
    let bookings = [];
    for (const id of hotelId) {
      const objectId = mongoose.Types.ObjectId(id);
      const document = await booking.find({ hotelId: objectId });

      if (document.length !== 0) bookings.push(document);
    }
    for (const id of hotelId) {
      const objectId = mongoose.Types.ObjectId(id);
      const document = await AdminBookings.find({ hotelId: objectId });
      if (document.length !== 0) bookings.push(document);
    }

    bookings = bookings.filter((booking) => booking !== null);
    const result = bookings.flat();
    const data = result.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Bookings not found");
    // console.log("Error: ", error);
  }
};

// Get Specific Booking By Owner Id
export const getBookingParkingByOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const parking = await Parking.find({ ownerId });
    if (!parking) {
      return res.status(404).json("Parking not found");
    }
    const parkingId = parking.map((parking) => parking._id);
    let bookings = [];
    for (const id of parkingId) {
      const objectId = mongoose.Types.ObjectId(id);
      const document = await AdminBookings.find({ parkingId: objectId });
      if (document.length !== 0) bookings.push(document);
    }
    for (const id of parkingId) {
      const objectId = mongoose.Types.ObjectId(id);
      const document = await AdminBookings.find({ parkingId: objectId });
      if (document.length !== 0) bookings.push(document);
    }
    
    bookings = bookings.filter((booking) => booking !== null);
    const result = bookings.flat();
    const data = result.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

//get all booking by user id
export const getAllBookingsByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const result = await booking.find({
      $and: [{ canceled: false }, { userId }],
    });
    if (!result) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

// Get Specific Booking By Owner Id
export const getBookingHotelandParkingByOwnerId = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const HotelAndParkingData = await HotelandParking.find({ ownerId });
    if (!HotelAndParkingData) {
      return res.status(404).json("Hotel and Parking not found");
    }
    const HotelAndParkingId = HotelAndParkingData.map((HotelAndParking) =>
      mongoose.Types.ObjectId(HotelAndParking._id)
    );
    let bookings = [];
    for (const id of HotelAndParkingId) {
      const objectId = mongoose.Types.ObjectId(id);
      const document = await booking.find({ HotelAndParkingId: objectId });
      if (document.length !== 0) bookings.push(document);
    }
    for (const id of HotelAndParkingId) {
      const objectId = mongoose.Types.ObjectId(id);
      const document = await AdminBookings.find({ HotelAndParkingId: objectId });
      if (document.length !== 0) bookings.push(document);
    }
    bookings = bookings.filter((booking) => booking !== null);
    const result = bookings.flat();
    const data = result.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Bookings not found");
  }
};

//Get Previous Hotel Booking By User Id
export const getPreviousBookingHotelByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "hotel"
    );

    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        booking.completed === true
      );
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

//Get Previous Parking Booking By User Id
export const getPreviousBookingParkingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "parking"
    );
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        booking.completed === true
      );
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

//Get Previous Hotel and Parking Booking By User Id
export const getPreviousBookingHotelandParkingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "hotelandparking"
    );
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        booking.completed === true
      );
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get All Previous Bookings Function
export const getAllPreviousBooking = async (req, res) => {
  try {
    let userbooking = await booking.find();
    let adminbooking = await AdminBookings.find();
    let bookings = [...userbooking, ...adminbooking];
    bookings = bookings.filter((booking) => booking.canceled === false);

    let currentDate = new Date();

    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        completed === true
      );
    });
    const result = await convertIntoRequiredFormat(filteredResult);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get All Previous Bookings Function
export const getAllPreviousBookingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    let bookings = await booking.find({ userId });

    bookings = bookings.filter((booking) => booking.canceled === false);

    let currentDate = new Date();

    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        booking.completed === true
      );
    });
    const bookingOut = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get Previous Booking By Hotel Owner Id
export const getPreviousBookingByHotelOwnerId = async (req, res) => {
  const hotelOwnerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotelIds = await Hotel.find({ ownerId: hotelOwnerId }).select("_id");
    const userbooking = await booking.find({ hotelId: { $in: hotelIds } });
    const adminbooking = await AdminBookings.find({
      hotelId: { $in: hotelIds },
    });
    const bookings = [...userbooking, ...adminbooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        booking.completed === true
      );
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingNew = await convertIntoRequiredFormat(data);
    res.status(bookingNew.status).json(bookingNew.data);
  } catch (error) {
    res.status(404).json({ message: "No Booking Found", error });
  }
};

// Get Previous Booking By Parking Owner Id
export const getPreviousBookingByParkingOwnerId = async (req, res) => {
  const parkingOwnerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const parkingIds = await Parking.find({ ownerId: parkingOwnerId }).select(
      "_id"
    );
    const userbooking = await booking.find({ parkingId: { $in: parkingIds } });
    const adminbooking = await AdminBookings.find({
      parkingId: { $in: parkingIds },
    });
    const bookings = [...userbooking, ...adminbooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        booking.completed === true
      );
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingNew = await convertIntoRequiredFormat(data);
    res.status(bookingNew.status).json(bookingNew.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Previous Booking By Hotel And Parking Owner Id
export const getPreviousBookingByHotelAndParkingOwnerId = async (req, res) => {
  const hotelAndParkingOwnerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotelAndParkingIds = await HotelandParking.find({
      ownerId: hotelAndParkingOwnerId,
    }).select("_id");
    const userbooking = await booking.find({
      HotelAndParkingId: { $in: hotelAndParkingIds },
    });
    const adminbooking = await AdminBookings.find({
      HotelAndParkingId: { $in: hotelAndParkingIds },
    });
    const bookings = [...userbooking, ...adminbooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        booking.completed === true
      );
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingNew = await convertIntoRequiredFormat(data);
    res.status(bookingNew.status).json(bookingNew.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get on Going hotel Booking By User Id
export const getOnGoingBookingHotelByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "hotel"
    );
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        bookingCheckIn <= currentDate &&
        bookingCheckOut >= currentDate &&
        booking.canceled === false
      );
    });
    const bookingOut = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get on Going parking Booking By User Id
export const getOnGoingBookingParkingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "parking"
    );
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        bookingCheckIn <= currentDate &&
        bookingCheckOut >= currentDate &&
        booking.canceled === false
      );
    });
    const bookingOut = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get on Going hotel and parking Booking By User Id
export const getOnGoingBookingHotelAndParkingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "hotelAndParking"
    );
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        bookingCheckIn <= currentDate &&
        bookingCheckOut >= currentDate &&
        booking.canceled === false
      );
    });
    const bookingOut = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get All On Going Booking
export const getAllOnGoingBooking = async (req, res) => {
  try {
    const userbooking = await booking.find({});
    const adminbooking = await AdminBookings.find({});
    const bookings = [...userbooking, ...adminbooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        bookingCheckIn <= currentDate &&
        bookingCheckOut >= currentDate &&
        booking.canceled === false
      );
    });
    const bookingNew = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingNew.status).json(bookingNew.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get All On Going Booking By User Id
export const getAllOnGoingBookingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const result = await booking.find({ userId });
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        bookingCheckIn <= currentDate &&
        bookingCheckOut >= currentDate &&
        booking.canceled === false
      );
    });
    const bookingOut = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get All On Going Booking By Hotel Owner Id
export const getAllOnGoingBookingByHotelOwnerId = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotelIds = await Hotel.find({ ownerId }).select("_id");
    const userbooking = await booking.find({ hotelId: { $in: hotelIds } });
    const adminbooking = await AdminBookings.find({
      hotelId: { $in: hotelIds },
    });
    const bookings = [...userbooking, ...adminbooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        bookingCheckIn <= currentDate &&
        bookingCheckOut >= currentDate &&
        booking.canceled === false
      );
    });
    const bookingNew = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingNew.status).json(bookingNew.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get All On Going Booking By Parking Owner Id
export const getAllOnGoingBookingByParkingOwnerId = async (req, res) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const parkingIds = await Parking.find({ ownerId }).select("_id");
    const userbooking = await booking.find({ parkingId: { $in: parkingIds } });
    const adminbooking = await AdminBookings.find({
      parkingId: { $in: parkingIds },
    });
    const bookings = [...userbooking, ...adminbooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        bookingCheckIn <= currentDate &&
        bookingCheckOut >= currentDate &&
        booking.canceled === false
      );
    });
    const bookingNew = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingNew.status).json(bookingNew.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get All On Going Booking By Hotel And Parking Owner Id
export const getAllOnGoingBookingByHotelAndParkingOwnerId = async (
  req,
  res
) => {
  const ownerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotelIds = await HotelandParking.find({ ownerId }).select("_id");
    const userbooking = await booking.find({
      HotelAndParkingId: { $in: hotelIds },
    });
    const adminbooking = await AdminBookings.find({
      HotelAndParkingId: { $in: hotelIds },
    });
    const bookings = [...userbooking, ...adminbooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        bookingCheckIn <= currentDate &&
        bookingCheckOut >= currentDate &&
        booking.canceled === false
      );
    });
    const bookingNew = await convertIntoRequiredFormat(filteredResult);
    res.status(bookingNew.status).json(bookingNew.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

//Get Upcoming Hotel Booking By User Id
export const getUpcomingBookingHotelByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "hotel"
    );
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return bookingCheckIn > currentDate && bookingCheckOut > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

//Get Upcoming Parking Booking By User Id
export const getUpcomingBookingParkingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "parking"
    );
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return bookingCheckIn > currentDate && bookingCheckOut > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

//Get Upcoming Hotel and Parking Booking By User Id
export const getUpcomingBookingHotelandParkingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookingByUserId = await booking.find({ userId });
    const result = bookingByUserId.filter(
      (booking) => booking.Booking_type === "hotelandparking"
    );
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return bookingCheckIn > currentDate && bookingCheckOut > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get All Upcomming Bookings
export const getAllUpcomingBooking = async (req, res) => {
  try {
    let userbooking = await booking.find();
    let adminbooking = await AdminBookings.find();
    let bookings = [...userbooking, ...adminbooking];
    bookings = bookings.filter((booking) => booking.canceled === false);
    let currentDate = new Date();

    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return bookingCheckIn > currentDate && bookingCheckOut > currentDate;
    });

    res.status(200).json(filteredResult);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Get All Upcomming Bookings By UserId
export const getAllUpcomingBookingByUserId = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  try {
    let bookings = await booking.find({ userId });
    bookings = bookings.filter((booking) => booking.canceled === false);
    let currentDate = new Date();

    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return bookingCheckIn > currentDate && bookingCheckOut > currentDate;
    });

    const reult = await convertIntoRequiredFormat(filteredResult);
    res.status(reult.status).json(reult.data);
  } catch (error) {
    res.status(404).json("Booking not found");
  }
};

// Add New User Booking Function
export const UserBookings = async (req, res) => {
  try {
    // Get The Booking Type
    const Booking_type = req.query.Booking_type;

    // Make Booking According To Booking Type
    if (Booking_type === "hotel") {
      // Validate Booking Data And Deconstruct It
      const data = validateBooking(req);
      const { hotelId, room, checkIn, checkOut } = data;

      // Check If Booking Already Exists Or Not
      const exists = await booking.findOne({
        hotelId,
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn },
        "room.RoomId": { $in: room.map((r) => r.RoomId) },
        "room.Room_no": { $in: room.map((r) => r.Room_no) },
      });
      if (exists) {
        return res.status(400).json({ msg: "Booking already exists" });
      }

      // On Successfull Booking Make API Request To Update The Rooms That Has Been Reserved In This Booking
      const result = await updateunavailabledates(room, checkIn, checkOut);

      // If Any Of The Rooms Failed To Update, Send Error
      if (!result.some((result) => result)) {
        return res.status(400).json({ msg: "Booking ==> Failed" });
      }

      // Make New Booking document and save
      const newBooking = new booking(data);

      // Save New Booking
      const booking_success = await newBooking.save();

      // If Booking Not Successfull Saved, Send Error
      if (!booking_success) {
        return res.status(400).json({ msg: "Booking Failed" });
      }

      // If Booking Successfull, Send Success Message
      res.status(200).json({ msg: "Booking ==> Success" });
    } else if (Booking_type === "hotelandparking") {
      // Validate Booking Data And Deconstruct It
      const data = validateBooking(req);
      const { hotelId, room, checkIn, checkOut } = data;

      // Check If Booking Already Exists Or Not
      const exists = await booking.findOne({
        hotelId,
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn },
        "room.RoomId": { $in: room.map((r) => r.RoomId) },
        "room.Room_no": { $in: room.map((r) => r.Room_no) },
      });
      if (exists) {
        return res.status(400).json({ msg: "Booking already exists" });
      }

      // On Successfull Booking Make API Request To Update The Rooms That Has Been Reserved In This Booking
      const result = await updateunavailabledates(room, checkIn, checkOut);

      // If Any Of The Rooms Failed To Update, Send Error
      if (!result.some((result) => result)) {
        return res.status(400).json({ msg: "Booking ==> Failed" });
      }

      // Make New Booking document and save
      const newBooking = new booking(data);
      // Save New Booking
      const booking_success = await newBooking.save();

      // If Booking Not Successfull Saved, Send Error
      if (!booking_success) {
        return res.status(400).json({ msg: "Booking Failed" });
      }

      // If Booking Successfull, Send Success Message
      res.status(200).json({ msg: "Booking ==> Success" });
    } else if (Booking_type === "parking") {
      // Validate Booking Data And Deconstruct It
      const data = validateBooking(req);
      const { parkingId } = data;

      // Check If Parking has Available Slots
      const parking = await Parking.findOne({ _id: parkingId });
      if (!parking) {
        return res.status(400).json({ msg: "Sorry Parking Not Found" });
      }
      const { total_slots, booked_slots } = parking;
      if (booked_slots >= total_slots) {
        return res.status(400).json({ msg: "Sorry Parking is Full" });
      }

      // Make New Booking document and save
      const newBooking = new booking(data);

      // If Booking successful save it
      const newBookingResult = await newBooking.save();

      // If booking not successful send error
      if (!newBookingResult) {
        return res.status(400).json({ status: "Booking Failed" });
      }

      return res.status(200).json({ status: "Booking Successful" });
    }
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Update Booking
export const updateBooking = async (req, res) => {
  const { userId, hotelId, room, checkIn, checkOut, price } = req.body;
  try {
    const update = {
      userId,
      hotelId,
      room,
      checkIn,
      checkOut,
      price,
    };
    const bookingById = await booking.findByIdAndUpdate(req.params.id, update);
    createNotificationProperty(
      "booking",
      "Booking Updated",
      `Your booking has been updated successfully`,
      Date.now(),
      userId
    );
    const hotel = await Hotel.findById(hotelId);
    createNotificationProperty(
      "booking",
      "Booking Updated",
      `Your booking has been updated successfully`,
      Date.now(),
      hotel.ownerId
    );
    await User.find({ account_type: "admin" }).forEach((admin) => {
      createNotificationProperty(
        "booking",
        "Booking Updated",
        `Your booking has been updated successfully.`,
        Date.now(),
        admin._id
      );
    });

    res.status(200).json(bookingById);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Cancel Booking
export const deleteBooking = async (req, res) => {
  try {
    let bookingById = await booking.findByIdAndDelete(req.params.id);
    if (!bookingById) {
      bookingById = await AdminBookings.findByIdAndDelete(req.params.id);
    }
    if (!bookingById) {
      return res.status(400).json({ msg: "Booking not found" });
    }
    // createNotificationProperty(
    //   "booking",
    //   "Booking deleted",
    //   `Your booking has been deleted successfully`,
    //   Date.now(),
    //   bookingById.userId
    // );
    // await User.find({ account_type: "admin" }).forEach((admin) => {
    //   createNotificationProperty(
    //     "booking",
    //     "Hotel Booked",
    //     `New booking has been placed in dates ${checkIn} to ${checkOut} at hotel ${hotel.name}.`,
    //     Date.now(),
    //     admin._id
    //   );
    // });

    res.status(200).json(bookingById);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Cancel Hotel Reservation
export const cancelHotelReservation = async (req, res) => {
  try {
    const bookingId = req.params.id;

    let bookingById = await booking.findById(bookingId);
    if (!bookingById) {
      bookingById = await AdminBookings.findById(bookingId);
    }
    if (!bookingById) {
      return res.status(400).json({ msg: "Booking Not Found" });
    }

    const { hotelId, room, checkIn, checkOut } = bookingById;

    const PendingRooms = [];
    const promises = room.map(async (room) => {
      const result = await updateRoomDates(room, checkIn, checkOut);
      if (!result) {
        PendingRooms.push(room);
        throw new Error("Failed to update room: " + room.RoomId);
      }
      return true;
    });
    try {
      await Promise.all(promises);
      bookingById.canceled = true;
      await bookingById.save();
    } catch (error) {
      return res.status(400).json({ msg: "Failed to cancel reservation" });
    }

    const theHotel = await Hotel.findById(hotelId);

    if (bookingById.userId) {
      const theUser = await User.findById(bookingById.userId);
      await SendEmail({
        name: theUser.firstName + " " + theUser.lastName,
        email: theUser.email,
        subject: "Hotel Reservation Canceled",
        message: `Your reservation at ${theHotel.name} has been canceled.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    } else {
      await SendEmail({
        name: bookingById.user_info.name,
        email: bookingById.user_info.email,
        subject: "Hotel Reservation Canceled",
        message: `Your reservation at ${theHotel.name} has been canceled.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    }

    // createNotificationProperty(
    //   "booking",
    //   "Booking Canceled",
    //   `Your booking has been canceled successfully`,
    //   Date.now(),
    //   bookingById.userId
    // );
    // const hotel = await Hotel.findById(bookingById.hotelId);
    // createNotificationProperty(
    //   "booking",
    //   "Booking Canceled",
    //   `A booking is canceled at hotel ${hotel.name}.`,
    //   Date.now(),
    //   hotel.ownerId
    // );
    // await User.find({ account_type: "admin" }).forEach((admin) => {
    //   createNotificationProperty(
    //     "booking",
    //     "Booking Canceled",
    //     `A booking is canceled.`,
    //     Date.now(),
    //     admin._id
    //   );
    // });
    return res.status(200).json({ msg: "Reservation canceled successfully" });
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Cancel Parking reservation
export const cancelParkingReservation = async (req, res) => {
  try {
    // Check If User Cancelling reservation is the same user who made the reservation
    let bookingById = await booking.findById(req.params.id);
    if (!bookingById) {
      bookingById = await AdminBookings.findById(req.params.id);
    }
    if (!bookingById) {
      return res.status(400).json({ msg: "Booking Not Found" });
    }
    const parkingId = bookingById.parkingId;
    const booked_slots = bookingById.parking.Total_slots;

    const updatedParking = await Parking.findByIdAndUpdate(
      parkingId,
      { $inc: { booked_slots: -booked_slots } },
      { new: true }
    );

    if (!updatedParking) {
      return res.status(400).json({ message: "Can Not Update Parking" });
    }

    bookingById.canceled = true;
    const updatedBooking = await bookingById.save();
    if (!updatedBooking) {
      return res.status(500).json({ error: "Booking Not canceled" });
    }

    const theParking = await Parking.findById(bookingById.parkingId);

    if (bookingById.userId) {
      const theUser = await User.findById(bookingById.userId);
      await SendEmail({
        name: theUser.firstName + " " + theUser.lastName,
        email: theUser.email,
        subject: "Hotel Reservation Canceled",
        message: `Your reservation at ${theParking.name} has been canceled.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    } else {
      await SendEmail({
        name: bookingById.user_info.name,
        email: bookingById.user_info.email,
        subject: "Hotel Reservation Canceled",
        message: `Your reservation at ${theParking.name} has been canceled.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    }

    // createNotificationProperty(
    //   "booking",
    //   "Booking Canceled",
    //   `Your booking has been canceled successfully`,
    //   Date.now(),
    //   bookingById.userId
    // );
    // const hotel = await Parking.findById(bookingById.hotelId);
    // createNotificationProperty(
    //   "booking",
    //   "Booking Canceled",
    //   `A booking is canceled at hotel ${hotel.name}.`,
    //   Date.now(),
    //   hotel.ownerId
    // );
    // await User.find({ account_type: "admin" }).forEach((admin) => {
    //   createNotificationProperty(
    //     "booking",
    //     "Booking Canceled",
    //     `A booking is canceled.`,
    //     Date.now(),
    //     admin._id
    //   );
    // });
    return res
      .status(200)
      .json({ message: "Parking Reservation Cancelled Successfully" });
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Cancel hotel and parking reservation
export const cancelHotelAndParkingReservation = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Get Booking By Id
    let bookingById = await booking.findById(bookingId);
    if (!bookingById) {
      bookingById = await AdminBookings.findById(bookingId);
    }
    if (!bookingById) {
      return res.status(400).json({ msg: "Booking Not Found" });
    }

    const hotelparkingId = bookingById.HotelAndParkingId.toString();
    const booked_slots = bookingById.parking.Total_slots;

    const updatedHotelParking = await HotelandParking.findByIdAndUpdate(
      hotelparkingId,
      { $inc: { parking_booked_slots: -booked_slots } },
      { new: true }
    );

    if (!updatedHotelParking) {
      return res
        .status(400)
        .json({ message: "Can Not Update Parking", updatedHotelParking });
    }

    const { HotelAndParkingId, room, checkIn, checkOut } = bookingById;

    const promises = room.map(async (room) => {
      const result = await updateRoomDates(room, checkIn, checkOut);
      if (!result) {
        throw new Error("Failed to update room: " + room.RoomId);
      }
      return true;
    });
    try {
      await Promise.all(promises);
      bookingById.canceled = true;
      const updatedBooking = await bookingById.save();
      if (!updatedBooking) {
        return res.status(500).json({ error: "Booking Not canceled" });
      }
    } catch (error) {
      return res.status(400).json({ msg: "Failed to cancel reservation" });
    }

    const hotelandparking = await HotelandParking.findById(HotelAndParkingId);

    if (bookingById.userId) {
      const theUser = await User.findById(bookingById.userId);
      await SendEmail({
        name: theUser.firstName + " " + theUser.lastName,
        email: theUser.email,
        subject: "Hotel Reservation Canceled",
        message: `Your reservation at ${hotelandparking.name} has been canceled.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    } else {
      await SendEmail({
        name: bookingById.user_info.name,
        email: bookingById.user_info.email,
        subject: "Hotel Reservation Canceled",
        message: `Your reservation at ${hotelandparking.name} has been canceled.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    }

    createNotificationProperty(
      "booking",
      "Booking Canceled",
      `Your booking has been canceled successfully`,
      Date.now(),
      bookingById.userId
    );
    const hotel = await HotelandParking.findById(bookingById.hotelId);
    createNotificationProperty(
      "booking",
      "Booking Canceled",
      `A booking is canceled at hotel ${hotel.hotel_name}.`,
      Date.now(),
      hotel.ownerId
    );
    await User.find({ account_type: "admin" }).forEach((admin) => {
      createNotificationProperty(
        "booking",
        "Booking Canceled",
        `A booking is canceled.`,
        Date.now(),
        admin._id
      );
    });
    return res.status(200).json({ msg: "Reservation canceled successfully" });
  } catch (error) {
    console.log("Error: ", error);
  }
};

//Get All Cancelled Bookings
export const getAllCancelledBookings = async (req, res) => {
  try {
    const allCancelledBookingsUser = await booking.find({ canceled: true });
    const allCancelledBookingsAdmin = await AdminBookings.find({
      canceled: true,
    });
    const allCancelledBookings = [
      ...allCancelledBookingsUser,
      ...allCancelledBookingsAdmin,
    ];
    if (!allCancelledBookings) {
      return res.status(400).json({ msg: "No Cancelled Bookings Found" });
    }
    const result = await convertIntoRequiredFormat(allCancelledBookings);

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

//Get Cancelled Bookings By User Id
export const getCancelledBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const cancelledBookingsByUserId = await booking.find({
      userId,
      canceled: true,
    });
    if (!cancelledBookingsByUserId) {
      return res
        .status(400)
        .json({ msg: "No Cancelled Bookings Found For This User" });
    }
    const result = await convertIntoRequiredFormat(cancelledBookingsByUserId);

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

//Get Cancelled Bookings By Hotel Id
export const getCancelledBookingsByHotelId = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const UserCancelledBookingsByHotelId = await booking.find({
      hotelId,
      canceled: true,
    });
    const AdminCancelledBookingsByHotelId = await AdminBookings.find({
      hotelId,
      canceled: true,
    });
    const cancelledBookingsByHotelId = [
      ...UserCancelledBookingsByHotelId,
      ...AdminCancelledBookingsByHotelId,
    ];
    if (!cancelledBookingsByHotelId) {
      return res
        .status(400)
        .json({ msg: "No Cancelled Bookings Found For This Hotel" });
    }
    const result = await convertIntoRequiredFormat(cancelledBookingsByHotelId);

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

//Get Cancelled Bookings By Parking Id
export const getCancelledBookingsByParkingId = async (req, res) => {
  try {
    const parkingId = req.params.id;
    const UserCancelledBookingsByParkingId = await booking.find({
      parkingId,
      canceled: true,
    });
    const AdminCancelledBookingsByParkingId = await AdminBookings.find({
      parkingId,
      canceled: true,
    });
    const cancelledBookingsByParkingId = [
      ...UserCancelledBookingsByParkingId,
      ...AdminCancelledBookingsByParkingId,
    ];
    if (!cancelledBookingsByParkingId) {
      return res
        .status(400)
        .json({ msg: "No Cancelled Bookings Found For This Parking" });
    }
    const result = await convertIntoRequiredFormat(
      cancelledBookingsByParkingId
    );

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

//Get Cancelled Bookings By Hotel And Parking Id
export const getCancelledBookingsByHotelAndParkingId = async (req, res) => {
  try {
    const HotelAndParkingId = req.params.id;
    const UserCancelledBookingsByHotelAndParkingId = await booking.find({
      HotelAndParkingId,
      canceled: true,
    });
    const AdminCancelledBookingsByHotelAndParkingId = await AdminBookings.find({
      HotelAndParkingId,
      canceled: true,
    });
    const cancelledBookingsByHotelAndParkingId = [
      ...UserCancelledBookingsByHotelAndParkingId,
      ...AdminCancelledBookingsByHotelAndParkingId,
    ];
    if (!cancelledBookingsByHotelAndParkingId) {
      return res.status(400).json({
        msg: "No Cancelled Bookings Found For This Hotel And Parking",
      });
    }
    const result = await convertIntoRequiredFormat(
      cancelledBookingsByHotelAndParkingId
    );

    res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error", error);
  }
};

//Get Cancelled Bookings By Hotel OwnerId
export const getCancelledBookingsByHotelOwnerId = async (req, res) => {
  try {
    const hotelOwnerId = req.params.id;
    const hotels = await Hotel.find({ ownerId: hotelOwnerId });
    const hotelIds = hotels.map((hotel) => hotel._id);
    const UserCancelledBookingsByHotelOwnerId = await booking.find({
      hotelId: { $in: hotelIds },
      canceled: true,
    });
    const AdminCancelledBookingsByHotelOwnerId = await AdminBookings.find({
      hotelId: { $in: hotelIds },
      canceled: true,
    });
    const cancelledBookingsByHotelOwnerId = [
      ...UserCancelledBookingsByHotelOwnerId,
      ...AdminCancelledBookingsByHotelOwnerId,
    ];
    if (!cancelledBookingsByHotelOwnerId) {
      return res.status(400).json({
        msg: "No Cancelled Bookings Found For This Hotel Owner",
      });
    }
    const result = await convertIntoRequiredFormat(
      cancelledBookingsByHotelOwnerId
    );

    res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error", error);
  }
};

//Get Cancelled Bookings By Parking OwnerId
export const getCancelledBookingsByParkingOwnerId = async (req, res) => {
  try {
    const parkingOwnerId = req.params.id;
    const parkings = await Parking.find({ ownerId: parkingOwnerId });
    const parkingIds = parkings.map((parking) => parking._id);
    const UserCancelledBookingsByParkingOwnerId = await booking.find({
      parkingId: { $in: parkingIds },
      canceled: true,
    });
    const AdminCancelledBookingsByParkingOwnerId = await AdminBookings.find({
      parkingId: { $in: parkingIds },
      canceled: true,
    });
    const cancelledBookingsByParkingOwnerId = [
      ...UserCancelledBookingsByParkingOwnerId,
      ...AdminCancelledBookingsByParkingOwnerId,
    ];
    if (!cancelledBookingsByParkingOwnerId) {
      return res.status(400).json({
        msg: "No Cancelled Bookings Found For This Parking Owner",
      });
    }
    const result = await convertIntoRequiredFormat(
      cancelledBookingsByParkingOwnerId
    );

    res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error", error);
  }
};

//Get Cancelled Bookings By Hotel And Parking OwnerId
export const getCancelledBookingsByHotelAndParkingOwnerId = async (
  req,
  res
) => {
  try {
    const hotelAndParkingOwnerId = req.params.id;
    const hotelAndParkings = await HotelandParking.find({
      ownerId: hotelAndParkingOwnerId,
    });
    const hotelIds = hotelAndParkings.map(
      (hotelAndParking) => hotelAndParking._id
    );
    const UserCancelledBookingsByHotelAndParkingOwnerId = await booking.find({
      HotelAndParkingId: { $in: hotelIds },
      canceled: true,
    });
    const AdminCancelledBookingsByHotelAndParkingOwnerId =
      await AdminBookings.find({
        HotelAndParkingId: { $in: hotelIds },
        canceled: true,
      });
    const cancelledBookingsByHotelAndParkingOwnerId = [
      ...UserCancelledBookingsByHotelAndParkingOwnerId,
      ...AdminCancelledBookingsByHotelAndParkingOwnerId,
    ];
    if (!cancelledBookingsByHotelAndParkingOwnerId) {
      return res.status(400).json({
        msg: "No Cancelled Bookings Found For This Hotel And Parking Owner",
      });
    }
    const result = await convertIntoRequiredFormat(
      cancelledBookingsByHotelAndParkingOwnerId
    );

    res.status(result.status).json(result.data);
  } catch (error) {
    console.log("Error", error);
  }
};

// Get All Bookings by Hotel Id
export const getBookingByHotelId = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const userBooking = await booking.find({ hotelId: hotelId });
    const adminBooking = await AdminBookings.find({ hotelId: hotelId });
    const bookings = [...userBooking, ...adminBooking];
    if (!bookings) return res.status(400).json({ msg: "No Bookings Found" });
    const data = bookings.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get All Bookings by Parking Id
export const getBookingByParkingId = async (req, res) => {
  try {
    const parkingId = req.params.id;
    const Userbooking = await booking.find({ parkingId: parkingId });
    const Adminbooking = await AdminBookings.find({ parkingId: parkingId });
    const bookings = [...Userbooking, ...Adminbooking];
    if (!bookings) return res.status(400).json({ msg: "No Bookings Found" });
    const data = bookings.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get All Bookings by hotelAndParking Id
export const getBookingByHotelAndParkingId = async (req, res) => {
  try {
    const hotelAndParkingId = req.params.id;
    const userBooking = await booking.find({
      HotelAndParkingId: hotelAndParkingId,
    });
    const adminBooking = await AdminBookings.find({
      HotelAndParkingId: hotelAndParkingId,
    });
    const bookings = [...userBooking, ...adminBooking];
    if (!bookings) return res.status(400).json({ msg: "No Bookings Found" });
    const data = bookings.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get Upcomming Bookings by HotelOwnerId
export const getUpcommingBookingsByHotelOwnerId = async (req, res) => {
  const hotelOwnerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotelIds = await Hotel.find({ ownerId: hotelOwnerId }).select("_id");
    const Userbooking = await booking.find({ hotelId: { $in: hotelIds } });
    const Adminbooking = await AdminBookings.find({
      hotelId: { $in: hotelIds },
    });
    const bookings = [...Userbooking, ...Adminbooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Upcomming Bookings by HotelAndParkingOwnerId
export const getUpcommingBookingsByHotelParkingOwnerId = async (req, res) => {
  const hotelParkingOwnerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotelIds = await HotelandParking.find({
      ownerId: hotelParkingOwnerId,
    }).select("_id");
    const userBooking = await booking.find({
      HotelAndParkingId: { $in: hotelIds },
    });
    const adminBooking = await AdminBookings.find({
      HotelAndParkingId: { $in: hotelIds },
    });
    const bookings = [...userBooking, ...adminBooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Upcomming Bookings by ParkingOwnerId
export const getUpcommingBookingsByParkingOwnerId = async (req, res) => {
  const ParkingOwnerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const parkingIds = await Parking.find({ ownerId: ParkingOwnerId }).select(
      "_id"
    );
    const userBooking = await booking.find({ parkingId: { $in: parkingIds } });
    const adminBooking = await AdminBookings.find({
      parkingId: { $in: parkingIds },
    });
    const bookings = [...userBooking, ...adminBooking];
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Upcomming Bookings by HotelOwnerId
export const getUpcommingBookingsByHotelId = async (req, res) => {
  const hotelId = mongoose.Types.ObjectId(req.params.id);
  try {
    const userBooking = await booking.find({ Booking_type: "hotel" });
    const adminBooking = await AdminBookings.find({ Booking_type: "hotel" });
    const bookings = [...userBooking, ...adminBooking];
    const filteredBookings = bookings.filter((booking) => {
      return booking.bookingData._id === hotelId;
    });

    let currentDate = new Date();
    const filteredResult = filteredBookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Upcomming Bookings by HotelAndParkingOwnerId
export const getUpcommingBookingsByHotelParkingId = async (req, res) => {
  const hotelParkingId = mongoose.Types.ObjectId(req.params.id);
  try {
    const userBooking = await booking.find({ Booking_type: "hotelandparking" });
    const adminBooking = await AdminBookings.find({
      Booking_type: "hotelandparking",
    });
    const bookings = [...userBooking, ...adminBooking];
    const filteredBookings = bookings.filter((booking) => {
      return booking.bookingData._id === hotelParkingId;
    });

    let currentDate = new Date();
    const filteredResult = filteredBookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Upcomming Bookings by HotelId
export const getUpcommingBookingsByParkingId = async (req, res) => {
  const ParkingId = mongoose.Types.ObjectId(req.params.id);
  try {
    const userBooking = await booking.find({ Booking_type: "parking" });
    const adminBooking = await AdminBookings.find({ Booking_type: "parking" });
    const bookings = [...userBooking, ...adminBooking];
    const filteredBookings = bookings.filter((booking) => {
      return booking.bookingData._id === ParkingId;
    });

    let currentDate = new Date();
    const filteredResult = filteredBookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const data = filteredResult.filter((booking) => booking.canceled === false);
    const bookingOut = await convertIntoRequiredFormat(data);
    res.status(bookingOut.status).json(bookingOut.data);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Free Booked Hotel Rooms By Booking Id
export const freeBookedHotelRoomsByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.id;
    let bookingById = await booking.findById(bookingId);
    if (!bookingById) bookingById = await AdminBookings.findById(bookingId);
    if (!bookingById) {
      return res.status(400).json({ msg: "Booking Not Found" });
    }

    const { hotelId, room, checkIn, checkOut } = bookingById;

    const promises = room.map(async (room) => {
      const result = await updateRoomDates(room, checkIn, checkOut);
      if (!result) {
        throw new Error("Failed to update room: " + room.RoomId);
      }
      return true;
    });

    try {
      await Promise.all(promises);
      const updatedBooking = await bookingById.save();
      if (!updatedBooking) {
        return res.status(500).json({ error: "Booking Not canceled" });
      }
    } catch (error) {
      return res.status(400).json({ msg: "Failed to cancel reservation" });
    }
    const theHotel = await Hotel.findById(hotelId);

    if (bookingById.userId) {
      const theUser = await User.findById(bookingById.userId);
      await SendEmail({
        name: theUser.firstName + " " + theUser.lastName,
        email: theUser.email,
        subject: "Hotel Checked Out",
        message: `Your are checked out from ${theHotel.name} by the hotel management.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    } else {
      await SendEmail({
        name: bookingById.user_info.name,
        email: bookingById.user_info.email,
        subject: "Hotel Checked Out",
        message: `Your are checked out from ${theHotel.name} by the hotel management.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    }

    // createNotificationProperty(
    //   "booking",
    //   "Booking checkOut",
    //   `Check out by hotel ${bookingById.hotelId}.`,
    //   Date.now(),
    //   bookingById.userId
    // );
    // const hotel = await Hotel.findById(bookingById.hotelId);
    // createNotificationProperty(
    //   "booking",
    //   "Booking checkOut",
    //   `Chehck out by hotel ${bookingById.hotelId}.`,
    //   Date.now(),
    //   hotel.ownerId
    // );
    // await User.find({ account_type: "admin" }).forEach((admin) => {
    //   createNotificationProperty(
    //     "booking",
    //     "Booking checkOut",
    //     `Chehck out by hotel ${bookingById.hotelId}.`,
    //     Date.now(),
    //     admin._id
    //   );
    // });
    bookingById.completed = true;
    await bookingById.save();
    return res.status(200).json({ msg: "Reservation canceled successfully" });
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Free Booked Parking Slots By Booking Id
export const freeBookedParkingSlotsByBookingId = async (req, res) => {
  try {
    let bookingById = await booking.findById(req.params.id);
    if (!bookingById) bookingById = await AdminBookings.findById(req.params.id);
    if (!bookingById) {
      return res.status(400).json({ message: "Booking Not Found" });
    }

    const parkingId = bookingById.parkingId;
    const booked_slots = bookingById.parking.Total_slots;

    const updatedParking = await Parking.findByIdAndUpdate(
      parkingId,
      { $inc: { booked_slots: -booked_slots } },
      { new: true }
    );

    if (!updatedParking) {
      return res.status(400).json({ message: "Can Not Update Parking" });
    }

    const updatedBooking = await bookingById.save();
    if (!updatedBooking) {
      return res.status(500).json({ error: "Booking Not canceled" });
    }
    const theHotel = await Parking.findById(bookingById.parkingId);

    if (bookingById.userId) {
      const theUser = await User.findById(bookingById.userId);
      await SendEmail({
        name: theUser.firstName + " " + theUser.lastName,
        email: theUser.email,
        subject: "Hotel Checked Out",
        message: `Your are checked out from ${theHotel.name} by the hotel management.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    } else {
      await SendEmail({
        name: bookingById.user_info.name,
        email: bookingById.user_info.email,
        subject: "Hotel Checked Out",
        message: `Your are checked out from ${theHotel.name} by the hotel management.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    }

    // createNotificationProperty(
    //   "booking",
    //   "Booking checkOut",
    //   `Check out by hotel ${bookingById.parkingId}.`,
    //   Date.now(),
    //   bookingById.userId
    // );
    // const hotel = await Parking.findById(bookingById.hotelId);
    // createNotificationProperty(
    //   "booking",
    //   "Booking checkOut",
    //   `Chehck out by hotel ${bookingById.parkingId}.`,
    //   Date.now(),
    //   hotel.ownerId
    // );
    // await User.find({ account_type: "admin" }).forEach((admin) => {
    //   createNotificationProperty(
    //     "booking",
    //     "Booking checkOut",
    //     `Chehck out by hotel ${bookingById.parkingId}.`,
    //     Date.now(),
    //     admin._id
    //   );
    // });
    bookingById.completed = true;
    await bookingById.save();
    return res
      .status(200)
      .json({ message: "Parking Reservation Cancelled Successfully" });
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Free Booked Hotel and Parking Slots By Booking Id
export const freeBookedHotelAndParkingByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.id;
    let bookingById = await booking.findById(bookingId);
    if (!bookingById) bookingById = await AdminBookings.findById(bookingId);
    if (!bookingById) {
      return res.status(400).json({ msg: "Booking Not Found" });
    }

    const hotelparkingId = bookingById.HotelAndParkingId.toString();
    const booked_slots = bookingById.parking.Total_slots;

    const updatedHotelParking = await HotelandParking.findByIdAndUpdate(
      hotelparkingId,
      { $inc: { parking_booked_slots: -booked_slots } },
      { new: true }
    );

    if (!updatedHotelParking) {
      return res
        .status(400)
        .json({ message: "Can Not Update Parking", updatedHotelParking });
    }

    const { HotelAndParkingId, room, checkIn, checkOut } = bookingById;

    const promises = room.map(async (room) => {
      const result = await updateRoomDates(room, checkIn, checkOut);
      if (!result) {
        throw new Error("Failed to update room: " + room.RoomId);
      }
      return true;
    });
    try {
      await Promise.all(promises);

      const updatedBooking = await bookingById.save();
      if (!updatedBooking) {
        return res.status(500).json({ error: "Booking Not canceled" });
      }
    } catch (error) {
      return res.status(400).json({ msg: "Failed to cancel reservation" });
    }

    const theHotel = await HotelandParking.findById(HotelAndParkingId);

    if (bookingById.userId) {
      const theUser = await User.findById(userId);
      await SendEmail({
        name: theUser.firstName + " " + theUser.lastName,
        email: theUser.email,
        subject: "Hotel Checked Out",
        message: `Your are checked out from ${theHotel.name} by the hotel management.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    } else {
      await SendEmail({
        name: bookingById.user_info.name,
        email: bookingById.user_info.email,
        subject: "Hotel Checked Out",
        message: `Your are checked out from ${theHotel.name} by the hotel management.
      Details:
      Check In: ${bookingById.checkIn}
      Check Out: ${bookingById.checkOut}
      Total Price: ${bookingById.total_price}`,
      });
    }
    const hotel = await Hotel.findById(bookingById.HotelAndParkingId);

    // createNotificationProperty(
    //   "booking",
    //   "Booking checkOut",
    //   `Check out by hotel ${bookingById.HotelAndParkingId}.`,
    //   Date.now(),
    //   bookingById.userId
    // );
    // createNotificationProperty(
    //   "booking",
    //   "Booking checkOut",
    //   `Chehck out by hotel ${bookingById.HotelAndParkingId}.`,
    //   Date.now(),
    //   hotel.ownerId
    // );
    // await User.find({ account_type: "admin" }).forEach((admin) => {
    //   createNotificationProperty(
    //     "booking",
    //     "Booking checkOut",
    //     `Chehck out by hotel ${bookingById.HotelAndParkingId}.`,
    //     Date.now(),
    //     admin._id
    //   );
    // });
    bookingById.completed = true;
    await bookingById.save();
    return res.status(200).json({ msg: "Reservation canceled successfully" });
  } catch (error) {
    console.log("Error: ", error);
  }
};
