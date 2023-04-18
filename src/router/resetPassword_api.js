import express from 'express';

import { SendResetOtp, ResetPassword, OtpVerify } from '../controller/resetPassword.js';


const Router = express.Router();

// Send Otp To The Given Email
Router.post('/sendotp', SendResetOtp);
// Verify The Otp
Router.get('/verifyotp', OtpVerify);

Router.post('/resetpassword', ResetPassword)

export default Router;