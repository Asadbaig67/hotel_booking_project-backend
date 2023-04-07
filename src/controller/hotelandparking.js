import HotelandParking from "../models/Hotel_Parking.js";
import { getRoomByHotel } from "../Functions/Hotel/getRoomByHotel.js";
import { checkHotelAvailability } from "../Functions/Hotel/checkHotelAvailabilty.js";
import { checkRoomAndParkingAvailability } from "../Functions/HotelParking/checkRoomAndParkingAvailabilty.js";

// Add Hotel And Parking Function
export const addhotelandparking = async (req, res) => {
  try {
    // Create a new Hotel and Parking Object
    let hotel_parking = {};

    // Check if all fields are filled
    if (
      req.body.hotel_name &&
      req.body.hotel_title &&
      req.body.hotel_rating &&
      req.body.hotel_description &&
      req.body.hotel_photos &&
      req.body.rooms &&
      req.body.hotel_city &&
      req.body.hotel_country &&
      req.body.hotel_address &&
      req.body.parking_name &&
      req.body.parking_title &&
      req.body.parking_total_slots &&
      req.body.parking_description &&
      req.body.parking_photos
    ) {
      // Hotel
      hotel_parking.hotel_name = req.body.hotel_name;
      hotel_parking.hotel_title = req.body.hotel_title;
      hotel_parking.hotel_rating = req.body.hotel_rating;
      hotel_parking.hotel_description = req.body.hotel_description;
      hotel_parking.hotel_photos = req.body.hotel_photos;
      hotel_parking.rooms = req.body.rooms;
      hotel_parking.hotel_city = req.body.hotel_city;
      hotel_parking.hotel_country = req.body.hotel_country;
      hotel_parking.hotel_address = req.body.hotel_address;

      // Parking
      hotel_parking.parking_name = req.body.parking_name;
      hotel_parking.parking_title = req.body.parking_title;
      hotel_parking.parking_total_slots = req.body.parking_total_slots;
      hotel_parking.parking_description = req.body.parking_description;
      hotel_parking.parking_photos = req.body.parking_photos;
    } else {
      // If any field is missing
      return res.status(422).json({ error: "All fields are required! " });
    }

    // Check if hotel and parking already exists
    // $or: [ { status: "A" }, { qty: { $lt: 30 } } ]
    const exists = await HotelandParking.findOne({
      $or: [
        { hotel_name: hotel_parking.hotel_name },
        { parking_name: hotel_parking.parking_name },
      ],
    });
    if (exists) {
      return res
        .status(422)
        .json({ error: "Hotel and Parking already exists" });
    }

    // Create a new Hotel and Parking
    const new_hotelandparking = new HotelandParking(hotel_parking);

    // Save Hotel and Parking
    const result = await new_hotelandparking.save();

    // If Hotel and Parking saved successfully
    if (result) {
      res.status(201).json({ message: "Hotel and Parking Added Successfully" });
    } else {
      res.status(500).json({ message: "Hotel and Parking Cannot be Added" });
    }
  } catch (error) {
    // If any error occurs
    console.log(error);
  }
};

// Get All Hotels And Parking
export const getAllhotelandparkings = async (req, res) => {
  let result = await HotelandParking.find();
  try {
    const response = result.filter((item) => item.approved === true);
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch (error) {
    res.json(error);
  }
};

// Get All Hotel And Parking By City
export const gethotelandparkingbyCity = async (req, res) => {
  let city = req.params.city;
  let result = await HotelandParking.find({ city });
  try {
    const response = result.filter((item) => item.approved === true);
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Hotel And Parking By Id
export const gethotelandparkingbyId = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await HotelandParking.findById(id);
    const response = data.approved === true ? data : null;
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch (error) {
    res.json(error);
  }
};

// Search Hotel And Parking By City Function

export const getHotelAndParkingBySearch = async (req, res) => {
  let city = req.query.city;
  let dates = [req.query.checkIn, req.query.checkOut];
  let adult = req.query.adult;
  let children = req.query.children;
  let singleRoom = req.query.singleRoom;
  let twinRoom = req.query.twinRoom;
  let familyRoom = req.query.familyRoom;
  let vehicle = req.query.vehicle;
  let room_available = [false, false, false];
  let roomsArr = [];
  let hotelRecord = [];
  let hotelData = [];

  let cityHotel = await HotelandParking.find({ hotel_city: city });
  if (!cityHotel) {
    res.status(404).json({ message: "No hotels found" });
  }

  await getRoomByHotel(cityHotel, roomsArr);

  //to combine hotel and its respective rooms
  roomsArr.map(async (hotel, i) => {
    if (hotel.length > 0)
      hotelRecord = [...hotelRecord, { hotel: cityHotel[i], rooms: hotel }];
  });

  //to check if room is available or not
  hotelData = checkRoomAndParkingAvailability(hotelRecord, dates);

  //to filter out the hotels which have no rooms available
  hotelData = checkHotelAvailability(
    hotelData,
    singleRoom,
    twinRoom,
    familyRoom,
    room_available
  );
  hotelData = hotelData.filter((hotel) => hotel.rooms.length > 0);
  hotelData = hotelData.filter((hotel) => hotel.parking >= vehicle);
  hotelData = hotelData.filter((hotel) => hotel.hotel.approved === true);

  res.status(200).json(hotelData);
};

// Update Hotel And Parking
export const updateHotelAndParking = async (req, res) => {
  try {
    const result = await HotelandParking.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (result) {
      res
        .status(200)
        .json({ message: "Hotel And Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Hotel And Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Increment Hotel And Parking Booked Slots Count
export const incrementSlotsCount = async (req, res) => {
  try {
    const parking = await HotelandParking.findOne({ _id: req.params.id });
    if (parking) {
      if (parking.parking_booked_slots >= parking.parking_total_slots) {
        return res.status(422).json({ error: "Parking is full" });
      }
    }

    const result = await HotelandParking.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { booked_slots: 1 } },
      { new: true }
    );
    if (result) {
      res.status(200).json({
        message: "Hotel And Parking Booked Slots Updated Successfully",
      });
    } else {
      res.status(404).json({ message: "Hotel And Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Delete Hotel And Parking
export const deleteHotelAndParking = async (req, res) => {
  try {
    // const result = await HotelandParking.findOneAndDelete({ _id: req.params.id });
    // if (result) {
    //   res.status(200).json({ message: "Hotel And Parking Deleted Successfully" })
    // }
    // else {
    //   res.status(404).json({ message: "Hotel And Parking Not Found" })
    // }
    res.send("delete");
  } catch (error) {
    console.log(error);
  }
};
