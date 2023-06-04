import Notification from "../models/notifications.js";

export const getNotifications = async (req, res) => {
  try {
    const stream = await Notification.find().stream();

    stream.on("data", (notification) => {
      // Process each streamed notification
      res.write(JSON.stringify(notification));
    });

    stream.on("error", (error) => {
      // Handle any errors that occur during streaming
      res.status(500).json({ message: error.message });
    });

    stream.on("end", () => {
      // Streaming has finished
      res.end();
    });
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
