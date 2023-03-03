import express from "express";
const router = express.Router();
import { addBooking, getBooking, getBookingById, updateBooking, deleteBooking } from "../controller/booking.js";

router.post("/addBooking", addBooking);
router.get("/getBooking", getBooking);
router.get("/getBooking/:id", getBookingById);
router.put("/updateBooking/:id", updateBooking);
router.delete("/deleteBooking/:id", deleteBooking);

export default router;
