import Hotel from "../models/Hotel.js";
import User from "../models/user.js";
import Room from "../models/Room.js";
import UnverifiedUsers from "../models/UnverifiedUsers.js";
import { checkRoomAvailability } from "../Functions/Hotel/checkroomAvailabilty.js";
import { checkHotelAvailability } from "../Functions/Hotel/checkHotelAvailabilty.js";
import { getRoomByHotel } from "../Functions/Hotel/getRoomByHotel.js";
import { getRoomByPrices } from "../Functions/Hotel/getRoomsPrices.js";
import { fileURLToPath } from "url";
import { createNotificationProperty } from "../Functions/Notification/createNotification.js";
import { SendEmail } from "../Functions/Emails/SendEmail.js";
import { getData } from "../Functions/ChartData/GetData.js";
import { getRoomsList } from "../Functions/Hotel/getRoomsList.js";

import path from "path";
import fs from "fs";

// Add Hotel Function
export const addHotel = async (req, res) => {
  try {
    const {
      ownerId,
      email,
      name,
      title,
      rating,
      description,
      city,
      country,
      address,
      facilities,
    } = req.body;

    if (
      !name ||
      !title ||
      !rating ||
      !description ||
      !city ||
      !country ||
      !address ||
      !facilities
    ) {
      return res.status(500).json({ error: "All fields are required! " });
    }

    const exists = await Hotel.findOne({
      $and: [{ name }, { city }],
    });
    if (exists) {
      return res.status(422).json({ error: "Hotel already exists" });
    }

    // Images Handling Code
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const hotelsLocation = path.join(__dirname, "..", "uploads", "HotelImages");

    const files = Object.values(req.files).flat();
    const fileNames = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.replace(/\s+/g, "");
      fileNames.push(fileName);
      const filePath = path.join(hotelsLocation, fileName);
      // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
      await file.mv(filePath);
    }

    const baseUrl = "http://localhost:5000";
    const photos = fileNames.map(
      (fileName) => `${baseUrl}/uploads/HotelImages/${fileName}`
    );
    // Images Handling Code Ends Here

    const new_hotel = new Hotel({
      ...(ownerId && { ownerId }),
      name,
      title,
      rating,
      description,
      city,
      country,
      address,
      photos,
      ...(ownerId ? { ownerAvailablity: true } : { ownerAvailablity: false }),
      Facilities: facilities,
    });

    const result = await new_hotel.save();

    if (email) {

      const newUser = new UnverifiedUsers({
        email: email,
        property_type: "Hotel",
        property_id: new_hotel._id,
      });
      await newUser.save();
    }

    if (result) {
      createNotificationProperty(
        "hotel",
        "Hotel Added",
        `hotel ${name} added successfully`,
        Date.now(),
        ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel",
          "New Hotel",
          `Hotel ${name} added by ${user.name}`,
          Date.now(),
          user._id
        );
      });

      if (email) {
        await SendEmail({
          email: email,
          subject: "Hotel Added",
          message:
            "Your hotel has been added successfully. Thank you for choosing Desalis Hotels. We will review your hotel and get back to you as soon as possible. ",
        });
      } else {
        const Owner = await User.findById(ownerId);

        // Send Email
        await SendEmail({
          name: Owner.firstName + " " + Owner.lastName,
          email: Owner.email,
          subject: "Hotel Added",
          message:
            "Your hotel has been added successfully. Thank you for choosing Desalis Hotels. We will review your hotel and get back to you as soon as possible. ",
        });
      }

      return res
        .status(200)
        .json({ message: "Hotel Added Successfully", hotel: result });
    } else {
      return res
        .status(500)
        .json({ message: "Hotel Cannot be Added", hotel: result });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get All Hotels List Function
export const getAllHotels = async (req, res) => {
  let result = await Hotel.find();
  let response = result.filter(
    (hotel) =>
      hotel.approved === true &&
      hotel.ownerAvailablity === true &&
      hotel.deList === false
  );
  if (!response) {
    return res.status(404).json({ message: "No hotels found" });
  }
  res.send(response);
};

// Get All Hotels List Function
export const getAllHotelNames = async (req, res) => {
  let result = await Hotel.find();
  let response = result.filter(
    (hotel) =>
      hotel.approved === true &&
      hotel.ownerAvailablity === true &&
      hotel.deList === false
  );
  if (!response) {
    return res.status(404).json({ message: "No hotels found" });
  }
  res.send(response);
};

// Get Hotel By City Name
export const getHotelByCityName = async (req, res) => {
  let city = req.params.city;
  city = city.toString();

  const hotels = await Hotel.find({ city: city, deList: false });
  if (!hotels) {
    return res.status(404).json({ message: "No hotels found" });
  }

  let array = hotels.map((singlehotel, index) => {
    let obj = {};
    obj.hotel = singlehotel;
    return obj;
  });

  res.status(200).json(array);
};

// Get Pending Hotels List Function
export const getPendingHotels = async (req, res) => {
  let result = await Hotel.find();
  let response = result.filter(
    (hotel) =>
      hotel.approved === false &&
      hotel.ownerAvailablity === true &&
      hotel.deList === false
  );
  if (!response) {
    return res.status(404).json({ message: "No hotels found" });
  }
  res.send(response);
};

// Get Hotel By Id Function
export const getHotelsById = async (req, res) => {
  const _id = req.params.id;
  // res.send("_id");
  try {
    const data = await Hotel.findById(_id);
    // const response = data.approved === true ? data : null;
    if (!data) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(data);
  } catch (error) {
    res.json(error);
  }
};

//Get Hotel By Owner Id Function
export const getHotelByOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const data = await Hotel.find({ ownerId });
    const result = data.filter((hotel) => hotel.deList === false);
    if (!result) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(result);
  } catch (error) {
    res.json(error);
  }
};

