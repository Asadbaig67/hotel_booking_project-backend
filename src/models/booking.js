import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  hotelId: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const booking = mongoose.model("Booking", BookingSchema);
export default booking;
