import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from "./models/user.js";
import dotenv from "dotenv";
dotenv.config({ path: "./src/config/config.env" });


export const passportSetup = (clientID, clientSecret) => {
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



