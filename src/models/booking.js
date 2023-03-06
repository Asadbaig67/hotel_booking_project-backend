import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"USER",
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Hotel",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Room",
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
