import mongoose from "mongoose";

// creating a schema
const roomschema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  reserve_date_start: {
    type: Date,
  },
  reserve_date_end: {
    type: Date,
  },
  available: {
    type: Boolean,
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
  room_no: [{ number: Number, unavailableDates: { type: [Date] } }],
});

// createing a new collection
const Room = mongoose.model("Room", roomschema);

// export this module
// module.exports = Room;

export default Room;
