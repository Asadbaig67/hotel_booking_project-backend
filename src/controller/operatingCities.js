import { createNotificationProperty } from "../Functions/Notification/createNotification.js";
import OperatingCities from "../models/OperatingCities.js";
import User from "../models/user.js";

export const addOperatingHotelCity = async (req, res) => {
  const { type, city } = req.body;
  if (!type || !city) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    const user = await User.find();
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
              "operating city",
              "New Operating City Added",
              `City ${city} has been added for ${type}`,
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
            "operating city",
            "Operating City Added",
            `City ${city} has been added to ${type}`,
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

export const getAllOperatingCities= async (req, res) => {
  try {
    const operatingCities = await OperatingCities.find();
    if (operatingCities) {
      operatingCities.forEach((operatingCity) => {
        operatingCity.cities.forEach((city) => {
          city.city = city.city.charAt(0).toUpperCase() + city.city.slice(1);
        });
      });
      return res.status(200).json(operatingCities);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const getHotelOperatingCities = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.findOne({
      type: "hotel",
    });
    if (operatingCities) {
      let responseArr = [];
      operatingCities.cities.map((city) => {
        city.city = city.city.charAt(0).toUpperCase() + city.city.slice(1);
        responseArr.push(city.city);
      });
      return res.status(200).json(responseArr);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getParkingOperatingCity = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.findOne({
      type: "parking",
    });
    if (operatingCities) {
      let responseArr = [];
      operatingCities.cities.map((city) => {
        city.city = city.city.charAt(0).toUpperCase() + city.city.slice(1);
        responseArr.push(city.city);
      });
      return res.status(200).json(responseArr);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHotelAndParkingOperatingCity = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.findOne({
      type: "hotelandparking",
    });
    if (operatingCities) {
      let responseArr = [];
      operatingCities.cities.map((city) => {
        city.city = city.city.charAt(0).toUpperCase() + city.city.slice(1);
        responseArr.push(city.city);
      });
      return res.status(200).json(responseArr);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHotelOperatingCitiesObj = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.findOne({
      type: "hotel",
    });
    if (operatingCities) {
      let responseArr = [];
      return res.status(200).json(operatingCities.cities);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getParkingOperatingCityObj = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.findOne({
      type: "parking",
    });
    if (operatingCities) {
      return res.status(200).json(operatingCities.cities);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHotelAndParkingOperatingCityObj = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.findOne({
      type: "hotelandparking",
    });
    if (operatingCities) {
      return res.status(200).json(operatingCities.cities);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOperatingCityByType = async (req, res) => {
  const { type } = req.params.type;
  if (!type) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    const operatingCities = await OperatingCities.findOne({
      type: type.toLowerCase(),
    });
    if (operatingCities) {
      return res.status(200).json(operatingCities.cities);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteOperatingCity = async (req, res) => {
  const { type, cityId } = req.body;
  if (!type || !cityId) {
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
        return cityObj._id.toString() === cityId;
      });
      if (isCityPresent) {
        const index = operatingCities.cities.indexOf(cityId);
        operatingCities.cities.splice(index, 1);
        await operatingCities.save();
        if (users) {
          users.forEach(async (user) => {
            const id = user._id.toString();
            createNotificationProperty(
              "operating city",
              "Operating City Deleted",
              `City ${operatingCities.city} has been deleted from ${type}`,
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
