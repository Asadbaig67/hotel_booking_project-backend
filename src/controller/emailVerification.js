import Emailverification from "../models/emailVerification.js";
import User from '../models/user.js';
import fetch from 'node-fetch';
import QueryString from "qs";


// Send Verification Email To Users Email
export const SendVerificationEmail = async (req, res) => {

    // Get the email from the request body
    const { email } = req.body;

    // Check if the email is present in the ResetPasswordOtp database

    const otp = Math.floor(Math.random() * 900000) + 100000;

    // Create new passwordreset document
    const newUser = new Emailverification({
        email: email,
        otp: otp,
    });

    // Save the new passwordreset document
    const user = await newUser.save();
    // Send the otp to the email

    let url = `http://localhost:5000/mail/emailverification`
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            otp: otp
        })
    }
    const sent = await fetch(url, options);
    if (!sent) {
        return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Email Verification Link Sent To Your Email" });

}

// Verify Email From The Link Fucntion
export const Emailverify = async (req, res) => {

    // Get the email and otp from the request query
    const verifyemail = req.query.verifyemail;
    const decodedObj = QueryString.parse(decodeURIComponent(verifyemail));

    // Destructuring the decoded object
    // const { email, otp } = decodedObj;
    const { email, otp, firstName, lastName, account_type, password } = decodedObj;

    // Find the user in the ResetPasswordOtp database
    const userVerify = await Emailverification.findOne({ email: email });
    // Check if the user exists ,If not exists it means the otp is expired
    if (!userVerify) return res.status(400).json({ error: "OTP Expired! Please Retry" });
    // Check if the otp is correct
    if (userVerify.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    // Converting account type to lowercase
    const accountType = account_type.toLowerCase();
    // creating new user
    const new_user = new User({
        firstName,
        lastName,
        email,
        account_type: accountType,
        password
    });

    // saving new user
    const result = await new_user.save();

    // // checking if user is saved
    // if (result) {
    //     res.status(201).json({ message: "User Created successfully" });
    // } else {
    //     res.status(500).json({ message: "User Registration Failed" });
    // }

    // Return Success Message
    return res.redirect("http://localhost:3000/signin");

}
