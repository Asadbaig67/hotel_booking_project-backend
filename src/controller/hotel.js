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
  let hotelRoom = [];

  //To get rooms of hotels
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

  //to combine hotel and its respective rooms
  await Promise.all(
    roomsArr.map(async (hotel, i) => {
      // if (hotel.length > 0)
      hotelRoom = [...hotelRoom, { hotel: cityHotel[i], rooms: hotel }];
    })
  );

  //to check if room is available or not
  await Promise.all(hotelRoom.map(async (hotel) => {}));

  await Promise.all(
    roomsArr.map(async (room) => {
      await Promise.all(
        room.map(async (room) => {
          await Promise.all(
            room.room_no.map(async (roomNo) => {
              await Promise.all(
                roomNo.unavailableDates.map((date) => {
                  // if (date[0] > dates[1] || date[1] < dates[0]) {
                  //   console.log(roomNo.number, "available");
                  // }
                  console.log(date);
                })
              );
              console.log("date 1 end");
            })
          );
        })
      );
    })
  );

  res.send(
    roomsArr
    // `City: ${city} Dates: ${dates} Adult: ${adult} Children: ${children} Single Room: ${singleRoom} Twin Room: ${twinRoom} Family Room: ${familyRoom}`
  );
};
