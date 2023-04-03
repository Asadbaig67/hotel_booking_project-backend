import ResetPasswordOtp from "../models/resetPassword_otp.js";
import User from '../models/user.js';
import fetch from 'node-fetch';


// Reset Password Function
export const SendResetOtp = async (req, res) => {

    // Get the email and otp from the request body
    const { email } = req.body;

    // Check if the email is present in the User database
    // const user = User.findOne(email);
    // if (!user) return res.status(400).json({ error: "Email not found" });

    // Check if the email is present in the ResetPasswordOtp database
    // const userRecord = ResetPasswordOtp.findOne(email);

    const otp = Math.floor(Math.random() * 900000) + 100000;

    // Create new passwordreset document
    const newUserPassOtp = new ResetPasswordOtp({
        email: email,
        otp: otp,
    });
    // Save the new passwordreset document
    const newUser = await newUserPassOtp.save();
    // Send the otp to the email

    let url = `http://localhost:5000/mail/otpverification`
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

    return res.status(200).json({ message: "OTP sent to your email", user: newUser });

}

export const OtpVerify = async (req, res) => {

    const { email, otp } = req.body;
    // Find the user in the ResetPasswordOtp database
    const userauth = await ResetPasswordOtp.findOne({ email: email });
    // Check if the user exists ,If not exists it means the otp is expired
    if (!userauth) return res.status(400).json({ error: "OTP Expired! Please Retry" });
    // Check if the otp is correct
    if (userauth.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    // Return Success Message
    return res.status(200).json({ message: "OTP Verified Successfully" });


}


export const ResetPassword = async (req, res) => {


    const { email, newpassword, cnewpassword } = req.body;

    // Find the user in the ResetPasswordOtp database
    const userauth = await ResetPasswordOtp.findOne({ email: email });
    // Check if the user exists ,If not exists it means the otp is expired
    if (!userauth) return res.status(400).json({ error: "OTP Expired! Please Retry" });
    // Desctructure the request body

    // Check if the new password and confirm password are same
    if (newpassword !== cnewpassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    // Find the user in the User database
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ error: "Email not found" });
    // Change the password
    user.password = newpassword;
    user.c_password = newpassword;
    // Save the changes
    const savedChanges = await user.save();
    if (!savedChanges) return res.status(500).json({ error: "Internal Server Error" });

    // Return Success Message
    return res.status(200).json({ message: "Password Changed Successfully" });


}
