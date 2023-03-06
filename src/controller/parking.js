import Parking from "../models/Parking.js";

export const addParking = async (req, res) => {
  try {
    let parking_obj = {};
    if (
      req.body.name &&
      req.body.title &&
      req.body.total_slots &&
      req.body.description &&
      req.body.photos &&
      req.body.city &&
      req.body.country &&
      req.body.address
    ) {
      parking_obj.name = req.body.name;
      parking_obj.title = req.body.title;
      parking_obj.total_slots = req.body.total_slots;
      parking_obj.description = req.body.description;
      parking_obj.photos = req.body.photos;
      parking_obj.city = req.body.city;
      parking_obj.country = req.body.country;
      parking_obj.address = req.body.address;
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

export const updateParking = async (req, res) => {

  try {
    const result = await Parking.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
    if (result) {
      res.status(200).json({ message: "Parking Updated Successfully" })
    }
    else {
      res.status(404).json({ message: "Parking Not Found" })
    }
  } catch (error) {
    console.log(error);

  }


}

export const deleteParking = async (req, res) => {
  try {
    const result = await Parking.findOneAndDelete({ _id: req.params.id });
    if (result) {
      res.status(200).json({ message: "Parking Deleted Successfully" })
    }
    else {
      res.status(404).json({ message: "Parking Not Found" })
    }
  } catch (error) {
    console.log(error);

  }

}