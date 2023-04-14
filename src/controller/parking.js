import Parking from "../models/Parking.js";
import { fileURLToPath } from 'url';
import path from 'path';

// Add Parking Function
export const addParking = async (req, res) => {
  try {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const hotelsLocation = path.join(__dirname, '..', 'uploads', 'ParkingImages');



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

    const baseUrl = 'http://localhost:5000';
    const photos = fileNames.map(fileName => `${baseUrl}/uploads/ParkingImages/${fileName}`);

    const { ownerId, name, title, total_slots, description, booked_slots, city, country, address, price } = req.body;

    if (!ownerId || !name || !title || !total_slots || !description || !booked_slots || !city || !country || !address || !price) {
      return res.status(422).json({ error: "All fields are required! ", data: req.body });
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
      photos
    });

    const result = await new_parking.save();
    if (result) {
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
    let parking = await Parking.findById(id);
    // const response = parking.approved === true ? parking : null;
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(data);
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
      res.status(200).json({ message: "Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

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
      res.status(200).json({ message: "Parking Deleted Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};
