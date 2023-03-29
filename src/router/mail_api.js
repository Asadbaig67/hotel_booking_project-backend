import express from "express";
// import { addHotel, getAllHotels, getHotelByCity,updateHotel,deleteHotel } from "../controller/hotel.js";
import { sendmail } from "../controller/mailer.js";
const Router = express.Router();


// Send Email
Router.post("/sendmail", sendmail);
// Email Verification

// Password Change Verification

// News letter by admin




export default Router;
