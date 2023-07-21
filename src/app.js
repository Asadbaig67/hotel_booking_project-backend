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
import AdminBookings from "./router/AdminBookings.js";
import mail from "./router/mail_api.js";
import resetPassword from "./router/resetPassword_api.js";
import verifyEmail from "./router/emailVerification.js";
import OperatingCities from "./router/operatingCities.js";
import Notification from "./router/notifications.js";
import cors from "cors";
import expressSession from "express-session";
import path from "path";
import fileUpload from "express-fileupload";
import Newsletteremail from "./router/newsletterEmail.js";
import Contact from './router/Contact.js'
import passport from "passport";
import { passportGoogleSetup, passportLocalSetup } from "./passport.js";

import bodyParser from "body-parser";
dotenv.config({ path: "./src/config/config.env" });
const db = process.env.DATABASE;

connect(db);
const app = express();

// Google Passport Function Call
passportGoogleSetup();
// Local Passport Function Call
passportLocalSetup();

// Express Session
app.use(
  expressSession({
    secret: "somethingsecretgoeshere",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true when secured connection
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());


// Location of static files
const hotelimagesLocation = path.join(
  process.cwd(),
  "/src/uploads",
  "HotelImages"
);
const parkingLocation = path.join(
  process.cwd(),
  "/src/uploads",
  "ParkingImages"
);
const hoteli_parking_Location = path.join(
  process.cwd(),
  "/src/uploads",
  "Hotel_Parking_Images"
);
const user_profile_Location = path.join(
  process.cwd(),
  "/src/uploads",
  "User_Profile_Images"
);

// To access static files
app.use("/uploads/HotelImages", express.static(hotelimagesLocation));
app.use("/uploads/ParkingImages", express.static(parkingLocation));
app.use(
  "/uploads/Hotel_Parking_Images",
  express.static(hoteli_parking_Location)
);
app.use("/uploads/User_Profile_Images", express.static(user_profile_Location));



// To parse cookies
app.use(cookieParser());

const port = process.env.PORT;

// To parse json data
app.use(express.json());

// To avoid cors error
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// app.use(cors());
app.use(bodyParser.json());

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
app.use("/mail", mail);
app.use("/otp", resetPassword);
app.use("/email", verifyEmail);
app.use("/OperatingProperty", OperatingCities);
app.use("/notification", Notification);
app.use("/newsletter", Newsletteremail);
app.use("/contact", Contact);
app.use("/adminbookings", AdminBookings);

// To listen to port
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
