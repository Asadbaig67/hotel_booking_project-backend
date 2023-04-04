import bcryptjs from "bcryptjs";
import User from "../models/user.js";

// User Registration Function
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

    // User Email Verification API

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
}

// Login Function
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

      res.cookie('tokens', token, {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      }).status(201).json({ message: 'Login Success' });
    }
  }
};

// Update Account Function
export const updateAccount = async (req, res) => {
  try {
    const userId = req.params.id;

    // const { firstName, lastName, email, account_type, password, c_password } = req.body;

    // Checking if all fields are filled
    // if (!firstName || !lastName || !email || !account_type) {
    //   return res.status(422).json({ error: "All fields are required!" });
    // }

    // Checking if password and confirm password are same
    if (password && c_password && password !== c_password) {
      return res.status(422).json({ error: "Passwords do not match" });
    }

    // Finding user by ID and updating their information
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
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
}

// Login Success Function
export const loginSuccess = (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "Login Success", user: req.user });

  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
}

// Logout Function
export const logout = (req, res) => {
  req.logout();
  // res.redirect(process.env.CLIENT_URL);
  res.status(200).json({ message: "Logout Success" });
}
