import Hotel from "../models/Hotel.js";
import { checkRoomAvailability } from "../Functions/Hotel/checkroomAvailabilty.js";
import { checkHotelAvailability } from "../Functions/Hotel/checkHotelAvailabilty.js";
import { getRoomByHotel } from "../Functions/Hotel/getRoomByHotel.js";

// Add Hotel Function
export const addHotel = async (req, res) => {
  try {
    let hotel_obj = {};
    if (
      req.body.name &&
      req.body.title &&
      req.body.rating &&
      req.body.description &&
      req.body.photos &&
      req.body.city &&
      req.body.country &&
      req.body.address
    ) {
      hotel_obj.name = req.body.name;
      hotel_obj.title = req.body.title;
      hotel_obj.rating = req.body.rating;
      hotel_obj.description = req.body.description;
      hotel_obj.photos = req.body.photos;
      hotel_obj.city = req.body.city;
      hotel_obj.country = req.body.country;
      hotel_obj.address = req.body.address;
    } else {
      return res.status(422).json({ error: "All fields are required! " });
    }

    const exists = await Hotel.findOne({
      name: hotel_obj.name,
      city: hotel_obj.city,
      address: hotel_obj.address,
    });
    if (exists) {
      return res.status(422).json({ error: "Hotel already exists" });
    }

    const new_hotel = new Hotel(hotel_obj);

    const result = await new_hotel.save();
    if (result) {
      res.status(201).json({ message: "Hotel Added Successfully" });
    } else {
      res.status(500).json({ message: "Hotel Cannot be Added" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get All Hotels List Function
export const getAllHotels = async (req, res) => {
  let result = await Hotel.find();
  let response = result.filter((hotel) => hotel.approved === true);
  if (!response) {
    return res.status(404).json({ message: "No hotels found" });
  }
  res.send(response);
};

// Get Pending Hotels List Function
export const getPendingHotels = async (req, res) => {
  let result = await Hotel.find();
  let response = result.filter((hotel) => hotel.approved === false);
  if (!response) {
    return res.status(404).json({ message: "No hotels found" });
  }
  res.send(response);
};

// Get Hotel By Id Function
export const getHotelsById = async (req, res) => {
  const _id = req.params.id;
  try {
    const data = await Hotel.findById(_id);
    const response = data.approved === true ? data : null;
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Hotel By City Function
export const getHotelByCity = async (req, res) => {
  let city = req.query.city;
  let dates = [req.query.checkIn, req.query.checkOut];
  let adult = req.query.adult;
  let children = req.query.children;
  let singleRoom = req.query.singleRoom;
  let twinRoom = req.query.twinRoom;
  let familyRoom = req.query.familyRoom;
  let room_available = [false, false, false];
  let roomsArr = [];
  let hotelRecord = [];
  let hotelData = [];

  // Find Hotel By City
  let cityHotel = await Hotel.find({ city });
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
  hotelData = checkRoomAvailability(hotelRecord, dates);

  //to filter out the hotels which have no rooms available
  hotelData = checkHotelAvailability(
    hotelData,
    singleRoom,
    twinRoom,
    familyRoom,
    room_available
  );
  hotelData = hotelData.filter((hotel) => hotel.rooms.length > 0);
  hotelData = hotelData.filter((hotel) => hotel.hotel.approved === true);

  if (hotelData === [])
    return res.status(401).json({ message: "No Hotel Found" });

  return res.status(200).json(hotelData);
};

// Update Parking Function
export const updateHotel = async (req, res) => {
  try {
    const result = await Hotel.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (result) {
      res.status(200).json({ message: "Hotel Updated Successfully" });
    } else {
      res.status(404).json({ message: "Hotel Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Approve Hotel Function
export const approveHotel = async (req, res) => {
  const data = await Hotel.findById(req.params.id);
  try {
    if (!data) return res.status(404).json({ message: "Hotel Not Found" });
    if (data.approved === true) {
      return res.status(200).json({ message: "Hotel Already Approved" });
    }
    const result = await Hotel.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (result !== null) {
      return res.status(200).json({ message: "Hotel Approved Successfully" });
    } else {
      return res.status(404).json({ message: "Hotel Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Delete Parking Function
export const deleteHotel = async (req, res) => {
  try {
    const result = await Hotel.findOneAndDelete({ _id: req.params.id });
    if (result) {
      res.status(200).json({ message: "Hotel Deleted Successfully" });
    } else {
      res.status(404).json({ message: "Hotel Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};
