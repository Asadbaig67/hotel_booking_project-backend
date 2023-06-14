import path from "path";
import { fileURLToPath } from "url";
import HotelandParking from "../models/Hotel_Parking.js";
import User from "../models/user.js";
import { getRoomByHotel } from "../Functions/Hotel/getRoomByHotel.js";
import { checkHotelAvailability } from "../Functions/Hotel/checkHotelAvailabilty.js";
import { checkRoomAndParkingAvailability } from "../Functions/HotelParking/checkRoomAndParkingAvailabilty.js";
import { getRoomByPrices } from "../Functions/Hotel/getRoomsPrices.js";
import { createNotificationProperty } from "../Functions/Notification/createNotification.js";
import fs from "fs";

import { getData } from "../Functions/ChartData/GetData.js";
import { SendEmail } from "../Functions/Emails/SendEmail.js";

// Add Hotel And Parking Function
export const addhotelandparking = async (req, res) => {
  try {

    const {
      ownerId,
      hotel_name,
      hotel_title,
      hotel_rating,
      hotel_address,
      city,
      country,
      total_slots,
      booked_slots,
      hotel_description,
      parking_name,
      parking_title,
      address,
      price,
      parking_description,
      facilities,
    } = req.body;

    // Check if all fields are filled
    if (
      !ownerId ||
      !hotel_name ||
      !hotel_title ||
      !hotel_rating ||
      !address ||
      !city ||
      !country ||
      !hotel_description ||
      !parking_name ||
      !parking_title ||
      !booked_slots ||
      !total_slots ||
      !price ||
      !parking_description ||
      !facilities
    ) {
      return res.status(422).json({
        error: "All fields are required! "
      });
    }

    const exists = await HotelandParking.findOne({
      $and: [{ hotel_name }, { hotel_city: city }],
    });

    if (exists) {
      return res
        .status(422)
        .json({ error: "Hotel and Parking already exists" });

    }


    // Upload Hotel and Parking Images
    const { hotel_photos, parking_photos } = req.files;
    if (
      !hotel_photos ||
      !parking_photos ||
      Object.keys(hotel_photos).length === 0 ||
      Object.keys(parking_photos).length === 0
    ) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const h_p_location = path.join(
      __dirname,
      "..",
      "uploads",
      "Hotel_Parking_Images"
    );

    const hotel_files = Object.values(hotel_photos).flat();
    const hotel_fileNames = [];
    const parking_files = Object.values(parking_photos).flat();
    const parking_fileNames = [];

    for (let i = 0; i < hotel_files.length; i++) {
      const file = hotel_files[i];
      const fileName = file.name.replace(/\s+/g, "");
      hotel_fileNames.push(fileName);
      const filePath = path.join(h_p_location, fileName);
      await file.mv(filePath);
    }

    for (let i = 0; i < parking_files.length; i++) {
      const file = parking_files[i];
      const fileName = file.name.replace(/\s+/g, "");
      parking_fileNames.push(fileName);
      const filePath = path.join(h_p_location, fileName);
      await file.mv(filePath);
    }

    const baseUrl = "http://localhost:5000";
    const hotelPhotos = hotel_fileNames.map(
      (fileName) => `${baseUrl}/uploads/Hotel_Parking_Images/${fileName}`
    );
    const parkingPhotos = parking_fileNames.map(
      (fileName) => `${baseUrl}/uploads/Hotel_Parking_Images/${fileName}`
    );
    // Images Upload End


    // Create a new Hotel and Parking
    const new_hotelandparking = new HotelandParking({
      ownerId,
      hotel_name,
      hotel_title,
      hotel_rating,
      hotel_address: address,
      hotel_city: city,
      hotel_country: country,
      hotel_description,
      parking_name,
      parking_title,
      parking_booked_slots: booked_slots,
      parking_total_slots: total_slots,
      parking_description,
      hotel_photos: hotelPhotos,
      parking_photos: parkingPhotos,
      parking_price: price,
      Facilities: facilities,
    });

    // Save Hotel and Parking
    const result = await new_hotelandparking.save();

    // If Hotel and Parking saved successfully
    if (result) {
      createNotificationProperty(
        "hotel and parking",
        "Hotel and Parking Added",
        `Your hotel and parking ${result.hotel_name} is added successfully`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel and parking",
          "Hotel and Parking Added",
          `New Your hotel and parking ${result.hotel_name} is added successfully by ${result.ownerId}`,
          Date.now(),
          user._id
        );
      });

      const Owner = await User.findById(ownerId);

      // Send Email
      await SendEmail({
        name: Owner.firstName + " " + Owner.lastName,
        email: Owner.email,
        subject: "Hotel And Parking Added",
        message:
          "Your hotel has been added successfully. Thank you for choosing Desalis Hotels. We will review your hotel and get back to you as soon as possible. ",
      });

      res.status(200).json({ message: "Hotel and Parking Added Successfully", hotel: result });
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

// Get Hotel By Id
export const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await HotelandParking.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: "No hotel found" });
    }
    res.json(hotel);
  } catch (error) {
    res.json(error);
  }
};

