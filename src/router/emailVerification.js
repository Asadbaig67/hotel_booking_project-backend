import express from 'express';

import { SendVerificationEmail, Emailverify } from '../controller/emailVerification.js';


const Router = express.Router();

// Send Verification Email To User
Router.post('/sendverifyemail', SendVerificationEmail);

// Verify The Email Through The Link
Router.get('/verify', Emailverify);


export default Router;