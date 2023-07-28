import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema({
  Booking_type: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
  },
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parking",
  },
  HotelAndParkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HotelAndParking",
  },
  room: [
    {
      Room_type: {
        type: String,
      },
      RoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
      Room_no: {
        type: Number,
      },
      Room_price: {
        type: Number,
      },
    },
  ],
  canceled: {
    type: Boolean,
    default: false,
  },
  parking: {
    Total_slots: {
      type: Number,
    },
    Parking_price: {
      type: Number,
    },
  },
  persons: {
    adults: {
      type: Number,
    },
    children: {
      type: Number,
    },
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bookedBy: {
    type: String,
    default: "User",
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const booking = mongoose.model("Booking", BookingSchema);
export default booking;
