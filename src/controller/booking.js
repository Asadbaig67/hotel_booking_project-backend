import mongoose from "mongoose";
import booking from "../models/booking.js";
import Parking from "../models/Parking.js";
import Hotel from "../models/Hotel.js";
import User from "../models/user.js";
import HotelandParking from "../models/Hotel_Parking.js";
import { validateBooking } from "../Functions/Booking/ValidateData.js";
import { updateunavailabledates } from "../Functions/Booking/UpdateUnavailableDates.js";
import { updateRoomDates } from "../Functions/Booking/UpdateRoomDates.js";
import { createNotification } from "../Functions/Notification/createNotification.js";

// import { updateRoomDatesFun } from "../Functions/Booking/UpdateRoomDates.js";
// import { updateDates } from "../Functions/Booking/UpdateDates.js";

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

  // res.send({ message: "ok", data: { userId, hotelId, room, checkIn, checkOut, createdAt } });

  // Check If Booking Already Exists Or Not
  // const exists = await booking.findOne({
  //   hotelId,
  //   checkIn: { $lte: checkOut },
  //   checkOut: { $gte: checkIn },
  //   "room.RoomId": { $in: room.map((r) => r.RoomId) },
  //   "room.Room_no": { $in: room.map((r) => r.Room_no) },
  // });
  // if (exists) {
  //   return res.status(400).json({ msg: "Booking already exists" });
  // }

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

    createNotification(
      "booking",
      "Booking success",
      `Booking abc`,
      Date.now(),
      hotelId,
      userId
    );
    // If Booking Successfull, Send Success Message
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

  // Check If Booking Already Exists Or Not
  // const exists = await booking.findOne({
  //   HotelAndParkingId,
  //   checkIn: { $lte: checkOut },
  //   checkOut: { $gte: checkIn },
  //   "room.RoomId": { $in: room.map((r) => r.RoomId) },
  //   "room.Room_no": { $in: room.map((r) => r.Room_no) },
  // });
  // const exists = await booking.findOne({
  //   HotelAndParkingId,
  //   checkIn: { $lte: checkOut },
  //   checkOut: { $gte: checkIn },
  //   "room.Room_no": { $in: room.map((r) => r.Room_no) },
  // });
  // const exists = await booking.findOne({
  //   $and: [
  //     // { HotelAndParkingId },
  //     { checkIn: { $lte: checkOut } },
  //     { checkOut: { $gte: checkIn } },
  //     { "room.RoomId": { $in: room.map((r) => r.RoomId) } },
  //     { "room.Room_no": { $in: room.map((r) => r.Room_no) } }
  //   ]
  // });

  // if (exists) {
  //   return res.status(400).json({ msg: "Booking already exists" });
  // }

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

    createNotification(
      "booking",
      "Booking success",
      `Booking abc`,
      Date.now(),
      hotelId,
      userId
    );
    // If Booking Successfull, Send Success Message
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

  // checkIn = new Date(checkIn);
  // checkOut = new Date(checkOut);
  parking = JSON.parse(parking);
  const createdAt = Date.now();
  let total_price = parking.Total_slots * parking.Parking_price;

  const exist = await booking.findOne({
    userId,
    "parking.Total_slots": parking.Total_slots,
    "parking.Parking_price": parking.Parking_price,
    checkIn,
    checkOut,
  });

  // Add booking in parking by id
  if (exist) {
    return res.status(400).json({ msg: "Booking already exists" });
  }

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
      { _id: parkingId },
      { $inc: { booked_slots: parking.Total_slots } },
      { new: true }
    );
    if (!Existing_parking) {
      const deleteBooking = await booking.findByIdAndDelete({
        _id: booking._id.toString(),
      });
      return res.status(409).json({ message: "Error Occured Booking Denied!" });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get All Bookings Function
export const getBooking = async (req, res) => {
  try {
    const bookings = await booking.find();
    const bookingOut = [];
    await Promise.all(
      bookings.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    res.status(200).json(bookingOut);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get Specific Booking By Id
export const getBookingById = async (req, res) => {
  try {
    const bookingById = await booking.findById(req.params.id);
    const bookingOut = {};
    if (booking) {
      bookingOut._id = bookingById._id;
      bookingOut.total_price = bookingById.total_price;
      bookingOut.Booking_type = bookingById.Booking_type;
      bookingOut.bookingData = bookingById;
      bookingOut.createdAt = new Date(bookingById.createdAt).toLocaleString();
      bookingOut.checkIn = new Date(bookingById.checkIn).toLocaleString();
      bookingOut.checkOut = new Date(bookingById.checkOut).toLocaleString();
      bookingOut.userId = await User.findById(bookingById.userId);
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
    console.log(bookingOut);
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
    const bookingByType = await booking.find({ Booking_type });
    const bookingOut = [];
    await Promise.all(
      bookingByType.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    res.status(200).json(bookingOut);
  } catch (error) {
    res.status(404).json("Booking not found");
    // console.log("Error: ", error);
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
    bookings = bookings.filter((booking) => booking !== null);
    const result = bookings.flat();
    const bookingOut = [];
    await Promise.all(
      result.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    if (bookingOut.length === 0) {
      return res.status(404).json("Booking not found");
    }
    res.status(200).json(bookingOut);
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
      const document = await booking.find({ parkingId: objectId });
      if (document.length !== 0) bookings.push(document);
    }
    bookings = bookings.filter((booking) => booking !== null);
    const result = bookings.flat();
    const bookingOut = [];
    await Promise.all(
      result.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    if (bookingOut.length === 0) {
      return res.status(404).json("Booking not found");
    }
    res.status(200).json(bookingOut);
  } catch (error) {
    res.status(404).json("Booking not found");
    // console.log("Error: ", error);
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
    bookings = bookings.filter((booking) => booking !== null);
    const result = bookings.flat();
    const bookingOut = [];
    await Promise.all(
      result.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    if (bookings.length === 0) {
      return res.status(404).json("Booking not found");
    }
    res.status(200).json(bookingOut);
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
    if (!result) {
      return res.status(404).json("Booking not found");
    }

    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        (bookingCheckIn <= currentDate && bookingCheckOut >= currentDate)
      );
    });

    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    res.status(200).json(bookingOut);
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
    if (!bookingByUserId || bookingByUserId.length === 0) {
      return res.status(404).json("Booking not found");
    }
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        (bookingCheckIn <= currentDate && bookingCheckOut >= currentDate)
      );
    });

    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    res.status(200).json(bookingOut);
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
    if (!bookingByUserId || !result.length > 0) {
      return res.status(404).json("Booking not found");
    }
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return (
        (bookingCheckIn < currentDate && bookingCheckOut < currentDate) ||
        (bookingCheckIn <= currentDate && bookingCheckOut >= currentDate)
      );
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    res.status(200).json(bookingOut);
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
    if (!bookingByUserId || result.length === 0) {
      return res.status(404).json("Booking not found");
    }
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return bookingCheckIn > currentDate && bookingCheckOut > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }
    res.status(200).json(bookingOut);
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
    if (!bookingByUserId || result.length === 0) {
      return res.status(404).json("Booking not found");
    }
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return bookingCheckIn > currentDate && bookingCheckOut > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(bookingOut);
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
    if (!bookingByUserId || result.length === 0) {
      return res.status(404).json("Booking not found");
    }
    let currentDate = new Date();

    const filteredResult = result.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      return bookingCheckIn > currentDate && bookingCheckOut > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }
    res.status(200).json(bookingOut);
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

      // Check If Booking Already Exists Or Not
      // const exists = await Promise.all(room.map(async (Room) => {
      //   return await booking.findOne({ room: { $elemMatch: { RoomId: Room.RoomId, Room_no: Room.Room_no } }, checkIn, checkOut });
      // }));
      // // If Already Exists Send Error Message
      // if (exists.some((result) => result)) {
      //   return res.status(400).json({ msg: "Booking already exists" });
      // }

      // On Successfull Booking Make API Request To Update The Rooms That Has Been Reserved In This Booking
      const result = await updateunavailabledates(room, checkIn, checkOut);

      // If Any Of The Rooms Failed To Update, Send Error
      if (!result.some((result) => result)) {
        return res.status(400).json({ msg: "Booking ==> Failed" });
      }

      // Make New Booking document and save
      const newBooking = new booking(data);

      // const newBooking = new booking({
      //   Booking_type,
      //   userId,
      //   hotelId,
      //   room,
      //   checkIn,
      //   checkOut,
      //   price,
      //   createdAt,
      // });

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

      // Check If Booking Already Exists Or Not
      // const exists = await Promise.all(room.map(async (Room) => {
      //   return await booking.findOne({ $and: [{ room: { $elemMatch: { RoomId: Room.RoomId, Room_no: Room.Room_no } } }, { checkIn }, { checkOut }] });
      // }));
      // // If Already Exists Send Error Message
      // if (exists.some((result) => result)) {
      //   return res.status(400).json({ msg: "Booking already exists" });
      // }

      // On Successfull Booking Make API Request To Update The Rooms That Has Been Reserved In This Booking
      const result = await updateunavailabledates(room, checkIn, checkOut);

      // If Any Of The Rooms Failed To Update, Send Error
      if (!result.some((result) => result)) {
        return res.status(400).json({ msg: "Booking ==> Failed" });
      }

      // Make New Booking document and save
      const newBooking = new booking(data);
      // const newBooking = new booking({
      //   Booking_type,
      //   userId,
      //   hotelId,
      //   room,
      //   checkIn,
      //   checkOut,
      //   parkingDetails,
      //   price,
      //   createdAt,
      // });

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
      // const newBooking = new booking({
      //   Booking_type,
      //   userId,
      //   parkingId,
      //   checkIn,
      //   checkOut,
      //   parkingDetails,
      //   createdAt,
      // });

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
    createNotification(
      "booking",
      "Booking success",
      `Booking abc`,
      Date.now(),
      hotelId,
      userId
    );
    res.status(200).json(bookingById);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Cancel Booking
export const deleteBooking = async (req, res) => {
  try {
    const bookingById = await booking.findByIdAndDelete(req.params.id);
    createNotification(
      "booking",
      "Booking success",
      `Booking abc`,
      Date.now(),
      hotelId,
      userId
    );
    res.status(200).json(bookingById);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Cancel Hotel Reservation
export const cancelHotelReservation = async (req, res) => {
  try {
    // console.log("User Id =  ", req.user);
    // const user = req.user;
    // console.log("User Id =  ", user._id);

    const bookingId = req.params.id;
    // const UserId = user._id;

    // Get Booking By Id
    const bookingById = await booking.findById(bookingId);
    if (!bookingById) {
      return res.status(400).json({ msg: "Booking Not Found" });
    }

    // console.log("Booking By Id = ", bookingById.userId);
    // console.log("User Id in Request Object = ", UserId);

    // Check If User Cancelling reservation is the same user who made the reservation
    // if (bookingById.userId.toString() !== UserId) {
    //   return res
    //     .status(400)
    //     .json({ msg: "You are not authorized to cancel this reservation" });
    // }

    // Get Booked Rooms From Booking By Id
    const { room, checkIn, checkOut } = bookingById;

    // const Canceled = await Promise.all(room.map(async (room) => {
    //   const result = await updateRoomDates(room, checkIn, checkOut);
    //   if (!result) {
    //     throw new Error('Failed to update room: ' + room.RoomId);
    //   }
    // }));

    // if (!Canceled.some((result) => result)) {
    //   return res.status(400).json({ msg: "Failed to cancel reservation" });
    // }
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
    } catch (error) {
      return res.status(400).json({ msg: "Failed to cancel reservation" });
    }
    // createNotification(
    //   "booking",
    //   "Booking success",
    //   `Booking abc`,
    //   Date.now(),
    //   hotelId,
    //   userId
    // );
    return res.status(200).json({ msg: "Reservation canceled successfully" });

    // return res.status(200).json({ msg: "Reservation cancelled successfully" });

    // const Obj = req.query.dataObj;
    // let userObj;
    // try {
    //   userObj = JSON.parse(Obj);
    // } catch (error) {
    //   console.error('Error parsing JSON:', error);
    //   res.status(400).json({ error: 'Invalid dataObj parameter' });
    //   return;
    // }
    // res.status(200).json(userObj);

    // const bookingById = await booking.findById(req.params.id);
    // const { room, checkIn, checkOut } = bookingById;
    // const result = await updateunavailabledates(room, checkIn, checkOut);
    // if (!result.some((result) => result)) {
    //   return res.status(400).json({ msg: "Booking ==> Failed" });
    // }
    // const bookingByIdDelete = await booking.findByIdAndDelete(req.params.id);
    // res.status(200).json(bookingByIdDelete);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Cancel Parking reservation
export const cancelParkingReservation = async (req, res) => {
  try {
    // const user = req.user;
    // const UserId = user._id;

    // Check If User Cancelling reservation is the same user who made the reservation
    const bookingById = await booking.findById(req.params.id);

    // if (bookingById.userId.toString() !== UserId) {
    //   return res
    //     .status(400)
    //     .json({ msg: "You are not authorized to cancel this reservation" });
    // }
    const parkingId = bookingById.parkingId;
    const booked_slots = bookingById.parking.Total_slots;

    const updatedParking = await Parking.findByIdAndUpdate(
      parkingId,
      { $inc: { booked_slots: -booked_slots } },
      { new: true }
    );

    if (!updatedParking)
      return res.status(400).json({ message: "Can Not Update Parking" });

    const deleteBooking = await booking.findByIdAndDelete(req.params.id);
    if (!deleteBooking)
      return res.status(200).json({
        message:
          "Reservation is cancelled . Booking will be deleted after sometime",
      });
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
    // const user = req.user;
    // const UserId = user._id;

    // Get Booking By Id
    const bookingById = await booking.findById(bookingId);
    if (!bookingById) {
      return res.status(400).json({ msg: "Booking Not Found" });
    }

    // Check If User Cancelling reservation is the same user who made the reservation
    // if (bookingById.userId.toString() !== UserId) {
    //   return res
    //     .status(400)
    //     .json({ msg: "You are not authorized to cancel this reservation" });
    // }

    // Get Booked Rooms From Booking By Id
    const { room, checkIn, checkOut } = bookingById;
    const promises = room.map(async (room) => {
      const result = await updateRoomDates(room, checkIn, checkOut);
      if (!result) {
        throw new Error("Failed to update room: " + room.RoomId);
      }
      return true;
    });
    try {
      await Promise.all(promises);
    } catch (error) {
      return res.status(400).json({ msg: "Failed to cancel reservation" });
    }
    // createNotification(
    //   "booking",
    //   "Booking success",
    //   `Booking abc`,
    //   Date.now(),
    //   hotelId,
    //   userId
    // );
    return res.status(200).json({ msg: "Reservation canceled successfully" });
  } catch (error) {
    console.log("Error: ", error);
  }
};

//Get All Cancelled Bookings
export const getAllCancelledBookings = async (req, res) => {};

//Get Cancelled Bookings By User Id
export const getCancelledBookingsByUserId = async (req, res) => {};

//Get Cancelled Bookings By Hotel Id
export const getCancelledBookingsByHotelId = async (req, res) => {};

//Get Cancelled Bookings By Parking Id
export const getCancelledBookingsByParkingId = async (req, res) => {};

//Get Cancelled Bookings By Hotel And Parking Id
export const getCancelledBookingsByHotelAndParkingId = async (req, res) => {};

//Get Cancelled Bookings By Hotel OwnerId
export const getCancelledBookingsByHotelOwnerId = async (req, res) => {};

//Get Cancelled Bookings By Parking OwnerId
export const getCancelledBookingsByParkingOwnerId = async (req, res) => {};

//Get Cancelled Bookings By Hotel And Parking OwnerId
export const getCancelledBookingsByHotelAndParkingOwnerId = async (
  req,
  res
) => {};

// Get All Bookings by Hotel Id
export const getBookingByHotelId = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const bookings = await booking.find({ hotelId: hotelId });
    if (!bookings) return res.status(400).json({ msg: "No Bookings Found" });
    const bookingOut = [];
    await Promise.all(
      bookings.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    res.status(200).json(bookingOut);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get All Bookings by Parking Id
export const getBookingByParkingId = async (req, res) => {
  try {
    const parkingId = req.params.id;
    const bookings = await booking.find({ parkingId: parkingId });
    if (!bookings) return res.status(400).json({ msg: "No Bookings Found" });
    const bookingOut = [];
    await Promise.all(
      bookings.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    res.status(200).json(bookingOut);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get All Bookings by hotelAndParking Id
export const getBookingByHotelAndParkingId = async (req, res) => {
  try {
    const hotelAndParkingId = req.params.id;
    const bookings = await booking.find({
      HotelAndParkingId: hotelAndParkingId,
    });
    if (!bookings) return res.status(400).json({ msg: "No Bookings Found" });
    const bookingOut = [];
    await Promise.all(
      bookings.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );
    res.status(200).json(bookingOut);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get Upcomming Bookings by HotelOwnerId
export const getUpcommingBookingsByHotelOwnerId = async (req, res) => {
  const hotelOwnerId = mongoose.Types.ObjectId(req.params.id);
  try {
    const hotelIds = await Hotel.find({ ownerId: hotelOwnerId }).select("_id");
    const bookings = await booking.find({ hotelId: { $in: hotelIds } });
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }
    res.status(200).json(bookingOut);
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
    const bookings = await booking.find({ hotelId: { $in: hotelIds } });
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }
    res.status(200).json(bookingOut);
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
    const bookings = await booking.find({ hotelId: { $in: parkingIds } });
    let currentDate = new Date();
    const filteredResult = bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }
    res.status(200).json(bookingOut);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Upcomming Bookings by HotelOwnerId
export const getUpcommingBookingsByHotelId = async (req, res) => {
  const hotelId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookings = await booking.find({ Booking_type: "hotel" });
    const filteredBookings = bookings.filter((booking) => {
      return booking.bookingData._id === hotelId;
    });

    let currentDate = new Date();
    const filteredResult = filteredBookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }
    res.status(200).json(bookingOut);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Upcomming Bookings by HotelAndParkingOwnerId
export const getUpcommingBookingsByHotelParkingId = async (req, res) => {
  const hotelParkingId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookings = await booking.find({ Booking_type: "hotelandparking" });
    const filteredBookings = bookings.filter((booking) => {
      return booking.bookingData._id === hotelParkingId;
    });

    let currentDate = new Date();
    const filteredResult = filteredBookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }
    res.status(200).json(bookingOut);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};

// Get Upcomming Bookings by HotelId
export const getUpcommingBookingsByParkingId = async (req, res) => {
  const ParkingId = mongoose.Types.ObjectId(req.params.id);
  try {
    const bookings = await booking.find({ Booking_type: "parking" });
    const filteredBookings = bookings.filter((booking) => {
      return booking.bookingData._id === ParkingId;
    });

    let currentDate = new Date();
    const filteredResult = filteredBookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      return bookingCheckIn > currentDate;
    });
    const bookingOut = [];
    await Promise.all(
      filteredResult.map(async (booking, i) => {
        bookingOut[i] = {};
        bookingOut[i]._id = booking._id;
        bookingOut[i].total_price = booking.total_price;
        bookingOut[i].Booking_type = booking.Booking_type;
        bookingOut[i].bookingData = booking;
        bookingOut[i].createdAt = new Date(booking.createdAt).toLocaleString();
        bookingOut[i].checkIn = new Date(booking.checkIn).toLocaleString();
        bookingOut[i].checkOut = new Date(booking.checkOut).toLocaleString();
        bookingOut[i].userId = await User.findById(booking.userId);
        if (bookingOut[i].userId)
          bookingOut[i].userName =
            bookingOut[i].userId.firstName +
            " " +
            bookingOut[i].userId.lastName;
        else bookingOut[i].userName = "N/A";
        if (booking.HotelAndParkingId) {
          bookingOut[i].HotelAndParkingId = await HotelandParking.findById(
            booking.HotelAndParkingId
          );
          if (bookingOut[i].HotelAndParkingId)
            bookingOut[i].hotelAndParkingName =
              bookingOut[i].HotelAndParkingId.hotel_name;
          else bookingOut[i].hotelAndParkingName = "N/A";
        } else if (booking.parkingId) {
          bookingOut[i].parkingData = await Parking.findById(booking.parkingId);
          if (bookingOut[i].parkingData)
            bookingOut[i].parkingName = bookingOut[i].parkingData.name;
          else bookingOut[i].parkingName = "N/A";
        } else if (booking.hotelId) {
          bookingOut[i].hotelData = await Hotel.findById(booking.hotelId);
          if (bookingOut[i].hotelData)
            bookingOut[i].hotelName = bookingOut[i].hotelData.name;
          else bookingOut[i].hotelName = "N/A";
        }
      })
    );

    if (bookingOut.length === 0) {
      return res.status(404).json([]);
    }
    res.status(200).json(bookingOut);
  } catch (error) {
    res.status(404).json("No Booking Found");
  }
};
