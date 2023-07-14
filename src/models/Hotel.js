import mongoose from "mongoose";

// creating a schema
const hotelschema = new mongoose.Schema({
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
  rating: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  photos: [
    {
      type: String,
    },
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
  Facilities: [
    {
      type: String,
    },
  ],
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  approved: {
    type: Boolean,
    default: false,
  },
  ownerAvailablity: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
  },
  deList: {
    type: Boolean,
    default: false,
  },
});

// createing a new collection
const Hotel = mongoose.model("Hotel", hotelschema);

export default Hotel;
