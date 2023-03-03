import booking from "../models/booking.js";

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

export const getBooking = async (req, res) => {
  try {
    const bookings = await booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.log("Error: ", error);
  }
};

export const getBookingById = async (req, res) => {
  try {
    const bookingById = await booking.findById(req.params.id);
    res.status(200).json(bookingById);
  } catch (error) {
    console.log("Error: ", error);
  }
};

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

export const deleteBooking = async (req, res) => {
  try {
    const bookingById = await booking.findByIdAndDelete(req.params.id);
    res.status(200).json(bookingById);
  } catch (error) {
    console.log("Error: ", error);
  }
};
