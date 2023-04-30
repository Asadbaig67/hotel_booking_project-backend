import Notification from "../models/notifications.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({});
    if (notifications.length === 0) {
      return res.status(404).json({ message: "No Notifications Found" });
    }
    res.status(200).json(notifications);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { type, title, message } = req.query;
    if (!type || !title || !message) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const newNotification = new Notification({ type, title, message });
    await newNotification.save();
    res.status(201).json("Notification added");
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const id = req.params.id;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ message: "No Notification Found" });
    }
    res.status(200).json("Notification deleted");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
