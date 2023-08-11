import express from "express";
import {
  getNotifications,
  createNotification,
  deleteNotification,
  markAsRead
} from "../controller/notifications.js";

const Router = express.Router();

Router.get("/getNotification/:id", getNotifications);
Router.post("/createNotification", createNotification);
Router.put("/markAsRead/:id", markAsRead)
Router.delete("/deleteNotification/:id", deleteNotification);

export default Router;
