import express from "express";
import { addRoom, getAllRoom } from "../controller/room.js";

const Router = express.Router();

// Add Room
Router.post("/addroom", addRoom);
// Get All Rooms
Router.get("/getallrooms", getAllRoom);

// module.exports = Router;
export default Router;
