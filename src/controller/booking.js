import booking from "../models/booking.js";
import fetch from "node-fetch";

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

      // Booking for Hotel
      let { userId, hotelId, room, checkIn, checkOut, price } = req.query;

      // Parse the Room and Price Data
      room = JSON.parse(room);
      price = JSON.parse(price);
      // Convert CheckIn and CheckOut to Date
      checkIn = new Date(checkIn);
      checkOut = new Date(checkOut);
      const createdAt = Date.now();

      // Check If All Fields Are Filled
      if (!userId || !hotelId || !room || !checkIn || !checkOut || !price) {
        return res.status(400).json({ msg: "Please enter all fields, All Fields are required" });
      }

      // Check If Booking Already Exists
      const exists = await Promise.all(room.map(async (Room) => {
        return await booking.findOne({ room: { $elemMatch: { RoomId: Room.RoomId, Room_no: Room.Room_no } }, checkIn, checkOut });
      }));
      if (exists.some((result) => result)) {
        return res.status(400).json({ msg: "Booking already exists" });
      }

      // Make New Booking document and save
      const newBooking = new booking({
        Booking_type,
        userId,
        hotelId,
        room,
        checkIn,
        checkOut,
        price,
        createdAt,
      });

      // If Booking successfull save it 
      const booking_success = await newBooking.save();

      // if booking not successfull send error
      if (!booking_success) {
        return res.status(400).json({ msg: "Booking Failed" });
      }

      // If Booking Sucessfull them make put request to update the reserved room in room collection
      const result = await Promise.all(room.map(async (Room) => {
        console.log(`Updating room ${Room.RoomId} Room No ${Room.Room_no} unavailable dates${[checkIn, checkOut]}`);
        await fetch(`http://localhost:5000/room/updateunavailabledates/${Room.RoomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            number: Room.Room_no,
            unavailableDates: [checkIn, checkOut]
          })
        });
      }));

      if (!result) {
        return res.status(400).json({ msg: "Booking -- Failed" });
      }
      else {
        res.status(200).json({ msg: "Booking -- Success" });
      }

    }
    else if (Booking_type === 'hotelandparking') {

      // Booking for Hotel and Parking
      const { userId, hotelId, room, checkIn, checkOut, price, parkingDetails } = req.query;
      const createdAt = Date.now();
      if (!userId || !hotelId || !room || !checkIn || !checkOut || !price || !parkingDetails) {
        return res.status(400).json({ msg: "Please enter all fields" });
      }

      // Check if Booking already exists or not
      const exist = await booking.findOne({
        $or: [room, checkIn, checkOut],
      });
      if (exist) {
        return res.status(400).json({ msg: "Sorry Booking already exists" });
      }

      // Make New Booking document and save
      const newBooking = new booking({
        Booking_type,
        userId,
        hotelId,
        room,
        checkIn,
        checkOut,
        price,
        parkingDetails,
        createdAt,
      });

      // If Booking successfull save it
      const booking_success = await newBooking.save();

      // if booking not successfull send error
      if (!booking_success) {
        return res.status(400).json({ msg: "Booking Failed" });
      } else {

        // If Booking Successfull Add Reserved Room Details in Room Collection
        await Promise.all(room.map(async (room) => {
          await room.updateOne({ $push: { reserved: { userId, checkIn, checkOut } } });
        }));


        return res.status(200).json({ msg: "Booking Successfull" });
      }


    }
    else if (Booking_type === 'parking') {
      // Booking For Parking
      const { userId, parkingId, checkIn, checkOut, parkingDetails } = req.query;
      const createdAt = Date.now();
      if (!userId || !parkingId || !checkIn || !checkOut || !price) {
        return res.status(400).json({ msg: "Please enter all fields" });
      }

      //Check If Parking Booking Already Exists
      const exist = await booking.findOne({
        $or: [parkingId, checkIn, checkOut],
      });
      if (exist) {
        return res.status(400).json({ msg: "Sorry Booking already exists" });
      }

      // Make New Booking document and save
      const newBooking = new booking({
        Booking_type,
        userId,
        parkingId,
        checkIn,
        checkOut,
        parkingDetails,
        createdAt,
      });


      // If Booking successfull save it
      const booking = await newBooking.save();
      // if booking not successfull send error
      if (!booking) {
        return res.status(400).json({ msg: "Booking Failed" });
      } else {




        return res.status(200).json({ msg: "Booking Successfull" });
      }
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
