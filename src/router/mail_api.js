import express from "express";
import { sendmail, sendotp,sendVerificationmail } from "../controller/mailer.js";
const Router = express.Router();


// Send Email
Router.post("/sendmail", sendmail);

// Email Verification
Router.post('/emailverification', sendVerificationmail);


// Password Change Verification
Router.post('/otpverification', sendotp);

// News letter by admin




export default Router;
