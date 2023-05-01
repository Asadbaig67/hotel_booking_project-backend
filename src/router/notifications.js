import express from "express";
import {
  getNotifications,
  createNotification,
  deleteNotification,
} from "../controller/notifications.js";

const Router = express.Router();

Router.get("/getNotification", getNotifications);
Router.post("/createNotification", createNotification);
Router.delete("/deleteNotification/:id", deleteNotification);

export default Router;