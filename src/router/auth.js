import express from "express";
import passport from "passport";
import dotenv from "dotenv";

import {
  getAll,
  login,
  registration,
  updateAccount,
  deleteAccount,
  loginSuccess,
  loginFailed,
  logout,
  getuserbyid,
  updateAccountPassword,
  getUserIdAndname,
  updateAccountNew
} from "../controller/auth.js";
import { authorization } from "../middleware/authentication.js";
import {
  googleAuthenticate,
  googleAuthenticateCallback,
} from "../middleware/google_auth.js";

dotenv.config({ path: "../config/config.env" });

const Router = express.Router();

// Add User Function
Router.post("/registeration", registration);

// Get All Users
Router.get("/getall", getAll);

// Get User Ids and Name
Router.get("/getuseridandname", getUserIdAndname);

//Get user by id
Router.get("/getuserbyid/:id", getuserbyid);

// Login Apis
Router.post(
  "/userlogin",
  passport.authenticate("local", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/userlogin",
  }),
  (req, res) => {
    if (req.isAuthenticated()) {
      res.status(200).json({ message: "Login Success", user: req.user });
    } else {
      res.status(401).json({ message: "User not authenticated" });
    }
  }
);

Router.get("/userlogout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      // handle error
      console.error(err);
      return res
        .status(500)
        .json({ message: "An error occurred during logout" });
    }
    // logout success
    res.status(200).json({ message: "User Logout Successful" });
  });
});

// Protected Test Route
Router.get("/protected", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ message: "Protected", user: req.user });
  } else {
    res.status(400).json({ message: "Failure" });
  }
});

// Update User
Router.patch("/update/:id", updateAccount);

//Update password
Router.put("/updatepassword/:id", updateAccountPassword);

//Update user
Router.put("/updateuser", updateAccountNew);

// Delete User
Router.delete("/delete/:id", deleteAccount);

// Auth Login For Debugging Login Success Api
Router.get("/login", loginSuccess);

// Google Authentication Apis Second CallBack Link To Be Visited
Router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/signin",
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    res.status(200).json({ message: "Login Success", user: req.user });
  }

);
// Router.get("/google/callback", googleAuthenticateCallback);

Router.get('/auth/example', function (req, res, next) {
  passport.authenticate('google', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('http://localhost:3000/signin'); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      // Send the user ID to the client
      return res.json({ id: user.id });
    });
  })(req, res, next);
});

// Login Faliure Api
Router.get("/login/failed", loginFailed);

// Google Authentication First Link To Be Visited
Router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }
  ));
// Router.get("/google", googleAuthenticate);

// Logout Api
Router.get("/logout", logout);

export default Router;
