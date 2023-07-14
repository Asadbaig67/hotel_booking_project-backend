import bcryptjs from "bcryptjs";
import User from "../models/user.js";
import Emailverification from "../models/emailVerification.js";

import { sendVerificationmail } from "./mailer.js";
import { SendEmail } from '../Functions/Emails/SendEmail.js'
import { fileURLToPath } from "url";
import path from "path";
import { createNotificationProperty } from "../Functions/Notification/createNotification.js";

// User Registration Function
export const registration = async (req, res) => {
  try {
    // Deconstructing the request body
    let { firstName, lastName, email, account_type, password, c_password } =
      req.body;

    // Checking if all fields are filled
    if (
      !firstName ||
      !lastName ||
      !email ||
      !account_type ||
      !password ||
      !c_password
    ) {
      return res.status(500).json({ error: "All fields are required!" });
    }
    console.log(password, c_password);

    // Checking if password and confirm password are same
    if (password !== c_password) {
      return res.status(500).json({ error: "Passwords do not match" });
    }


    // Checking if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(422).json({ error: "User already exists" });
    }

    const otp = Math.floor(Math.random() * 900000) + 100000;

    // check if the email is present in the database of email verification
    const useremail = await Emailverification.findOne({ email: email });

    if (useremail) {
      return res.status(422).json({ error: "Email Already Exists" });
    }

    // Create new passwordreset document
    const newUser = new Emailverification({
      email: email,
      otp: otp,
    });


    // Save the new passwordreset document
    await newUser.save();

    // Send the otp to the email
    const sent = await sendVerificationmail(
      email,
      otp,
      firstName,
      lastName,
      password,
      account_type
    );

    if (!sent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Verification Email Sent" });

  } catch (error) {
    console.log(error);
  }
};

// Get All Users Function
export const getAll = async (req, res) => {
  let result = await User.find();
  res.send(result);
};

// Get All Users According To Account Type Function
export const getAllUser = async (req, res) => {
  let { account_type } = req.params;
  account_type.toLowerCase();
  let result = await User.find({ account_type });
  res.send(result);
};

// Get User By Id Function
export const getuserbyid = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await User.findById(id);
    res.json({ message: "User found", user: result });
  } catch (error) {
    res.json("User not found");
  }
};

// Login Function
export const login = async (req, res) => {
  // Deconstructing the request body
  const { email, password } = req.body;

  // Checking if user exists or not
  const exists = await User.findOne({ email });

  // generating error if user does not exists
  if (!exists) {
    return res.status(500).json({ error: "User Doesn't exist" });
  }

  // comparing password
  let result = await bcryptjs.compare(password, exists.password);

  // If passwords do not match generating error
  if (!result) {
    return res.status(500).json({ error: " Wrong Credentials" });
  } else {
    let token = await exists.generatetoken();
    if (token) {
      res
        .cookie("tokens", token, {
          maxAge: 1000 * 60 * 60 * 24, // 1 day
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
        })
        .status(201)
        .json({ message: "Login Success", type: exists.account_type });
    }
  }
};

// Update Account Function
export const updateAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const newuser = await User.findById(userId);

    // Finding user by ID and updating their information
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // createNotificationProperty(
    //   "User",
    //   "User updated",
    //   "Your account updated",
    //   Date.now(),
    //   user._id
    // );

    await SendEmail({
      name: newuser.firstName + " " + user.lastName,
      email: newuser.email,
      subject: "Account Updated",
      message: "Your account updated",
    });

    createNotificationProperty(
      "User",
      "Account updated",
      "Your account is updated successfully",
      Date.now(),
      user._id
    );
    res.status(200).json({ message: "User updated successfully", user });



  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Updayte Accout New function