// Get Pending Hotels And Parking
export const getPendinghotelandparkings = async (req, res) => {
  let result = await HotelandParking.find();
  try {
    const response = result.filter((item) => item.approved === false);
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch (error) {
    res.json(error);
  }
};

// Get approved and pending hotels and parking by city
export const getBothhotelandparkings = async (req, res) => {
  try {
    const hotel = await HotelandParking.find();
    if (!hotel) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.json(hotel);
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

// Get All Hotel And Parking By City Search
export const gethotelandparkingbyCitySearch = async (req, res) => {
  let city = req.params.city;
  let result = await HotelandParking.find({ hotel_city: city });
  try {
    const response = result.filter((item) => item.approved === true);
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }

    let final_array = [];
    let obj = {
      hotel: {},
    };
    response.map((item) => {
      obj.hotel = item;
      final_array.push(obj);
    });

    res.send(final_array);
  } catch (error) {
    res.json(error);
  }
};

// Get Hotel And Parking By Id
export const gethotelandparkingbyId = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await HotelandParking.findById(id);
    // const response = data.approved === true ? data : null;
    if (!data) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(data);
  } catch (error) {
    res.json(error);
  }
};

// Get Hotel And Parking By Owner Id
export const gethotelandparkingbyOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const data = await HotelandParking.find({ ownerId });
    // const response = data.approved === true ? data : null;
    if (!data) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(data);
  } catch {
    res.json(error);
  }
};

//Get approved and pending hotels and parking by owner id
export const getApprovedhotelandparkingbyOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const data = await HotelandParking.find({ ownerId });
    const response = data.filter((item) => item.approved === true);
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch {
    res.json(error);
  }
};

//Get approved and pending hotels and parking by owner id
export const getunapprovedhotelandparkingbyOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const data = await HotelandParking.find({ ownerId });
    const response = data.filter((item) => item.approved === false);
    if (!response) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.send(response);
  } catch {
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
    return res.status(404).json({ message: "No hotels found" });
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
  // hotelData = hotelData.filter((hotel) => hotel.parking >= vehicle);
  hotelData = hotelData.filter((hotel) => hotel.hotel.approved === true);
  if (hotelData.length === 0) {
    return res.status(401).json({ message: "No hotels found" });
  }

  res.status(200).json(hotelData);
};

// Get Chart Data For Hotel And Parking Function
export const getChartDataForHotel = async (req, res) => {
  try {
    const result = await HotelandParking.find({ approved: true });
    // if (!result) {
    //   return res.status(404).json({ message: "No hotels found" });
    // }
    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
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
      createNotificationProperty(
        "hotel and parking",
        "Hotel and Parking updated",
        `Your hotel and parking ${result.hotel_name} is updated`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel and parking",
          "Hotel and Parking updated",
          `A hotel and parking ${result.hotel_name} is updated by ${result.ownerId}`,
          Date.now(),
          user._id
        );
      });
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

