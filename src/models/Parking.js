import mongoose from "mongoose";

// creating a schema
const parkingschema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  title: {
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
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  photos: [
    {
      type: String,
      required: true,
    },
  ],
  Facilities: [
    {
      type: String,
    }
  ],
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

// createing a new collection
const Parking = mongoose.model("Parking", parkingschema);


export default Parking;
