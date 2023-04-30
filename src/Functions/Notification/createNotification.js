import Hotel from "../../models/Hotel.js";
import Notification from "../../models/notifications.js";
import User from "../../models/user.js";

export const createNotification = async (
  type,
  title,
  message,
  date,
  hotelId,
  userId
) => {
  try {
    if (!type || !title || !message || !date) {
      return { message: "Please fill all the fields" };
    }
    const newNotification = new Notification({ type, title, message, date });
    await newNotification.save();
    const hotel = await Hotel.findById(hotelId);
    const ownerId = hotel.ownerId;
    const owner = await User.findById(ownerId);
    owner.notifications.push(newNotification._id);
    await owner.save();
    const user = await User.findById(userId);
    user.notifications.push(newNotification._id);
    await user.save();
    return { message: "Notification added" };
  } catch (error) {
    return { message: error.message };
  }
};

export const createNotificationProperty = async (
  type,
  title,
  message,
  date,
  ownerId
) => {
  try {
    const user = await User.findById(ownerId);
    if (user) {
      const newNotification = new Notification({ type, title, message, date });
      await newNotification.save();
      user.notifications.push(newNotification._id);
      await user.save();
      return { message: "Notification added" };
    }
    return { message: "Error" };
  } catch (error) {
    return { message: error.message };
  }
};