export const updateAccountNew = async (req, res) => {
  try {

    let photo = "";
    let fileName = "";
    const { image } = req.files || {};
    if (image) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const imageDirectory = path.join(__dirname, '..', 'uploads', 'User_Profile_Images');

      fileName = image.name.replace(/\s+/g, '');
      const filePath = path.join(imageDirectory, fileName);
      // const filePath = path.join(imageDirectory, `${Date.now()}_${fileName}`);

      try {
        await image.mv(filePath);
        const baseUrlHotel = "http://46.32.232.208:5000";
        photo = `${baseUrlHotel}/uploads/User_Profile_Images/${fileName}`
        // Do something with the photo URL
      } catch (error) {
        console.log(error);
      }
    }

    const {
      id,
      firstName,
      lastName,
      email
    } = req.body;

    if (
      !id ||
      !firstName ||
      !lastName ||
      !email
    ) {
      return res.status(500).json({ error: "All fields are required! " });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        ...(photo && { photo }),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });

  } catch (error) {
    console.log(error);
  }
};

//Update Account Password Function
export const updateAccountPassword = async (req, res) => {
  const userId = req.params.id;
  const { password, newPassword, confirmNewPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passCheck = await bcryptjs.compare(password, user.password);
    const prevCheck = await bcryptjs.compare(newPassword, user.password);
    if (prevCheck) {
      return res
        .status(400)
        .json({ message: "New Password cannot be same as old password" });
    }
    if (!passCheck) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    // Change the password
    user.password = newPassword;
    user.c_password = newPassword;
    // Save the changes
    createNotificationProperty(
      "User",
      "Password changed",
      "Your Password is changed",
      Date.now(),
      user._id
    );

    await SendEmail({
      name: user.firstName + " " + user.lastName,
      email: user.email,
      subject: "Password Updated",
      message: "Your password updated",
    });

    res.json({ message: "Password Updated Successfully" });
  } catch (error) {
    res.status(502).json({ message: "error" });
  }
};

// Delete Account Function
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.params.id;

    // Finding user by ID and deleting
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    createNotificationProperty(
      "Parking",
      "Parking added",
      "Your new parking added",
      Date.now(),
      user._id
    );


    await SendEmail({
      name: user.firstName + " " + user.lastName,
      email: user.email,
      subject: "Account Deleted",
      message: "Your account deleted",
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// GOOGLE AUTHENTICATION FUNCTIONS

// Login Failed Function
export const loginFailed = (req, res) => {
  res.status(401).json({ message: "Login Failed" });
};

// Login Success Function
export const loginSuccess = (req, res) => {
  console.log("Yahan User Hai=", req.user);
  if (req.isAuthenticated()) {
    // createNotificationProperty(
    //   "User",
    //   "User login",
    //   "User loggedin",
    //   Date.now(),
    //   ownerId
    // );
    console.log("Yahan User Ander Hai=", req.user);

    res.status(200).json({ message: "Login Success", user: req.user });
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
};

// Logout Function
export const logout = (req, res) => {
  req.logout();
  // res.redirect(process.env.CLIENT_URL);
  res.status(200).json({ message: "Logout Success" });
};

// Get User Id And Name Function
export const getUserIdAndname = async (req, res) => {
  const formType = req.query.form_type;

  if (formType === "hotel") {
    let accounts = (
      await User.find({
        $or: [{ account_type: "user" }, { partner_type: "Hotel" }],
      }).select("_id firstName lastName")
    ).map((account) => account.toObject());
    accounts.forEach((account) => {
      account.name = account.firstName + " " + account.lastName;
    });
    return res.status(200).json({ accounts });
  } else if (formType === "parking") {
    let accounts = (
      await User.find({
        $or: [{ account_type: "user" }, { partner_type: "Parking" }],
      }).select("_id firstName lastName")
    ).map((account) => account.toObject());
    accounts.forEach((account) => {
      account.name = account.firstName + " " + account.lastName;
    });
    return res.status(200).json({ accounts });
  } else {
    let accounts = (
      await User.find({
        $or: [{ account_type: "user" }, { partner_type: "HotelAndParking" }],
      }).select("_id firstName lastName")
    ).map((account) => account.toObject());
    accounts.forEach((account) => {
      account.name = account.firstName + " " + account.lastName;
    });
    return res.status(200).json({ accounts });
  }
};
