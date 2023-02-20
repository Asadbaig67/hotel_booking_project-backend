import mongoose from "mongoose";

// const mongoose = require('mongoose');

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
    required: true,
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
  area: {
    type: String,
    required: true,
  },
});

// createing a new collection
const Hotel = mongoose.model("Hotel", hotelschema);

// export this module
// module.exports = Hotel;

export default Hotel;