// Update Hotel And Parking New
export const updateHotelAndParkingNew = async (req, res) => {
  try {
    let hotel_photos = [];
    let parking_photos = [];
    // If User Adds new Images
    const { hotelPhotos, parkingPhotos } = req.files || {};
    if (
      hotelPhotos &&
      parkingPhotos &&
      Object.keys(hotelPhotos).length !== 0 &&
      Object.keys(parkingPhotos).length !== 0
    ) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const hotelsLocation = path.join(
        __dirname,
        "..",
        "uploads",
        "Hotel_Parking_Images"
      );

      const filesHotel = Object.values(req.files.hotelPhotos).flat();
      const fileNamesHotel = [];
      const filesParking = Object.values(req.files.parkingPhotos).flat();
      const fileNamesParking = [];

      if (typeof req.files.parkingPhotos.length === "undefined") {
        let pakringArray = [req.files.parkingPhotos];
        for (let i = 0; i < pakringArray.length; i++) {
          const file = pakringArray[i];
          const fileName = file.name.replace(/\s+/g, "");
          // const fileName = file.name;
          fileNamesHotel.push(fileName);
          const filePath = path.join(hotelsLocation, fileName);
          // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
          await file.mv(filePath);
        }
      } else {
        for (let i = 0; i < filesParking.length; i++) {
          const file = filesParking[i];
          // const fileName = file.name;
          // console.log(fileName);
          const fileName = file.name.replace(/\s+/g, "");
          // fileNamesParking.push(fileName);
          const filePath = path.join(hotelsLocation, fileName);
          // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
          await file.mv(filePath);
        }
      }

      if (typeof req.files.hotelPhotos.length === "undefined") {
        let hotelArray = [req.files.hotelPhotos];
        for (let i = 0; i < hotelArray.length; i++) {
          const file = hotelArray[i];
          const fileName = file.name.replace(/\s+/g, "");
          // const fileName = file.name;
          fileNamesParking.push(fileName);
          const filePath = path.join(hotelsLocation, fileName);
          // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
          await file.mv(filePath);
        }
      } else {
        console.log("filesHotel =", filesHotel, filesHotel.length);
        for (let i = 0; i < filesHotel.length; i++) {
          const file = filesHotel[i];
          // const fileName = file.name;
          // console.log(fileName);
          const fileName = file.name.replace(/\s+/g, "");
          fileNamesHotel.push(fileName);
          const filePath = path.join(hotelsLocation, fileName);
          // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
          await file.mv(filePath);
        }
      }

      const baseUrlHotel = "http://localhost:5000";
      hotel_photos = fileNamesParking.map(
        (fileName) => `${baseUrlHotel}/uploads/Hotel_Parking_Images/${fileName}`
      );
      const baseUrlParking = "http://localhost:5000";
      parking_photos = fileNamesHotel.map(
        (fileName) =>
          `${baseUrlParking}/uploads/Hotel_Parking_Images/${fileName}`
      );
    }

    const {
      hotel_name,
      hotel_title,
      hotel_rating,
      hotel_address,
      city,
      country,
      total_slots,
      booked_slots,
      hotel_description,
      parking_name,
      parking_title,
      address,
      price,
      parking_description,
      facilities,
    } = req.body;

    if (
      !hotel_name ||
      !hotel_title ||
      !hotel_rating ||
      !address ||
      !city ||
      !country ||
      !hotel_description ||
      !parking_name ||
      !parking_title ||
      !booked_slots ||
      !total_slots ||
      !price ||
      !parking_description ||
      !facilities
    ) {
      return res.status(422).json({ error: "All fields are required! " });
    }

    const updated_hotelParking = await Hotel.findByIdAndUpdate(
      req.params.id,
      {
        hotel_name,
        hotel_title,
        hotel_rating,
        hotel_address,
        city,
        country,
        total_slots,
        booked_slots,
        hotel_description,
        parking_name,
        parking_title,
        address,
        price,
        parking_description,
        facilities,
        ...(hotel_photos.length > 0 && {
          $push: { hotel_photos: { $each: hotel_photos } },
        }),
        ...(parking_photos.length > 0 && {
          $push: { parking_photos: { $each: parking_photos } },
        }),
        $addToSet: { Facilities: { $each: facilities } }, // will not duplicate entries
      },
      { new: true }
    );

    // const result = await updated_hotel.save();
    // const updated_hotelParking = true;
    if (updated_hotelParking) {
      createNotificationProperty(
        "hotel and parking",
        "Hotel and Parking updated",
        `Your hotel and parking ${updated_hotelParking.hotel_name} is updated`,
        Date.now(),
        updated_hotelParking.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel and parking",
          "Hotel and Parking updated",
          `A hotel and parking ${updated_hotelParking.hotel_name} is updated by ${updated_hotelParking.ownerId}`,
          Date.now(),
          user._id
        );
      });
      // console.log("photos Array =", photos);
      return res.status(200).json({
        message: "Hotel And Parking Updated Successfully",
      });
    } else {
      return res.status(500).json({ message: "Hotel Cannot be Updated" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Increment Hotel And Parking Booked Slots Count
export const incrementSlotsCount = async (req, res) => {
  try {
    const parking = await HotelandParking.findOne({ _id: req.params.id });
    if (!parking) {
      return res.status(404).json({ message: "Hotel And Parking Not Found" });
    } else {
      if (parking.parking_booked_slots >= parking.parking_total_slots) {
        return res.status(422).json({ error: "Parking is full" });
      }
    }

    const result = await HotelandParking.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { parking_booked_slots: 1 } },
      { new: true }
    );
    if (result) {
      createNotificationProperty(
        "hotel and parking",
        "Parking slots incremented",
        `Slots of ${result.hotel_name}'s parking is incremented to ${result.parking_booked_slots}`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel and parking",
          "Parking slots incrementD",
          `Slots of ${result.hotel_name}'s parking is incremented to ${result.parking_booked_slots} by ${result.ownerId}`,
          Date.now(),
          user._id
        );
      });
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

//Approve Hotel And Parking
export const approveHotelAndParking = async (req, res) => {
  const data = await HotelandParking.findById(req.params.id);
  try {
    if (!data) {
      return res.status(404).json({ message: "Hotel And Parking Not Found" });
    } else if (data.approved === true) {
      return res
        .status(404)
        .json({ message: "Hotel And Parking Already Approved" });
    }

    const currentDate = new Date();

    const result = await HotelandParking.findByIdAndUpdate(
      req.params.id,
      { approved: true, createdAt: currentDate },
      { new: true }
    );
    if (result) {
      const { ownerId } = data;
      if (!ownerId) {
        await HotelandParking.findByIdAndUpdate(
          req.params.id,
          { approved: false },
          { new: true }
        );
        return res.status(404).json({ message: "User Not Found" });
      }
      const user = await User.findById(ownerId);
      if (!user) return res.status(404).json({ message: "User Not Found" });
      user.partner_type = "HotelAndParking";
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
    if (result) {
      createNotificationProperty(
        "hotel and parking",
        "Hotel and Parking approved",
        `Your hotel and parking ${result.hotel_name} is approved`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel and parking",
          "Hotel and Parking approved",
          `A hotel and parking ${result.hotel_name} is approved`,
          Date.now(),
          user._id
        );
      });
      res.status(200).json({ message: "Hotel And Parking Approved" });
    } else {
      res.status(404).json({ message: "Hotel And Parking Not Found" });
    }
  } catch (error) {
    res.json(error);
  }
};

//Approve Hotel And Parking And Update Rating
export const approveHotelAndParkingAndRating = async (req, res) => {
  const data = await HotelandParking.findById(req.params.id);
  try {
    if (!data) {
      return res.status(404).json({ message: "Hotel And Parking Not Found" });
    } else if (data.approved === true) {
      return res
        .status(404)
        .json({ message: "Hotel And Parking Already Approved" });
    }

    const result = await HotelandParking.findByIdAndUpdate(
      req.params.id,
      { approved: true, hotel_rating: req.body.hotel_rating, createdAt: Date.now() },
      { new: true }
    );
    if (result) {
      const { ownerId } = data;
      if (!ownerId) {
        await HotelandParking.findByIdAndUpdate(
          req.params.id,
          { approved: false },
          { new: true }
        );
        return res.status(404).json({ message: "User Not Found" });
      }
      const user = await User.findById(ownerId);
      if (!user) return res.status(404).json({ message: "User Not Found" });
      user.partner_type = "HotelAndParking";
      user.account_type = "partner";
      await user.save();
    }
    if (result) {
      createNotificationProperty(
        "hotel and parking",
        "Hotel And Parking approved",
        `Your hotel and parking ${result.hotel_name} is approve with rating ${result.hotel_rating}`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel and parking",
          "Hotel And Parking approved",
          `A hotel and parking ${result.hotel_name} is approve with rating ${result.hotel_rating}`,
          Date.now(),
          user._id
        );
      });
      res.status(200).json({ message: "Hotel And Parking Approved" });
    } else {
      res.status(404).json({ message: "Hotel And Parking Not Found" });
    }
  } catch (error) {
    res.json(error);
  }
};

