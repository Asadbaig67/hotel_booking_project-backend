import express from "express";
import {
  addOperatingHotelCity,
  deleteOperatingCity,
  getHotelOperatingCities,
  getParkingOperatingCity,
  getHotelAndParkingOperatingCity,
  getOperatingCityByType,
  getHotelOperatingCitiesObj,
  getParkingOperatingCityObj,
  getHotelAndParkingOperatingCityObj,
  getAllOperatingCities,
} from "../controller/operatingCities.js";
const Router = express.Router();

Router.put("/addOperatingHotelCity", addOperatingHotelCity);

Router.get("/getAllOperatingCities", getAllOperatingCities);

Router.get("/getHotelOperatingCity", getHotelOperatingCities);

Router.get("/getParkingOperatingCity", getParkingOperatingCity);

Router.get("/getHotelAndParkingOperatingCity", getHotelAndParkingOperatingCity);

Router.get("/getHotelOperatingCityObj", getHotelOperatingCitiesObj);

Router.get("/getParkingOperatingCityObj", getParkingOperatingCityObj);

Router.get(
  "/getHotelAndParkingOperatingCityObj",
  getHotelAndParkingOperatingCityObj
);

Router.get("/getOperatingCityByType/:type", getOperatingCityByType);

Router.delete("/deleteOperatingCity", deleteOperatingCity);

export default Router;
