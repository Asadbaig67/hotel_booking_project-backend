import mongoose from "mongoose";
import booking from "../models/booking.js";
import Parking from "../models/Parking.js";
import Hotel from "../models/Hotel.js";
import HotelandParking from "../models/Hotel_Parking.js";
import { validateBooking } from "../Functions/Booking/ValidateData.js";
import { updateunavailabledates } from "../Functions/Booking/UpdateUnavailableDates.js";

// Add Hotel Booking Function Updated
export const addBooking = async (req, res) => {
  let { userId, hotelId, room, checkIn, checkOut } = req.query;

  if (!userId || !hotelId || !room || !checkIn || !checkOut) {
    return res
      .status(400)
      .json({ message: "Please enter all fields. All fields are required." });
  }

  room = JSON.parse(room);
  checkIn = new Date(checkIn);
  checkOut = new Date(checkOut);
  const createdAt = Date.now();

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

  const total_price = room.reduce((accumulator, currentRoom) => {
    return accumulator + currentRoom.Room_price;
  }, 0);

  // Make New Booking document and save
  const newBooking = new booking({
    Booking_type: "hotel",
    userId,
    hotelId,
    room,
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
  const exists = await booking.findOne({
    HotelAndParkingId,
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

  checkIn = new Date(checkIn);
  checkOut = new Date(checkOut);
  parking = JSON.parse(parking);
  const createdAt = Date.now();
  let total_price = parking.Total_slots * parking.Parking_price;

  const exist = await booking.findOne({
    userId,
    parking,
    checkIn,
    checkOut,
  });

  // Add booking in parking by id
  if (exist) {
    return res.status(400).json({ msg: "Booking already exists" });
  }

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
      { $inc: { total_slots: parking.Total_slots } },
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
    res.status(200).json(bookings);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Get Specific Booking By Id
export const getBookingById = async (req, res) => {
  try {
    const bookingById = await booking.findById(req.params.id);
    res.status(200).json(bookingById);
  } catch (error) {
    res.status(404).json("Booking not found");
    // console.log("Error: ", error);
  }
};

// Get Specific Booking By Type
export const getBookingByType = async (req, res) => {
  const type = req.params.type;
  try {
    const bookingByType = await booking.find({ type });
    res.status(200).json(bookingByType);
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
    if (bookings.length === 0) {
      return res.status(404).json("Booking not found");
    }
    res.status(200).json(result);
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
    if (bookings.length === 0) {
      return res.status(404).json("Booking not found");
    }
    res.status(200).json(result);
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
    if (bookings.length === 0) {
      return res.status(404).json("Booking not found");
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json("Bookings not found");
  }
};

// Add New User Booking Function
export const UserBooking = async (req, res) => {
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
    res.status(200).json(bookingById);
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Cancel Booking
export const deleteBooking = async (req, res) => {
  try {
    const bookingById = await booking.findByIdAndDelete(req.params.id);
    res.status(200).json(bookingById);
  } catch (error) {
    console.log("Error: ", error);
  }
};
