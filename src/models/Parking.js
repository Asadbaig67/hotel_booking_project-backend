import mongoose from "mongoose";

// creating a schema
const parkingschema = new mongoose.Schema({
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
const Parking = mongoose.model("Parking", parkingschema);

// export this module
// module.exports = Parking;

export default Parking;
