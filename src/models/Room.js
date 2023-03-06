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
  description: {
    type: String,
    required: true,
  },
  photos: [
    {
      type: String,
    },
  ],
  room_no: [{ number: Number, unavailableDates: { type: [Date] } }],
});

// createing a new collection
const Room = mongoose.model("Room", roomschema);

// export this module
// module.exports = Room;

export default Room;
