const mongoose = require("mongoose");
// To avoid deprication warning
mongoose.set("strictQuery", false);

const Connection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("Connected to db");
  } catch (error) {
    console.log(error);
  }
};

module.exports = Connection;
