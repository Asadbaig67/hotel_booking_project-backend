import mongoose from "mongoose";
mongoose.set("strictQuery", false);

const connect = async (db) => {
  try {
    const result = await mongoose.connect(db);
    if (result) {
      console.log("Connected to db");
    }
  } catch (error) {
    console.log(error, "Not connected");
  }
};

export default connect;
