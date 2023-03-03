import bcryptjs from "bcryptjs";
import User from "../models/user.js";

export const registration = async (req, res) => {

  try {
    // Deconstructing the request body
    let { firstName, lastName, email, account_type, password, c_password } = req.body;

    // Checking if all fields are filled
    if (!firstName || !lastName || !email || !account_type || !password || !c_password) {
      return res.status(422).json({ error: "All fields are required!" });
    }

    // Checking if password and confirm password are same
    if (!password === c_password) {
      return res.status(422).json({ error: "Incorrect password" });
    }

    // Checking if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(422).json({ error: "User already exists" });
    }

    // Converting account type to lowercase
    account_type.toLowerCase();

    // creating new user
    const new_user = new User({
      firstName,
      lastName,
      email,
      account_type,
      password,
      c_password,
    });

    // saving new user
    const result = await new_user.save();

    // checking if user is saved
    if (result) {
      res.status(201).json({ message: "User Created successfully" });
    } else {
      res.status(500).json({ message: "User Registration Failed" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getAll = async (req, res) => {
  let result = await User.find();
  res.send(result);
};

export const getAllUser = async (req, res) => {
  let { account_type } = req.params;
  account_type.toLowerCase();
  let result = await User.find({ account_type });
  res.send(result);
}


export const login = async (req, res) => {

  // Deconstructing the request body
  const { email, password } = req.body;

  // Checking if user exists or not
  const exists = await User.findOne({ email });

  // generating error if user does not exists
  if (!exists) {
    return res.status(500).json({ error: "User Does'nt exist" });
  }

  // comparing password
  let result = await bcryptjs.compare(password, exists.password);

  // If passwords do not match generating error
  if (!result) {
    return res.status(500).json({ error: " Wrong Credentials" });
  } else {
    let token = await exists.generatetoken();
    if (token) {
      // res.status(201).json(token);
      // res.cookie("user_token", token).status(201).json({ message: "Login Success" });
      res.cookie('user_token', token, {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        // httpOnly: true,
        // secure: true,
        sameSite: 'none',
        path: '/'
      }).status(201).json({ message: 'Login Success' });
    }
  }
};
