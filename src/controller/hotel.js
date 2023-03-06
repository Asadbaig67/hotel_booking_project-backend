import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

export const addHotel = async (req, res) => {
  try {
    let hotel_obj = {};
    if (
      req.body.name &&
      req.body.title &&
      req.body.rating &&
      req.body.desc &&
      req.body.photos &&
      req.body.city &&
      req.body.country &&
      req.body.address
    ) {
      hotel_obj.name = req.body.name;
      hotel_obj.title = req.body.title;
      hotel_obj.rating = req.body.rating;
      hotel_obj.desc = req.body.desc;
      hotel_obj.photos = req.body.photos;
      hotel_obj.city = req.body.city;
      hotel_obj.country = req.body.country;
      hotel_obj.address = req.body.address;
    } else {
      return res.status(422).json({ error: "All fields are required! " });
    }

    //
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

export const getAllHotels = async (req, res) => {
  let result = await Hotel.find();
  res.send(result);
};

export const getHotelByCity = async (req, res) => {
  let city = req.query.city;
  let dates = req.query.dates;
  let adult = req.query.adult;
  let children = req.query.children;
  let singleRoom = req.query.singleRoom;
  let twinRoom = req.query.twinRoom;
  let familyRoom = req.query.familyRoom;
  let cityHotel = await Hotel.find({ city });
  let rooms = [];
  let roomsArr = [];

  await Promise.all(
    cityHotel.map(async (hotel) => {
      await Promise.all(
        hotel.rooms.map(async (room) => {
          const roomData = await Room.findById(room.toString());
          rooms = [...rooms, roomData];
        })
      );
      roomsArr = [...roomsArr, rooms];
    })
  );

  roomsArr.map(async (room) => {
    await room.map(async (room) => {
      room.room_no.map((roomNo) => {
        roomNo.unavailableDates.map((date) => {
          console.log(date);
        });
      });
    });
  });

  res.send(
    roomsArr
    // `City: ${city} Dates: ${dates} Adult: ${adult} Children: ${children} Single Room: ${singleRoom} Twin Room: ${twinRoom} Family Room: ${familyRoom}`
  );
};