// Delete Hotel And Parking
export const deleteHotelAndParking = async (req, res) => {
  try {
    const result = await HotelandParking.findByIdAndDelete(req.params.id);
    if (result) {
      createNotificationProperty(
        "hotel and parking",
        "Hotel and Parking deleted",
        `Your hotel and parking ${result.hotel_name} is deleted`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "hotel and parking",
          "delete success",
          `A hotel and parking ${result.hotel_name} is deleted.`,
          Date.now(),
          user._id
        );
      });
      return res
        .status(200)
        .json({ message: "Hotel And Parking Deleted Successfully" });
    } else {
      return res.status(404).json({ message: "Hotel And Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get Top 4 Hotel And Parking
export const getTopHotelAndParking = async (req, res) => {
  try {
    const hotels = await HotelandParking.find({ approved: true })
      .sort({ rating: -1 })
      .limit(4);

    if (!hotels) {
      return res.status(404).json({ message: "No hotels found" });
    }

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

// Delete  Hotel  Images
export const deleteHotelImages = async (req, res) => {
  const { link } = req.body;
  const hotel = await HotelandParking.findById(req.params.id);

  // Remove Image from database
  const newPhotos = hotel.hotel_photos.filter((imglink) => imglink !== link);
  hotel.hotel_photos = newPhotos;
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

// Delete  Parking  Images
export const deleteParkingImages = async (req, res) => {
  const { link } = req.body;
  const parking = await HotelandParking.findById(req.params.id);

  // Remove Image from database
  const newPhotos = parking.parking_photos.filter(
    (imglink) => imglink !== link
  );
  parking.parking_photos = newPhotos;
  await parking.save();

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
