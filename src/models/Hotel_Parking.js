import mongoose from "mongoose";

// creating a schema
const HotelandParkingschema = new mongoose.Schema({
  hotel_name: {
    type: String,
    required: true,
  },
  hotel_title: {
    type: String,
    required: true,
  },
  hotel_rating: {
    type: Number,
    required: true,
  },
  hotel_description: {
    type: String,
    required: true,
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  hotel_city: {
    type: String,
    required: true,
  },
  hotel_country: {
    type: String,
    required: true,
  },
  hotel_address: {
    type: String,
    required: true,
  },
  hotel_photos: [
    {
      type: String,
    },
  ],
  parking_name: {
    type: String,
    required: true,
  },
  parking_title: {
    type: String,
    required: true,
  },
  total_slots: {
    type: Number,
    required: true,
  },
  booked_slots: {
    type: Number,
    required: true,
    default: 0,
  },
  parking_description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  parking_photos: [
    {
      type: String,
    },
  ],
  approved: {
    type: Boolean,
    default: false,
  },
});

// createing a new collection
const HotelandParking = mongoose.model(
  "Hotel And Parking",
  HotelandParkingschema
);

// export this module
export default HotelandParking;
