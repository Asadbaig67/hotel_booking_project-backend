import express from "express";
import { addRoom, getAllRoom, getRoomById, updateRoomById, updateUnavailableDates } from "../controller/room.js";

const Router = express.Router();

// Add Room
Router.post("/addroom", addRoom);
// Get All Rooms
Router.get("/getallrooms", getAllRoom);
// Get Room By Id
Router.get("/getroombyid/:id", getRoomById);
// Updatee Room By Id
Router.patch("/updateroombyid/:id", updateRoomById);
// Update Unavailable Dates
Router.put("/updateunavailabledates/:id", updateUnavailableDates);

// module.exports = Router;
export default Router;
