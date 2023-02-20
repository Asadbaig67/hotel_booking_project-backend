import Parking from "../models/Parking.js";

export const addParking = async (req, res) => {
  try {
    let parking_obj = {};
    if (
      req.body.name &&
      req.body.title &&
      req.body.total_slots &&
      req.body.booked_slots &&
      req.body.description &&
      req.body.photos &&
      req.body.city &&
      req.body.country &&
      req.body.area
    ) {
      parking_obj.name = req.body.name;
      parking_obj.title = req.body.title;
      parking_obj.total_slots = req.body.total_slots;
      parking_obj.booked_slots = req.body.booked_slots;
      parking_obj.description = req.body.description;
      parking_obj.photos = req.body.photos;
      parking_obj.city = req.body.city;
      parking_obj.country = req.body.country;
      parking_obj.area = req.body.area;
    } else {
      return res.status(422).json({ error: "All fields are required! " });
    }

    //
    const exists = await Parking.findOne({
      name: parking_obj.name,
      city: parking_obj.city,
      area: parking_obj.area,
    });
    if (exists) {
      return res.status(422).json({ error: "Parking already exists" });
    }

    const new_parking = new Parking(parking_obj);

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

export const getAllParking = async (req, res) => {
  let result = await Parking.find();
  res.send(result);
};

export const getParkingByCity = async (req, res) => {
  let city = req.params.city;
  let result = await Parking.findOne({ city });
  res.send(result);
};