//Get hotel by rating filter
export const getHotelByRatingFilter = async (req, res) => {
  let rating = req.query.filter;
  rating = JSON.parse(rating);
  console.log(rating);
  try {
  } catch (error) {
    res.json(error);
  }
};

//Get Approved Hotel By Owner Id Function
export const getApprovedHotelByOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const result = await Hotel.find({ ownerId });
    const response = result.filter(
      (hotel) =>
        hotel.approved === true &&
        hotel.ownerAvailablity === true &&
        hotel.deList === false
    );
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Pending Hotel By Owner Id Function
export const getUnapprovedHotelByOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const result = await Hotel.find({ ownerId });
    const response = result.filter(
      (hotel) =>
        hotel.approved === false &&
        hotel.ownerAvailablity === true &&
        hotel.deList === false
    );
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch (error) {
    res.json(error);
  }
};

//Get hotel count by city name
export const getHotelByCityCount = async (req, res) => {
  const city = req.params.city;
  try {
    const count = await Hotel.countDocuments({
      city: city,
      approved: true,
      ownerAvailablity: true,
      deList: false,
    });
    // if (!count) {
    //   return res.status(404).json({ message: "No hotels found" });
    // }
    res.send({ count: count });
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
  // console.log(hotelData)
  //to filter out the hotels which have no rooms available
  hotelData = checkHotelAvailability(
    hotelData,
    singleRoom,
    twinRoom,
    familyRoom,
    room_available
  );
  hotelData = hotelData.filter((hotel) => hotel.rooms.length > 0);
  // console.log(hotelData)
  hotelData = hotelData.filter(
    (hotel) =>
      hotel.hotel.approved === true &&
      hotel.hotel.ownerAvailablity === true &&
      hotel.hotel.deList === false
  );

  if (hotelData.length === 0)
    return res.status(401).json({ message: "No Hotel Found" });

  return res.status(200).json(hotelData);
};

// Get Hotel By City Function
export const getHotelByHotelId = async (req, res) => {
  let city = req.query.city;
  let dates = [req.query.checkIn, req.query.checkOut];
  let singleRoom = req.query.singleRoom;
  let twinRoom = req.query.twinRoom;
  let familyRoom = req.query.familyRoom;
  let room_available = [false, false, false];
  let roomsArr = [];
  let hotelRecord = [];
  let hotelData = [];

  // Find Hotel By City
  let cityHotel = await Hotel.findById(req.query.id);
  if (!cityHotel) {
    res.status(404).json({ message: "No hotels found" });
  }
  cityHotel = Array.from(cityHotel);

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
  hotelData = hotelData.filter(
    (hotel) =>
      hotel.hotel.approved === true &&
      hotel.hotel.ownerAvailablity === true &&
      hotel.deList === false
  );

  if (hotelData.length === 0)
    return res.status(401).json({ message: "No Hotel Found" });

  return res.status(200).json(hotelData);
};

export const getHotelRoomsList = async (req, res) => {
  let hotelId = req.query.id;
  let dates = [new Date(req.query.checkIn), new Date(req.query.checkOut)];

  let hotel;
  try {
    hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel Not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
  const roomIds = hotel.rooms;

  let rooms = [];
  try {
    rooms = await Promise.all(
      roomIds.map(async (roomId) => {
        const roomData = await Room.findById(roomId);
        const availbleRoomsObj = getRoomsList(roomData, dates);
        return availbleRoomsObj;
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }

  res.status(200).json({ rooms });
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
      createNotificationProperty(
        "hotel",
        "Update Hotel",
        `Your hotel ${result.name} is updated`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel",
          "Hotel Updated",
          `Hotel ${result.name} is updated by ${result.ownerId}`,
          Date.now(),
          user._id
        );
      });
      res.status(200).json({ message: "Hotel Updated Successfully" });
    } else {
      res.status(404).json({ message: "Hotel Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Update Hotel Function
export const UpdateHotel = async (req, res) => {
  try {
    let photos = [];
    // If User Adds new Images
    if (req.files && Object.keys(req.files).length !== 0) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const hotelsLocation = path.join(
        __dirname,
        "..",
        "uploads",
        "HotelImages"
      );

      const files = Object.values(req.files).flat();
      const fileNames = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name.replace(/\s+/g, "");
        fileNames.push(fileName);
        const filePath = path.join(hotelsLocation, fileName);
        // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
        await file.mv(filePath);
      }

      const baseUrl = "http://localhost:5000";
      photos = fileNames.map(
        (fileName) => `${baseUrl}/uploads/HotelImages/${fileName}`
      );
    }

    const {
      // ownerId,
      name,
      title,
      rating,
      description,
      city,
      country,
      address,
      facilities,
    } = req.body;

    if (
      !name ||
      !title ||
      !rating ||
      !description ||
      !city ||
      !country ||
      !address ||
      !facilities
    ) {
      return res.status(500).json({ error: "All fields are required! " });
    }

    const updated_hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      {
        // ownerId,
        name,
        title,
        rating,
        description,
        city,
        country,
        address,
        ...(photos.length > 0 && { $push: { photos: { $each: photos } } }),
        // $push: { photos: { $each: photos } }, // will appends new and keeps the existing images
        $addToSet: { Facilities: { $each: facilities } }, // will not duplicate entries
      },
      { new: true }
    );

    // const result = await updated_hotel.save();
    // const updated_hotel = true;
    if (updated_hotel) {
      createNotificationProperty(
        "hotel",
        "Hotel Updated",
        `Your hotel ${name} is updated`,
        Date.now(),
        updated_hotel.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel",
          "Hotel Updated",
          `Hotel ${name} is updated by ${ownerId}`,
          Date.now(),
          user._id
        );
      });
      console.log("photos Array =", photos);
      return res.status(200).json({
        message: "Hotel Updated Successfully",
      });
    } else {
      return res.status(500).json({ message: "Hotel Cannot be Updated" });
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

    const currentDate = new Date();

    const result = await Hotel.findByIdAndUpdate(
      req.params.id,
      { approved: true, createdAt: currentDate },
      { new: true }
    );

    if (result) {
      const { ownerId } = data;
      console.log(ownerId);
      if (!ownerId) {
        await Hotel.findByIdAndUpdate(
          req.params.id,
          { approved: false },
          { new: true }
        );
        return res.status(404).json({ message: "User Not Found" });
      }
      const user = await User.findById(ownerId);
      user.partner_type = "Hotel";
      user.account_type = "partner";
      await user.save();

      await SendEmail({
        name: user.firstName + " " + user.lastName,
        email: user.email,
        subject: "Hotel Approved",
        message:
          "Your hotel has been approved successfully. Thank you for choosing Desalis Hotels.",
      });
    }

    if (result !== null) {
      createNotificationProperty(
        "hotel",
        "Hotel Approved",
        `Your hotel ${data.name} is approved`,
        Date.now(),
        data.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel",
          "Hotel approved",
          `Hotel ${data.name} is approved and live for users.`,
          Date.now(),
          user._id
        );
      });
      return res.status(200).json({ message: "Hotel Approved Successfully" });
    } else {
      return res.status(404).json({ message: "Hotel Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

//Approve Hotel And Update Rating Function
export const approveHotelAndUpdateRating = async (req, res) => {
  const id = req.params.id;
  try {
    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ message: "Hotel Not Found" });
    if (hotel.approved === true) {
      return res.status(200).json({ message: "Hotel Already Approved" });
    }
    const result = await Hotel.findByIdAndUpdate(
      req.params.id,
      { approved: true, rating: req.body.rating, createdAt: Date.now() },
      { new: true }
    );
    if (result) {
      const { ownerId } = hotel;
      console.log(ownerId);
      if (!ownerId) {
        await Hotel.findByIdAndUpdate(
          req.params.id,
          { approved: false },
          { new: true }
        );
        return res.status(404).json({ message: "User Not Found" });
      }
      const user = await User.findById(ownerId);
      user.partner_type = "Hotel";
      user.account_type = "partner";
      await user.save();
    }

    if (result !== null) {
      createNotificationProperty(
        "hotel",
        "Hotel Approved",
        `Your hotel ${result.name} is approved with updated rating of ${result.rating}`,
        Date.now(),
        data.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel",
          "Hotel Approved",
          `Hotel ${result.name} is approved with updated rating of ${result.rating} and live for users.`,
          Date.now(),
          user._id
        );
      });
    }
    return res.status(200).json({ message: "Hotel Approved Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get Chart Data For Hotel Function
export const getChartDataForHotel = async (req, res) => {
  try {
    const result = await Hotel.find({
      approved: true,
      ownerAvailablity: true,
      deList: false,
    });
    if (!result) {
      return res.status(200).json(new Array(12).fill(0));
    }
    const data = getData(result);
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
  }
};

//Get delisted hotels by owner id function
export const getDeListedByOwnerId = async (req, res) => {
  try {
    const result = await Hotel.find({
      ownerId: req.params.id,
      deList: true,
    });
    if (!result) {
      return res.status(200).json([]);
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

// Get all delisted hotels function
export const getAllDeListedHotels = async (req, res) => {
  try {
    const result = await Hotel.find({ deList: true });
    if (!result) {
      return res.status(200).json([]);
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
// Add hotel to listing function
export const addHotelToList = async (req, res) => {
  const { id, account_type } = req.body;
  try {
    if (!id || !account_type) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const result = await Hotel.findById(id);
    if (!result) {
      return res.status(404).json({ message: "Hotel Not Found" });
    }
    if (result.deList === false) {
      return res.status(200).json({ message: "Hotel Already Listed" });
    }
    if (account_type === "admin") {
      result.deList = false;
      result.approved = true;
      await result.save();
      return res.status(200).json({ message: "Hotel Listed Successfully" });
    } else if (account_type === "partner") {
      result.deList = false;
      await result.save();
      return res.status(200).json({ message: "Hotel Listed Successfully" });
    }
  } catch (error) {
    console.log(error);
  }
};
// Delete Parking Function
export const deleteHotel = async (req, res) => {
  try {
    const result = await Hotel.findById(req.params.id);
    if (result) {
      result.deList = true;
      await result.save();
      // createNotificationProperty(
      //   "Hotel",
      //   "Hotel Deleted",
      //   `Your hotel ${result.name} is deleted`,
      //   Date.now(),
      //   result.ownerId
      // );
      // (await User.find({ account_type: "admin" })).forEach((user) => {
      //   createNotificationProperty(
      //     "hotel",
      //     "Hotel Deleted",
      //     `Hotel ${result.name} is deleted`,
      //     Date.now(),
      //     user._id
      //   );
      // });
      res.status(200).json({ message: "Hotel Deleted Successfully" });
    } else {
      res.status(404).json({ message: "Hotel Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get Top 4 Hotels Function
export const getTopHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({
      approved: true,
      ownerAvailablity: true,
      deList: false,
    })
      .sort({ rating: -1 })
      .limit(4);

    if (!hotels) {
      return res.status(404).json({ message: "No hotels found" });
    }

    // console.log(hotels);

    const results = await Promise.all(
      hotels.map(async (hotel) => {
        const StandardPrice = await getRoomByPrices(hotel.rooms);
        // const updatedHotel = { ...hotel._doc, roomPrices };
        const updatedHotel = { ...hotel._doc, StandardPrice };
        return updatedHotel;
      })
    );

    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const deleteHotelImages = async (req, res) => {
  const { link } = req.body;
  const hotel = await Hotel.findById(req.params.id);

  // Remove Image from database
  const newPhotos = hotel.photos.filter((imglink) => imglink !== link);
  hotel.photos = newPhotos;
  await hotel.save();

  // Remove Image from Disk Storage
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const linkarray = link.split("/");
  // Delete Image from location
  const filename = linkarray[linkarray.length - 1];
  const filePath = path.join(__dirname, "../uploads/HotelImages", filename);
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete file." });
      }

      // File deletion successful
      return res.status(200).json({ message: "File deleted successfully." });
    });
  } else {
    return res.status(404).json({ error: "File not found." });
  }
};
