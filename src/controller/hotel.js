import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// Add Hotel Function
export const addHotel = async (req, res) => {
  try {
    let hotel_obj = {};
    if (
      req.body.name &&
      req.body.title &&
      req.body.rating &&
      req.body.description &&
      req.body.photos &&
      req.body.city &&
      req.body.country &&
      req.body.address
    ) {
      hotel_obj.name = req.body.name;
      hotel_obj.title = req.body.title;
      hotel_obj.rating = req.body.rating;
      hotel_obj.description = req.body.description;
      hotel_obj.photos = req.body.photos;
      hotel_obj.city = req.body.city;
      hotel_obj.country = req.body.country;
      hotel_obj.address = req.body.address;
    } else {
      return res.status(422).json({ error: "All fields are required! " });
    }

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

// Get All Hotels List Function
export const getAllHotels = async (req, res) => {
  let result = await Hotel.find();
  res.send(result);
};

// const giveRoom = async (idArray, i) => {
//   let result = [];
//   let bhari = false;

//   if (idArray.length > 0) {
//     await Promise.all(
//       idArray.map(async (id) => {
//         result = [...result, await Room.findById(id.toString())];
//         console.log("result", i, result);
//       })
//     );
//   }

//   return result;
// };

// Dates Comparison Function
const compareDate = (userdate, booked_dates) => {
  //
  let room_available = true;
  const userStart = new Date(userdate[0]);
  const userEnd = new Date(userdate[1]);

  // Using for loop to check if user date is in between booked dates or not so that we can break the loop if we get false value
  for (let i = 0; i < booked_dates.length; i++) {
    const bookedStart = booked_dates[i][0];
    const bookedEnd = booked_dates[i][1];

    if (
      (userStart >= bookedStart && userStart <= bookedEnd) ||
      (userEnd >= bookedStart && userEnd <= bookedEnd) ||
      (userStart <= bookedStart && userEnd >= bookedEnd)
    ) {
      room_available = false;
      break;
    }
  }

  return room_available;
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
  let roomsArr = [];
  let hotelRecord = [];
  let hotelData = [];

  
  let cityHotel = await Hotel.find({ city });

  await Promise.all(
    cityHotel.map(async (hotel, i) => {
      try {
        const rooms = await Promise.all(
          hotel.rooms.map(async (id) => {
            return await Room.findById(id.toString());
          })
        );
        roomsArr[i] = [];
        rooms.forEach((room) => {
          roomsArr[i].push(room);
        });
      } catch (error) {
        console.log(error);
      }
    })
  );

  //to combine hotel and its respective rooms
  roomsArr.map(async (hotel, i) => {
    if (hotel.length > 0)
      hotelRecord = [...hotelRecord, { hotel: cityHotel[i], rooms: hotel }];
  });

  //to check if room is available or not
  hotelRecord.map((hotel, i) => {
    hotelData[i] = {};
    hotelData[i].hotel = hotel.hotel;
    hotelData[i].rooms = [];
    hotel.rooms.map((room, j) => {
      hotelData[i].rooms[j] = {};
      hotelData[i].rooms[j].room = room;
      hotelData[i].rooms[j].room_no = [];
      room.room_no.map((roomNo, k) => {
        hotelData[i].rooms[j].room_no[k] = {};
        hotelData[i].rooms[j].room_no[k].number = roomNo.number;
        hotelData[i].rooms[j].room_no[k].unavailableDates = [];
        roomNo.unavailableDates.map((date, l) => {
          hotelData[i].rooms[j].room_no[k].unavailableDates[l] = date;
        });
        hotelData[i].rooms[j].room_no[k].available = compareDate(
          dates,
          roomNo.unavailableDates
        );
      });
    });
  });

  hotelData.map((hotel) => {
    hotel.rooms.map((room) => {
      room.room_no = room.room_no.filter((roomNo) => roomNo.available);
    });
    hotel.rooms = hotel.rooms.filter((room) => room.room_no.length > 0);
    hotel.rooms = hotel.rooms.filter(
      (roomData) =>
        (roomData.room.type === "Single" &&
          roomData.room_no.length >= singleRoom) ||
        (roomData.room.type === "Twin" &&
          roomData.room_no.length >= twinRoom) ||
        (roomData.room.type === "Family" &&
          roomData.room_no.length >= familyRoom)
    );

    // hotel.rooms = hotel.rooms.filter(
    //   (roomData) =>
    //     (singleRoom && roomData.room.type === "Single") &&
    //     (twinRoom && roomData.room.type === "Twin") &&
    //     (familyRoom && roomData.room.type === "Family")
    // );
  });

  hotelData.filter((hotel) => hotel.rooms.length > 0);

  res.send(hotelData);
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
