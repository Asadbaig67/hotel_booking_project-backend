import Parking from "../models/Parking.js";
import User from "../models/user.js";
import { fileURLToPath } from "url";
import path from "path";
import { createNotificationProperty } from "../Functions/Notification/createNotification.js";
import fs from 'fs';
// Add Parking Function
export const addParking = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const hotelsLocation = path.join(
      __dirname,
      "..",
      "uploads",
      "ParkingImages"
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
    const photos = fileNames.map(
      (fileName) => `${baseUrl}/uploads/ParkingImages/${fileName}`
    );

    const {
      ownerId,
      name,
      title,
      total_slots,
      description,
      booked_slots,
      city,
      country,
      address,
      price,
      facilities,
    } = req.body;

    if (
      !ownerId ||
      !name ||
      !title ||
      !total_slots ||
      !description ||
      !booked_slots ||
      !city ||
      !country ||
      !address ||
      !price ||
      !facilities
    ) {
      return res
        .status(422)
        .json({ error: "All fields are required! ", data: req.body });
    }

    const exists = await Parking.findOne({
      name,
      city,
    });
    if (exists) {
      return res.status(422).json({ error: "Parking already exists" });
    }

    const new_parking = new Parking({
      ownerId,
      name,
      title,
      total_slots,
      booked_slots,
      description,
      price,
      city,
      country,
      address,
      photos,
      Facilities: facilities
    });

    const result = await new_parking.save();
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking added",
        "Your new parking added",
        Date.now(),
        ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "parking added",
          `A parking has been added`,
          Date.now(),
          user._id
        );
      })
      res.status(201).json({ message: "Parking Added Successfully" });
    } else {
      res.status(500).json({ message: "Parking Cannot be Added" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get All Parking Records Function
export const getAllParking = async (req, res) => {
  let result = await Parking.find();
  try {
    const response = result.filter((item) => item.approved === true);
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Pending Parking Records Function
export const getPendingParking = async (req, res) => {
  let result = await Parking.find();
  try {
    const response = result.filter((item) => item.approved === false);
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Parking By City Function
export const getParkingByCity = async (req, res) => {
  let city = req.params.city;
  try {
    let result = await Parking.find({ city });
    const response = result.filter((item) => item.approved === true);
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.send(response);
  } catch (error) { }
};

// Get Parking By Id Function
export const getParkingById = async (req, res) => {
  let id = req.params.id;
  try {
    let data = await Parking.findById(id);
    // const response = parking.approved === true ? parking : null;
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(data);
  } catch (error) {
    res.json(error);
  }
};

// Get Parking By Owner Id Function
export const getParkingByOwnerId = async (req, res) => {
  let ownerId = req.params.id;
  try {
    const data = await Parking.find({ ownerId });
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(data);
  } catch (error) {
    res.json(error);
  }
};

//Get approved parking by owner id
export const getApprovedParkingByOwnerId = async (req, res) => {
  let ownerId = req.params.id;
  try {
    const data = await Parking.find({ ownerId });
    const response = data.filter((item) => item.approved === true);
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

//Get pending parking by owner id
export const getUnapprovedParkingByOwnerId = async (req, res) => {
  let ownerId = req.params.id;
  try {
    const data = await Parking.find({ ownerId });
    const response = data.filter((item) => item.approved === false);
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Parking By Search Function
export const getParkingBySearch = async (req, res) => {
  let city = req.query.city;
  // let dates = [req.query.checkIn, req.query.checkOut];
  let vehicles = req.query.vehicles;
  let parkingData = [];

  try {
    let parkings = await Parking.find({ city });
    parkings.map((parking, i) => {
      parkingData[i] = {};
      parkingData[i].parking = parking;
      parkingData[i].availableSlots =
        parking.total_slots - parking.booked_slots;
      if (parkingData[i].availableSlots >= vehicles) {
        parkingData[i].available = true;
      } else {
        parkingData[i].available = false;
      }
    });
    parkingData = parkingData.filter((parking) => parking.available === true);
    parkingData = parkingData.filter(
      (parking) => parking.parking.approved === true
    );

    res.status(200).json({ parkingList: parkingData });
  } catch (error) {
    console.log(error);
  }
};

// Update Parking Function
export const updateParking = async (req, res) => {
  try {
    const result = await Parking.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking updated",
        "Your parking updated",
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "parking updated",
          `A parking has been updated`,
          Date.now(),
          user._id
        );
      })
      res.status(200).json({ message: "Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Update Parking New
export const UpdateParkingNew = async (req, res) => {

  try {

    let photos = [];

    if (req.files && Object.keys(req.files).length !== 0) {

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const hotelsLocation = path.join(
        __dirname,
        "..",
        "uploads",
        "ParkingImages"
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
        (fileName) => `${baseUrl}/uploads/ParkingImages/${fileName}`
      );
    }


    const {
      name,
      title,
      total_slots,
      description,
      booked_slots,
      city,
      country,
      address,
      price,
      facilities,
    } = req.body;

    if (
      !name ||
      !title ||
      !total_slots ||
      !description ||
      !booked_slots ||
      !city ||
      !country ||
      !address ||
      !price ||
      !facilities
    ) {
      return res
        .status(422)
        .json({ error: "All fields are required! ", data: req.body });
    }

    // const exists = await Parking.findOne({
    //   name,
    //   city,
    // });
    // if (exists) {
    //   return res.status(422).json({ error: "Parking already exists" });
    // }

    const new_parking = new Parking({
      ownerId,
      name,
      title,
      total_slots,
      booked_slots,
      description,
      price,
      city,
      country,
      address,
      photos,
      Facilities: facilities
    });

    const Updated_parking = await Parking.findByIdAndUpdate(req.params.id, {
      name,
      title,
      total_slots,
      booked_slots,
      description,
      price,
      city,
      country,
      address,
      ...(photos.length > 0 && { $push: { photos: { $each: photos } } }),
      $addToSet: { Facilities: { $each: facilities } },
      // Facilities: facilities

    }, { new: true });

    // const result = await Updated_parking.save();
    if (Updated_parking) {
      // createNotificationProperty(
      //   "Parking",
      //   "Parking added",
      //   "Your new parking added",
      //   Date.now(),
      //   ownerId
      // );
      // (await User.find({ account_type: "admin" })).forEach((user) => {
      //   createNotificationProperty(
      //     "Parking",
      //     "parking added",
      //     `A parking has been added`,
      //     Date.now(),
      //     user._id
      //   );
      // })
      res.status(201).json({ message: "Parking Added Successfully" });
    } else {
      res.status(500).json({ message: "Parking Cannot be Added" });
    }
  } catch (error) {
    console.log(error);
  }

}

// Update Parking Booked Slots Function
export const updateParkingBookedSlots = async (req, res) => {
  try {
    const parking = await Parking.findOne({ _id: req.params.id });
    if (parking) {
      if (parking.booked_slots >= parking.total_slots) {
        return res.status(422).json({ error: "Parking is full" });
      }
    }

    const result = await Parking.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { booked_slots: 1 } },
      { new: true }
    );
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking slots updated",
        "Your parking slots updated",
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "parking slots added",
          `A parking slots has been updated`,
          Date.now(),
          user._id
        );
      })
      res.status(200).json({ message: "Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Update Parking Approved Function
export const approveParking = async (req, res) => {
  const data = await Parking.findById(req.params.id);
  try {
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    if (data.approved)
      return res.status(422).json({ message: "Parking Already Approved" });

    const result = await Parking.findOneAndUpdate(
      { _id: req.params.id },
      { approved: true },
      { new: true }
    );

    if (result) {
      const { ownerId } = data;
      if (!ownerId) {
        await Parking.findByIdAndUpdate(
          req.params.id,
          { approved: false },
          { new: true }
        );
        return res.status(404).json({ message: "Owner Not Found" });
      }
      const user = await User.findById(ownerId);
      if (!user) return res.status(404).json({ message: "User Not Found" });
      user.partner_type = "Parking";
      user.account_type = "partner";
      await user.save();
    }
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking approved",
        "Your parking approved",
        Date.now(),
        data.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "parking approved",
          `A parking has been approved`,
          Date.now(),
          user._id
        );
      })
      res.status(200).json({ message: "Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Delete Parking Function
export const deleteParking = async (req, res) => {
  try {
    const result = await Parking.findOneAndDelete({ _id: req.params.id });
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking deleted",
        "Your new parking deleted",
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "parking added",
          `A parking has been deleted`,
          Date.now(),
          user._id
        );
      })
      res.status(200).json({ message: "Parking Deleted Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Delete  Parking  Images
export const deleteParkingImages = async (req, res) => {

  const { link } = req.body;
  const parking = await Parking.findById(req.params.id);

  // Remove Image from database
  const newPhotos = parking.photos.filter(imglink => imglink !== link);
  parking.photos = newPhotos;
  await parking.save();

  // Remove Image from Disk Storage
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const linkarray = link.split('/');
  // Delete Image from location
  const filename = linkarray[linkarray.length - 1];
  const filePath = path.join(__dirname, '../uploads/HotelImages', filename);
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete file.' });
      }

      // File deletion successful
      return res.status(200).json({ message: 'File deleted successfully.' });
    });
  } else {
    return res.status(404).json({ error: 'File not found.' });
  }

};