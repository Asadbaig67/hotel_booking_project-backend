import mongoose from "mongoose";

// creating a schema
const hotelschema = new mongoose.Schema({
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
      pic_url: {
        type: String,
        required: true,
      },
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
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
});

// createing a new collection
const Hotel = mongoose.model("Hotel", hotelschema);

// export this module
// module.exports = Hotel;

export default Hotel;
