import express from "express";
const Router = express.Router();
import { addEmail, getAllEmails } from '../controller/newsletterEmail.js';
// import { addEmail, getAllEmails } from "../controller/NewsletterEmail.js";

// Send Email
Router.post("/subscribe", addEmail);

// Email Verification
Router.get('/emailverification', getAllEmails);


export default Router;


