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
  roomId: [
    {
      RoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
      Roon_no: {
        type: Number,
      },
    }
  ],
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parking",
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  parkingDetails: {

    parkingName: {
      type: String,
    },
    no_of_vehicles: {
      type: Number,
    },
    total_price: {
      type: Number,
    },

  },
  price: [
    {
      Roon_no: {
        type: Number,
      },
      Price: {
        type: Number,
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const booking = mongoose.model("Booking", BookingSchema);
export default booking;
