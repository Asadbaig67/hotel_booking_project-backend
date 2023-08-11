import Notification from "../models/notifications.js";
import User from "../models/user.js";

export const getNotifications = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const notification = user.notifications;
    let result = [];
    for (const id of notification) {
      const notification = await Notification.findById(id);
      if (notification) result.push(notification);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

export const markAsRead = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await Notification.findByIdAndUpdate(id, { read: true });

    if (!result) {
      return res.status(404).json({ message: "No Notification Found" });
    }

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
