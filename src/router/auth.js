import express from "express";

import { getAll, login, registration } from "../controller/auth.js";
import { authorization } from "../middleware/authentication.js";

// const express = require("express");
// const bcryptjs = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const Router = express.Router();

// const User = require("../models/user");

Router.post("/registeration", registration);

Router.get("/getall", getAll);

Router.post("/login", login);

Router.get("/protected", authorization, (req, res) => {
  res.json({ user: { id: req.userId } });
});

// module.exports = Router;

export default Router;
