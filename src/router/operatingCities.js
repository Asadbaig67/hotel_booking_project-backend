import express from "express";
import {
  addOperatingHotelCity,
  deleteOperatingCity,
} from "../controller/operatingCities.js";
const Router = express.Router();

Router.put("/addOperatingHotelCity", addOperatingHotelCity);

Router.delete("/deleteOperatimgCity", deleteOperatingCity);

export default Router;
