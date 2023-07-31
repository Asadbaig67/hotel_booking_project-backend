import mongoose from "mongoose";

const AdminBookingsSchema = new mongoose.Schema({

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
  },
  HotelAndParkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HotelAndParking",
  },
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parking",
  },
  Booking_type: {
    type: String,
  },
  user_info: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone_number: {
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
  parking_info: {
    parking_name: {
      type: String,
    },
    vehicles_info: {
      type: Object,
    },
    booked_slots: {
      type: Number,
    },
  },
  parking: {
    Total_slots: {
      type: Number,
    },
    Parking_price: {
      type: Number,
    },
  },
  Total_Vehicles: {
    type: Number,
  },
  total_price: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  canceled: {
    type: Boolean,
    default: false,
  },
  bookedBy:{
    type: String,
    default: "User",
  }
});

const AdminBookings = mongoose.model("AdminBooking", AdminBookingsSchema);

export default AdminBookings;