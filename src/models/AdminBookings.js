import mongoose from "mongoose";

const AdminBookingsSchema = new mongoose.Schema({

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
  },
  hotelAndParkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HotelAndParking",
  },
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parking",
  },
  booking_type: {
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
      type: String,
    },
  },
  persons: {
    adults: {
      type: Number,
    },
    childrens: {
      type: Number,
    },

  },
  dates: {
    check_in: {
      type: String,
    },
    check_out: {
      type: String,
    },
  },
  booked_rooms: [
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
  Total_Vehicles: {
    type: Number,
  },
  total_price: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const AdminBookings = mongoose.model("AdminBooking", AdminBookingsSchema);

export default AdminBookings;