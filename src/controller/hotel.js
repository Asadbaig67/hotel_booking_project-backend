import Hotel from "../models/Hotel.js";
import { checkRoomAvailability } from "../Functions/Hotel/checkroomAvailabilty.js";
import { checkHotelAvailability } from "../Functions/Hotel/checkHotelAvailabilty.js";
import { getRoomByHotel } from "../Functions/Hotel/getRoomByHotel.js";
import { fileURLToPath } from 'url';
import path from 'path';
// Add Hotel Function
export const addHotel = async (req, res) => {


  try {


    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const hotelsLocation = path.join(__dirname, '..', 'uploads', 'HotelImages');



    const files = Object.values(req.files).flat();
    const fileNames = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.replace(/\s+/g, '');
      fileNames.push(fileName);
      const filePath = path.join(hotelsLocation, fileName);
      // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
      await file.mv(filePath);
    }

    // res.status(200).json({ message: "File(s) uploaded successfully." });
    // const promises = files.map(async (file) => {
    //   const fileName = file.name.replace(/\s+/g, '');
    //   fileNames.push(fileName);
    //   const filePath = path.join(hotelsLocation, fileName);
    //   console.log(filePath);
    //   await file.mv(filePath);
    // });

    // await Promise.all(promises);

    const baseUrl = 'http://localhost:5000';
    const photos = fileNames.map(fileName => `${baseUrl}/uploads/HotelImages/${fileName}`);

    // const hotelsLocation = path.join(process.cwd(), '/uploads', 'HotelImages');

    // const files = Object.entries(req.files).map(([key, file]) => ({
    //   file_name: file.name,
    //   mimetype: file.mimetype,
    //   size: file.size
    // }));

    // Object.entries(req.files).map(([key, file]) => {
    //   console.log(Object.entries(req.files)[0][1].name);

    // });
    // Object.entries(req.files).map(([key, file]) => {
    //   file.mv(path.join(hotelsLocation, file.name), (err) => {
    //     if (err) {
    //       return res.status(500).json({ error: "This message occurs when moving files to folder" + err.message });
    //     }
    //   });
    // });

    // res.status(200).json({ message: "File(s) uploaded successfully." });

    // const baseUrl = 'http://localhost:5000';
    // const photos = files.map((file) => `${baseUrl}/uploads/HotelImages/${file.file_name}`);


    const { name, title, rating, description, city, country, address } = req.body;


    if (!name || !title || !rating || !description || !city || !country || !address) {
      return res.status(422).json({ error: "All fields are required! " });
    }

    let hotel_obj = {
      name,
      title,
      rating,
      description,
      city,
      country,
      address,
      photos
    }

    const exists = await Hotel.findOne({
      name: hotel_obj.name,
      city: hotel_obj.city,
      address: hotel_obj.address,
    });
    if (exists) {
      return res.status(422).json({ error: "Hotel already exists" });
    }

    const new_hotel = new Hotel({
      name,
      title,
      rating,
      description,
      city,
      country,
      address,
      photos
    });

    const result = await new_hotel.save();
    if (result) {
      return res.status(201).json({ message: "Hotel Added Successfully" });
    } else {
      return res.status(500).json({ message: "Hotel Cannot be Added" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get All Hotels List Function
export const getAllHotels = async (req, res) => {
  let result = await Hotel.find();
  res.send(result);
};

export const getHotelsById = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Hotel.findById(id);
    if (!data) {
      res.status(404).json({ message: "No hotels found" });
    }
    res.send(data);
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

  // if (hotelData === []) return res.status(401).json({ message: "No Hotel Found" });

  return res.status(200).json({ hoteldata: hotelData });
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
