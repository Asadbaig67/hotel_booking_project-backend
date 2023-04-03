import mongoose from "mongoose";

const resetPasswordOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
    },
});

const ResetPasswordOtp = mongoose.model("ResetPasswordOtp", resetPasswordOtpSchema);

export default ResetPasswordOtp;