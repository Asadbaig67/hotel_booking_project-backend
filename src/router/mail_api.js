import express from "express";
// import { addHotel, getAllHotels, getHotelByCity,updateHotel,deleteHotel } from "../controller/hotel.js";
import { sendmail, sendotp } from "../controller/mailer.js";
const Router = express.Router();


// Send Email
Router.post("/sendmail", sendmail);
// Email Verification


// Password Change Verification
Router.post('/otpverification', sendotp);

// News letter by admin




export default Router;
