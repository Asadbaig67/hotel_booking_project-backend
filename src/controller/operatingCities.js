import OperatingCities from "../models/OperatingCities.js";

export const addOperatingHotelCity = async (req, res) => {
  const { type, city } = req.query;
  if (!type || !city) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
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
