import booking from "../models/booking.js";

// Add Booking Function
export const addBooking = async (req, res) => {
  const { userId, hotelId, roomId, checkIn, checkOut, price } = req.body;
  const createdAt = Date.now();
  if (!userId || !hotelId || !roomId || !checkIn || !checkOut || !price) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  const exist = await booking.findOne({
    roomId,
    checkIn,
    checkOut,
  });
  if (exist) {
    return res.status(400).json({ msg: "Booking already exists" });
  }
  const newBooking = new booking({
    userId,
    hotelId,
    roomId,
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
      const { userId, hotelId, roomId, checkIn, checkOut, price } = req.query;
      const createdAt = Date.now();
      if (!userId || !hotelId || !roomId || !checkIn || !checkOut || !price) {
        return res.status(400).json({ msg: "Please enter all fields, All Fields are required" });
      }

      // Check if Booking already exists or not
      const exist = await booking.findOne({
        roomId,
        checkIn,
        checkOut,
      });
      if (exist) {
        return res.status(400).json({ msg: "Sorry Booking already exists" });
      }

      // Make New Booking document and save
      const newBooking = new booking({
        Booking_type,
        userId,
        hotelId,
        roomId,
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
      } else {

        // If Booking Successfull Add Reserved Room Details in Room Collection
        await Promise.all(roomId.map(async (room) => {
          await room.updateOne({ $push: { reserved: { userId, checkIn, checkOut } } });
        }));


        return res.status(200).json({ msg: "Booking Successfull" });
      }

    }
    else if (Booking_type === 'hotelandparking') {

      // Booking for Hotel and Parking
      const { userId, hotelId, roomId, checkIn, checkOut, price, parkingDetails } = req.query;
      const createdAt = Date.now();
      if (!userId || !hotelId || !roomId || !checkIn || !checkOut || !price || !parkingDetails) {
        return res.status(400).json({ msg: "Please enter all fields" });
      }

      // Check if Booking already exists or not
      const exist = await booking.findOne({
        $or: [roomId, checkIn, checkOut],
      });
      if (exist) {
        return res.status(400).json({ msg: "Sorry Booking already exists" });
      }

      // Make New Booking document and save
      const newBooking = new booking({
        Booking_type,
        userId,
        hotelId,
        roomId,
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
        await Promise.all(roomId.map(async (room) => {
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

        // If Booking Successfull Add Reserved Room Details in Room Collection
        await Promise.all(roomId.map(async (room) => {
          await room.updateOne({ $push: { reserved: { userId, checkIn, checkOut } } });
        }));

        return res.status(200).json({ msg: "Booking Successfull" });
      }
    }


  } catch (error) {
    console.log("Error: ", error);
  }

};
// Update Booking 
export const updateBooking = async (req, res) => {
  const { userId, hotelId, roomId, checkIn, checkOut, price } = req.body;
  try {
    const update = {
      userId,
      hotelId,
      roomId,
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
