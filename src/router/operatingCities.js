import express from "express";
import {
  addOperatingHotelCity,
  deleteOperatingCity,
  getHotelOperatingCities,
  getParkingOperatingCity,
  getHotelAndParkingOperatingCity,
  getOperatingCityByType,
} from "../controller/operatingCities.js";
const Router = express.Router();

Router.put("/addOperatingHotelCity", addOperatingHotelCity);

Router.get("/getHotelOperatingCity", getHotelOperatingCities);

Router.get("/getParkingOperatingCity", getParkingOperatingCity);

Router.get("/getHotelAndParkingOperatingCity", getHotelAndParkingOperatingCity);

Router.get("/getOperatingCityByType/:type", getOperatingCityByType);

Router.delete("/deleteOperatingCity", deleteOperatingCity);

export default Router;
