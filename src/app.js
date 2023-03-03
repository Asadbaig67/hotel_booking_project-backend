import express from "express";
import dotenv from "dotenv";
import connect from "./db/connection.js";
import cookieParser from "cookie-parser";
import user from "./router/auth.js";
import Hotel from "./router/hotel_api.js";
import Parking from "./router/parking_api.js";
import Room from "./router/room_api.js";
import HotelandParking from "./router/hotelandparking_api.js";
import booking from "./router/booking_api.js";
import cors from "cors";
dotenv.config({ path: "./src/config/config.env" });
const db = process.env.DATABASE;
connect(db);
const app = express();

// To parse cookies
app.use(cookieParser());

const port = process.env.PORT;

// To parse json data
app.use(express.json());

// To avoid cors error
app.use(cors());

// To access static files
app.get("/", (req, res) => {
  res.send("This is server");
});

// To access private routes
app.use("/user", user);
app.use("/hotels", Hotel);
app.use("/parking", Parking);
app.use("/room", Room);
app.use("/hotelandparking", HotelandParking);
app.use("/booking", booking);

// To listen to port
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
