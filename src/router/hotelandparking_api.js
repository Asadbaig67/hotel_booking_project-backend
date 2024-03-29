import express from "express";
import {
  addhotelandparking,
  getAllhotelandparkings,
  gethotelandparkingbyCity,
  updateHotelAndParking,
  deleteHotelAndParking,
  getHotelAndParkingBySearch,
  incrementSlotsCount,
  gethotelandparkingbyId,
  getPendinghotelandparkings,
  approveHotelAndParking,
  getBothhotelandparkings,
  gethotelandparkingbyCitySearch,
  gethotelandparkingbyOwnerId,
  getTopHotelAndParking,
  getApprovedhotelandparkingbyOwnerId,
  getunapprovedhotelandparkingbyOwnerId,
  updateHotelAndParkingNew,
  deleteHotelImages,
  deleteParkingImages,
  getHotelById,
  approveHotelAndParkingAndRating,
  getChartDataForHotel,
  getDeListedHotelAndParkingByOwnerId,
  getDeListedHotelAndParking,
  addhotelandparkingToList,
  getHotelAndParkingRoomsList,
  getHotelAndParkingNamesByOwnerId
} from "../controller/hotelandparking.js";

const Router = express.Router();

// Add Hotel And Parking
Router.post("/addhotelandparking", addhotelandparking);
// get Hotel by Id
Router.get("/gethotelandparkingById/:id", getHotelById);
// get Hotel Rooms List
Router.get("/getHotelAndParkingRooms", getHotelAndParkingRoomsList);
// Get All Hotel And Parking
Router.get("/getallhotelandparkings", getAllhotelandparkings);
// Get Pending Hotel And Parking
Router.get("/getPendinghotelandparkings", getPendinghotelandparkings);
// Get Aprroved/unapproved Hotel And Parking
Router.get("/getBothhotelandparkings", getBothhotelandparkings);
// Get Hotel And Parking By Specific City
Router.get("/gethotel/:city", gethotelandparkingbyCity);
// Get Hotel And Parking By Specific City
Router.get("/cityhotel/:city", gethotelandparkingbyCitySearch);
// Get Top 4 Hotel And Parking
Router.get("/gettophotelandparkings", getTopHotelAndParking);
// Get hotel and parking by id
Router.get("/gethotelandparkingbyid/:id", gethotelandparkingbyId);
// Get Hotel And Parking By Owner Id
Router.get("/gethotelandparkingbyownerid/:id", gethotelandparkingbyOwnerId);
//Get Approved Hotel And Parking By Owner Id
Router.get(
  "/getApprovedhotelandparkingbyownerid/:id",
  getApprovedhotelandparkingbyOwnerId
);
//get unapproved hotel and parking by owner id
Router.get(
  "/getUnapprovedhotelandparkingbyownerid/:id",
  getunapprovedhotelandparkingbyOwnerId
);
// Search Hotel And Parking By Search Query
Router.get("/search", getHotelAndParkingBySearch);
// Get Chart Data For Admin Hotel
Router.get("/chart/hotelandparkingData", getChartDataForHotel);
// Update Hotel And Parking New
Router.patch("/updatehotelandparkingdata/:id", updateHotelAndParkingNew);
// Update Hotel And Parking Booked Slots
Router.put("/Incrementbookedslots/:id", incrementSlotsCount);
// Update Hotel And Parking Approved Status
Router.put("/approveHotelAndParking/:id", approveHotelAndParking);
// Update Hotel And Parking Approved Status And rating
Router.put(
  "/approveHotelAndParkingAndUpdateRating/:id",
  approveHotelAndParkingAndRating
);
// Update Hotel And Parking
Router.patch("/updatehotelandparking/:id", updateHotelAndParking);
// Get delisted Hotel And Parking
Router.get("/getAllDelistedHotelAndParking", getDeListedHotelAndParking);
// Get delisted Hotel And Parking By Owner Id
Router.get(
  "/getdelistedhotelandparkingbyownerid/:id",
  getDeListedHotelAndParkingByOwnerId
);
// Add to list Hotel And Parking
Router.put("/addHotelandparkingToList", addhotelandparkingToList);
// Delete Hotel And Parking
Router.delete("/deletehotelandparking/:id", deleteHotelAndParking);
// Delete Hotel Images
Router.delete("/deletehotelimage/:id", deleteHotelImages);
// Delete Parking Images
Router.delete("/deleteparkingimage/:id", deleteParkingImages);
// Get Hotel And Parking Names By Owner Id
Router.get(
  "/getHotelAndParkingNamesByOwnerId/:id",
  getHotelAndParkingNamesByOwnerId
);

// Exporting Router
export default Router;
