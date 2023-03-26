import express from "express";
import passport from "passport";
import dotenv from "dotenv";

import { getAll, login, registration, updateAccount, deleteAccount, loginSuccess, loginFailed, logout } from "../controller/auth.js";
import { authorization } from "../middleware/authentication.js";
import { googleAuthenticate, googleAuthenticateCallback } from "../middleware/google_auth.js";

dotenv.config({ path: "../config/config.env" });


const Router = express.Router();


// Add User Function
Router.post("/registeration", registration);

// Get All Users
Router.get("/getall", getAll);

// Login Apis
Router.post("/login", login);

// Protected Test Route
Router.get("/protected", authorization, (req, res) => {
  res.json({ user: { id: req.userId } });
});

// Update User
Router.patch('/update/:id', updateAccount);

// Delete User
Router.delete('/delete/:id', deleteAccount);

// Auth Login For Debugging Login Success Api
Router.get('/login', loginSuccess);

// Google Authentication Apis Second CallBack Link To Be Visited
Router.get("/google/callback", passport.authenticate("google",
  { successRedirect: process.env.CLIENT_URL, failureRedirect: '/login/failed' }));
// Router.get("/google/callback", googleAuthenticateCallback);

// Login Faliure Api
Router.get("/login/failed", loginFailed);


// Google Authentication First Link To Be Visited
Router.get("/google", passport.authenticate("google", { scope: ['profile', 'email'] }));
// Router.get("/google", googleAuthenticate);

// Logout Api
Router.get('/logout', logout);



export default Router;
