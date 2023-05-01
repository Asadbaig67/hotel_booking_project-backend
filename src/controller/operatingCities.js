import { createNotificationProperty } from "../Functions/Notification/createNotification.js";
import OperatingCities from "../models/OperatingCities.js";
import User from "../models/user.js";

export const addOperatingHotelCity = async (req, res) => {
  const { type, city } = req.query;
  if (!type || !city) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    const userAdmin = await User.find({ account_type: "admin" });
    const userPartner = await User.find({ account_type: "partner" });
    const user = [...userAdmin, ...userPartner];
    const operatingCities = await OperatingCities.findOne({
      type: type.toLowerCase(),
    });
    if (operatingCities) {
      const isCityPresent = operatingCities.cities.find((cityObj) => {
        return cityObj.city === city.toLowerCase();
      });
      if (isCityPresent) {
        return res.status(400).json({ message: "City already present" });
      } else {
        operatingCities.cities.push({
          city: city.toLowerCase(),
          createdAt: Date.now(),
        });
        await operatingCities.save();
        if (user) {
          user.forEach(async (user) => {
            const id = user._id.toString();
            createNotificationProperty(
              "city",
              "City Added",
              `City ${city} has been added to ${type} cities`,
              Date.now(),
              id
            );
          });
        }
        return res.status(200).json({ message: "City updated successfully" });
      }
    } else {
      const newOperatingCities = new OperatingCities({
        type: type.toLowerCase(),
        cities: {
          city: city.toLowerCase(),
          createdAt: Date.now(),
        },
      });
      await newOperatingCities.save();
      if (user) {
        user.forEach(async (user) => {
          const id = user._id.toString();
          createNotificationProperty(
            "city",
            "City Added",
            `City ${city} has been added to ${type} cities`,
            Date.now(),
            id
          );
        });
      }
      return res.status(200).json({ message: "City added successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteOperatingCity = async (req, res) => {
  const { type, city } = req.query;
  if (!type || !city) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    const userAdmin = await User.find({ account_type: "admin" });
    const userPartner = await User.find({ account_type: "partner" });
    const users = [...userAdmin, ...userPartner];
    const operatingCities = await OperatingCities.findOne({
      type: type.toLowerCase(),
    });
    if (operatingCities) {
      const isCityPresent = operatingCities.cities.find((cityObj) => {
        return cityObj.city === city.toLowerCase();
      });
      if (isCityPresent) {
        const index = operatingCities.cities.indexOf(city.toLowerCase());
        operatingCities.cities.splice(index, 1);
        await operatingCities.save();
        if (users) {
          users.forEach(async (user) => {
            const id = user._id.toString();
            createNotificationProperty(
              "city",
              "City Deleted",
              `City ${city} has been deleted from ${type} cities`,
              Date.now(),
              id
            );
          });
        }
        return res.status(200).json({ message: "City deleted successfully" });
      } else {
        return res.status(400).json({ message: "City not available" });
      }
    } else {
      return res.status(400).json({ message: "City not present" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
