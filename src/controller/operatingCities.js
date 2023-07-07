import { createNotificationProperty } from "../Functions/Notification/createNotification.js";
import OperatingCities from "../models/OperatingCities.js";
import User from "../models/user.js";

export const addOperatingHotelCity = async (req, res) => {
  const { type, city } = req.body;
  if (!type || !city) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    const operatingCity = await OperatingCities.findOne({
      city: city.toLowerCase(),
    });
    if (operatingCity) {
      if (operatingCity[type] === true) {
        return res.status(400).json({ message: "City already exists" });
      }
      operatingCity[type] = true;
      await operatingCity.save();
      return res.status(200).json({ message: "City added successfully" });
    }
    const newOperatingCity = new OperatingCities({
      city: city.toLowerCase(),
      [type]: true,
    });
    await newOperatingCity.save();
    return res.status(200).json({ message: "City added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllOperatingCities = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.find();
    // const responseArr = [];
    if (operatingCities) {
      // operatingCities.map((city, i) => {
      //   responseArr[i] = city.city.charAt(0).toUpperCase() + city.city.slice(1);
      // });
      return res.status(200).json(operatingCities);
    }
    return res.status(200).json([]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHotelOperatingCities = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.find();
    const filteredCity = operatingCities.filter((city) => city.hotel);
    let responseArr = [];
    if (filteredCity) {
      filteredCity.map((city, i) => {
        responseArr[i] = city.city.charAt(0).toUpperCase() + city.city.slice(1);
      });
      return res.status(200).json(responseArr);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getParkingOperatingCity = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.find();
    const filteredCity = operatingCities.filter((city) => city.parking);
    let responseArr = [];
    if (filteredCity) {
      filteredCity.map((city, i) => {
        responseArr[i] = city.city.charAt(0).toUpperCase() + city.city.slice(1);
      });
      return res.status(200).json(responseArr);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHotelAndParkingOperatingCity = async (req, res) => {
  try {
    const operatingCities = await OperatingCities.find();
    const filteredCity = operatingCities.filter((city) => city.hotelAndParking);
    let responseArr = [];
    if (filteredCity) {
      filteredCity.map((city, i) => {
        responseArr[i] = city.city.charAt(0).toUpperCase() + city.city.slice(1);
      });
      return res.status(200).json(responseArr);
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
  try {
    const { city, type } = req.body;

    if (!city || !type) {
      return res.status(400).json({ message: "Please provide both city and type" });
    }

    const operatingCity = await OperatingCities.findOne({
      city: city.toLowerCase(),
    });

    if (operatingCity) {
      if (operatingCity[type] === true) {
        operatingCity[type] = false;
        await operatingCity.save();
        return res.status(200).json({ message: "City deleted successfully" });
      }
      return res.status(400).json({ message: "City does not exist or already deleted" });
    }

    return res.status(400).json({ message: "City does not exist" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

