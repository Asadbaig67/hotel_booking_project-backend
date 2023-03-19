import express from "express";
import { addRoom, getAllRoom, getRoomById } from "../controller/room.js";

const Router = express.Router();

// Add Room
Router.post("/addroom", addRoom);
// Get All Rooms
Router.get("/getallrooms", getAllRoom);
// Get Room By Id
Router.get("/getroombyid/:id", getRoomById);

// module.exports = Router;
export default Router;
