import passport from "passport";
import bcryptjs from "bcryptjs";

// For Google Authentication
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// For Sign Up And Login Of User
import { Strategy as LocalStrategy } from "passport-local";

import User from "./models/user.js";
import dotenv from "dotenv";
dotenv.config({ path: "./src/config/config.env" });

export const passportGoogleSetup = (clientID, clientSecret) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/user/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        // To Store User In DataBase
        console.log("Profile =", profile);
        const user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        } else {
          const newUser = new User({
            firstName: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });
          await newUser.save();
          return done(null, newUser);
        }
      }
    )
  );

  // In Case To Store In DataBase
  passport.serializeUser((profile, done) => {
    console.log("Profile in serialize User =", profile);
    done(null, profile.googleId);
  });
  passport.deserializeUser(async (googleId, done) => {
    console.log("ID Is", googleId);
    const user = await User.findOne({ googleId });
    console.log("User =", user);
    done(null, user);
  });
};

export const passportLocalSetup = () => {
  // Local Strategy Middleware
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Find User In DataBase
          const user = await User.findOne({ email: email });
          // Check If User Exists
          if (!user) {
            return done(null, false, { message: "User not found" });
          }
          // Check If Password Is Correct
          let result = await bcryptjs.compare(password, user.password);

          // If Password Is Wrong
          if (!result) {
            return done(null, false, { message: "Wrong Password" });
          }

          return done(null, user, { message: "Login Success" });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Storing User In Session
  passport.serializeUser((user, done) => {
    // Stores User Id In The Session
    done(null, user.id);
  });
  // Getting User From Session And Storing In req.user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });
};
