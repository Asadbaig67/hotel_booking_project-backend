import express from "express";

import { getAll, login, registration, updateAccount, deleteAccount } from "../controller/auth.js";
import { authorization } from "../middleware/authentication.js";


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


export default Router;
