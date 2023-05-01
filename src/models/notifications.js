import mongoose from "mongoose";

// creating a schema
const notificationschema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    // required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

// createing a new collection
const Notification = mongoose.model("Notification", notificationschema);
export default Notification;
