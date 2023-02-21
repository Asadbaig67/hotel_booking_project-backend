import HotelandParking from "../models/Hotel_Parking.js";

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
      req.body.hotel_city &&
      req.body.hotel_country &&
      req.body.hotel_address &&
      req.body.parking_name &&
      req.body.parking_title &&
      req.body.parking_total_slots &&
      req.body.parking_booked_slots &&
      req.body.parking_description &&
      req.body.parking_photos &&
      req.body.parking_city &&
      req.body.parking_country &&
      req.body.parking_address
    ) {
      // Hotel
      hotel_parking.hotel_name = req.body.hotel_name;
      hotel_parking.hotel_title = req.body.hotel_title;
      hotel_parking.hotel_rating = req.body.hotel_rating;
      hotel_parking.hotel_description = req.body.hotel_description;
      hotel_parking.hotel_photos = req.body.hotel_photos;
      hotel_parking.hotel_city = req.body.hotel_city;
      hotel_parking.hotel_country = req.body.hotel_country;
      hotel_parking.hotel_address = req.body.hotel_address;

      // Parking
      hotel_parking.parking_name = req.body.parking_name;
      hotel_parking.parking_title = req.body.parking_title;
      hotel_parking.parking_total_slots = req.body.parking_total_slots;
      hotel_parking.parking_booked_slots = req.body.parking_booked_slots;
      hotel_parking.parking_description = req.body.parking_description;
      hotel_parking.parking_photos = req.body.parking_photos;
      hotel_parking.parking_city = req.body.parking_city;
      hotel_parking.parking_country = req.body.parking_country;
      hotel_parking.parking_address = req.body.parking_address;
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

// Get all hotels and parking
export const getAllhotelandparkings = async (req, res) => {
  let result = await HotelandParking.find();
  res.send(result);
};

// Get all hotels and parking by city
export const gethotelandparkingbyCity = async (req, res) => {
  let city = req.params.city;
  let result = await HotelandParking.find({ city });
  res.send(result);
};
