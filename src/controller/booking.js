import booking from "../models/booking.js";
import Parking from "../models/Parking.js";
import { validateBooking } from '../Functions/Booking/ValidateData.js'
import { updateunavailabledates } from "../Functions/Booking/UpdateUnavailableDates.js";

// Add Booking Function
export const addBooking = async (req, res) => {
  const { userId, hotelId, room, checkIn, checkOut, price } = req.body;
  const createdAt = Date.now();
  if (!userId || !hotelId || !room || !checkIn || !checkOut || !price) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  const exist = await booking.findOne({
    room,
    checkIn,
    checkOut,
  });
  if (exist) {
    return res.status(400).json({ msg: "Booking already exists" });
  }
  const newBooking = new booking({
    userId,
    hotelId,
    room,
    checkIn,
    checkOut,
    price,
    createdAt,
  });
  try {
    const booking = await newBooking.save();
    res.status(200).json(booking);
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
    console.log("Error: ", error);
  }
};

// Add New User Booking Function
export const UserBooking = async (req, res) => {
  try {

    // Get The Booking Type
    const Booking_type = req.query.Booking_type;

    // Make Booking According To Booking Type
    if (Booking_type === 'hotel') {

      // Validate Booking Data And Deconstruct It
      const data = validateBooking(req);
      const { hotelId, room, checkIn, checkOut } = data;

      // Check If Booking Already Exists Or Not
      const exists = await booking.findOne({
        hotelId,
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn },
        "room.RoomId": { $in: room.map(r => r.RoomId) },
        "room.Room_no": { $in: room.map(r => r.Room_no) },
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


    }
    else if (Booking_type === 'hotelandparking') {

      // Validate Booking Data And Deconstruct It
      const data = validateBooking(req);
      const { hotelId, room, checkIn, checkOut } = data;

      // Check If Booking Already Exists Or Not
      const exists = await booking.findOne({
        hotelId,
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn },
        "room.RoomId": { $in: room.map(r => r.RoomId) },
        "room.Room_no": { $in: room.map(r => r.Room_no) },
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

    }
    else if (Booking_type === 'parking') {

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
