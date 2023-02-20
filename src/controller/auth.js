import bcryptjs from "bcryptjs";
import User from "../models/user.js";

export const registration = async (req, res) => {
  try {
    let user_obj = {};
    if (
      req.body.name &&
      req.body.phone &&
      req.body.email &&
      req.body.work &&
      req.body.password &&
      req.body.c_password
    ) {
      user_obj.name = req.body.name;
      user_obj.email = req.body.email;
      user_obj.phone = req.body.phone;
      user_obj.work = req.body.work;
      user_obj.password = req.body.password;
      user_obj.c_password = req.body.password;
    } else {
      return res.status(422).json({ error: "All fields are required! " });
    }
    if (!user_obj.password === user_obj.c_password) {
      return res.status(422).json({ error: "Incorrect password" });
    }
    // const email = user_obj.email;
    const exists = await User.findOne({ email: user_obj.email });
    if (exists) {
      return res.status(422).json({ error: "User already exists" });
    }

    const new_user = new User(user_obj);

    const result = await new_user.save();
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

export const login = async (req, res) => {
  const { email, password } = req.body;
  const exists = await User.findOne({ email });

  if (!exists) {
    return res.status(500).json({ error: "Sorry Bhai" });
  }

  let result = await bcryptjs.compare(password, exists.password);

  if (!result) {
    return res.status(500).json({ error: "Sorry Bhai" });
  } else {
    let token = await exists.generatetoken();
    if (token) {
      res.status(201).json(token);
      // res.cookie("jwt_token", token).status(201).json({ message: "Login Success" });
    }
  }
};
