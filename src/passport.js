import passport from 'passport';
import bcryptjs from "bcryptjs";

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';

import User from "./models/user.js";
import dotenv from "dotenv";
dotenv.config({ path: "./src/config/config.env" });


export const passportGoogleSetup = (clientID, clientSecret) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/user/google/callback',
        scope: ["profile", "email"]
    }, async (accessToken, refreshToken, profile, done) => {
        // This function will be called when the user is authenticated
        // You can perform additional actions here, like storing the user in a database

        //Not Stores User In DataBase
        done(null, profile);


        // To Store User In DataBase
        // const user = await User.findOne({ googleId: profile.id });
        // if (user) {
        //     return done(null, user);
        // }
        // else {
        //     const newUser = new User({
        //         firstName: profile.displayName,
        //         email: profile.emails[0].value,
        //         googleId: profile.id
        //     });
        //     await newUser.save();
        //     return done(null, newUser);
        // }
    }));


    // In Case To Store In DataBase
    // passport.serializeUser((profile, done) => {
    //     // This function will be called when the user is authenticated
    //     // You can perform additional actions here, like storing the user in a database
    //     done(null, profile.id);
    // });
    // passport.deserializeUser(async (id, done) => {
    //     // This function will be called when the user is authenticated
    //     // You can perform additional actions here, like storing the user in a database

    //     const user = await User.findOne({ googleId: id });
    //     done(null, user);
    // });

    // Not Store In Database
    passport.serializeUser((user, done) => {
        // This function will be called when the user is authenticated
        // You can perform additional actions here, like storing the user in a database
        done(null, user);
    });
    passport.deserializeUser(async (userObj, done) => {
        // Stores User In The Session
        // This function will be called when the user is authenticated
        // You can perform additional actions here, like storing the user in a database

        done(null, userObj);
    });
}

export const passportLocalSetup = () => {
    // Local Strategy Middleware
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            // Find User In DataBase
            const user = await User.findOne({ email: email });
            // Check If User Exists
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }
            // Check If Password Is Correct
            let result = await bcryptjs.compare(password, user.password);

            // If Password Is Wrong
            if (!result) {
                return done(null, false, { message: 'Wrong Password' });
            }

            return done(null, user, { message: 'Login Success' });
        } catch (error) {
            return done(error, false);

        }
    }));


    // Storing User In Session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Getting User From Session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);

        } catch (error) {
            done(error, false);

        }
    });
}



