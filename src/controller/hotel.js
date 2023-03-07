import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

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

export const getHotelByCity = async (req, res) => {
  let city = req.query.city;
  let dates = req.query.dates;
  let adult = req.query.adult;
  let children = req.query.children;
  let singleRoom = req.query.singleRoom;
  let twinRoom = req.query.twinRoom;
  let familyRoom = req.query.familyRoom;
  let roomsArr = [];
  let hotelRecord = [];
  let hotelData = [];
  let cityHotel = await Hotel.find({ city });

  //To get rooms of hotels
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

  const compareDate = (userdate, booked_dates) => {
    booked_dates.map((singleDate) => {
      const userStart = userdate[0];
      const userEnd = userdate[1];
      const bookedStart = singleDate[0];
      const bookedEnd = singleDate[1];

      if (
        (userStart >= bookedStart && userStart <= bookedEnd) ||
        (userEnd >= bookedStart && userEnd <= bookedEnd)
      ) {
        console.log(
          userdate,
          "Date is already booked for the date",
          singleDate
        );
      } else {
        console.log(userdate, "Date is availble for the date", singleDate);
      }

      // if ((new Date(userdate[0]) >= new Date(singleDate[0]) && new Date(userdate[0]) <= new Date(singleDate[1])) || (new Date(userdate[1]) >= new Date(singleDate[0]) && new Date(userdate[1]) <= new Date(singleDate[1]))) {
      //     console.log(userdate, 'Date is already booked for the date', singleDate);
      // } else {
      //     console.log(userdate, 'Date is availble for the date', singleDate);
      // }
    });
  };

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

  res.send(hotelData);
};

// Update Parking
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

// Delete Parking
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
