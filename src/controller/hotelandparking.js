import HotelandParking from "../models/Hotel_Parking.js";
import Room from "../models/Room.js";

// Add Hotel And Parking Function
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
      req.body.rooms &&
      req.body.hotel_city &&
      req.body.hotel_country &&
      req.body.hotel_address &&
      req.body.parking_name &&
      req.body.parking_title &&
      req.body.parking_total_slots &&
      req.body.parking_description &&
      req.body.parking_photos
    ) {
      // Hotel
      hotel_parking.hotel_name = req.body.hotel_name;
      hotel_parking.hotel_title = req.body.hotel_title;
      hotel_parking.hotel_rating = req.body.hotel_rating;
      hotel_parking.hotel_description = req.body.hotel_description;
      hotel_parking.hotel_photos = req.body.hotel_photos;
      hotel_parking.rooms = req.body.rooms;
      hotel_parking.hotel_city = req.body.hotel_city;
      hotel_parking.hotel_country = req.body.hotel_country;
      hotel_parking.hotel_address = req.body.hotel_address;

      // Parking
      hotel_parking.parking_name = req.body.parking_name;
      hotel_parking.parking_title = req.body.parking_title;
      hotel_parking.parking_total_slots = req.body.parking_total_slots;
      hotel_parking.parking_description = req.body.parking_description;
      hotel_parking.parking_photos = req.body.parking_photos;
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

// Get All Hotels And Parking
export const getAllhotelandparkings = async (req, res) => {
  let result = await HotelandParking.find();
  res.send(result);
};

// Get All Hotel And Parking By City
export const gethotelandparkingbyCity = async (req, res) => {
  let city = req.params.city;
  let result = await HotelandParking.find({ city });
  res.send(result);
};

// Search Hotel And Parking By City Function

export const getHotelAndParkingBySearch = async (req, res) => {

  let hotel_city = req.query.hotel_city;
  let dates = [req.query.checkIn, req.query.checkOut];
  let adult = req.query.adult;
  let children = req.query.children;
  let singleRoom = req.query.singleRoom;
  let twinRoom = req.query.twinRoom;
  let familyRoom = req.query.familyRoom;
  let vehicles = req.query.vehicles;
  let roomsArr = [];
  let hotelRecord = [];
  let hotelData = [];
  let single_hotel_rooms = [];
  let HotelRoomsArray = [];




  const hotels = await HotelandParking.find({ hotel_city });
  if (!hotels) {
    res.status(404).json({ message: "No hotels found" });
  }

  if (hotels) {
    await Promise.all(hotels.map(async (hotel) => {
      let single_hotel_rooms = [];
      for (const room_id of hotel.rooms) {
        const rooms = await Room.findById(room_id.toString());
        if (!rooms) {
          return res.status(404).json({ message: "Room not found" });
        }
        single_hotel_rooms.push(rooms);
      }
      HotelRoomsArray.push(single_hotel_rooms);
    }));
  }

  if (HotelRoomsArray) {
    res.send(HotelRoomsArray);
  }




  // res.status(200).json({ hotels: hotels });

  // await Promise.all(
  //   cityHotel.map(async (hotel, i) => {
  //     try {
  //       const rooms = await Promise.all(
  //         hotel.rooms.map(async (id) => {
  //           return await Room.findById(id.toString());
  //         })
  //       );
  //       roomsArr[i] = [];
  //       rooms.forEach((room) => {
  //         roomsArr[i].push(room);
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   })
  // );

  //to combine hotel and its respective rooms
  // roomsArr.map(async (hotel, i) => {
  //   if (hotel.length > 0)
  //     hotelRecord = [...hotelRecord, { hotel: cityHotel[i], rooms: hotel }];
  // });

  // to check if room is available or not
  // hotelRecord.map((hotel, i) => {
  //   hotelData[i] = {};
  //   hotelData[i].hotel = hotel.hotel;
  //   hotelData[i].rooms = [];
  //   hotel.rooms.map((room, j) => {
  //     hotelData[i].rooms[j] = {};
  //     hotelData[i].rooms[j].room = room;
  //     hotelData[i].rooms[j].room_no = [];
  //     room.room_no.map((roomNo, k) => {
  //       hotelData[i].rooms[j].room_no[k] = {};
  //       hotelData[i].rooms[j].room_no[k].number = roomNo.number;
  //       hotelData[i].rooms[j].room_no[k].unavailableDates = [];
  //       roomNo.unavailableDates.map((date, l) => {
  //         hotelData[i].rooms[j].room_no[k].unavailableDates[l] = date;
  //       });
  //       hotelData[i].rooms[j].room_no[k].available = compareDate(dates, roomNo.unavailableDates);
  //     });
  //   });
  // });

  // console.log(compareDate(dates, hotelRecord[0].rooms[0].room_no[0].unavailableDates));
  // res.send(hotelData);
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

// Delete Hotel And Parking
export const deleteHotelAndParking = async (req, res) => {
  try {
    // const result = await HotelandParking.findOneAndDelete({ _id: req.params.id });
    // if (result) {
    //   res.status(200).json({ message: "Hotel And Parking Deleted Successfully" })
    // }
    // else {
    //   res.status(404).json({ message: "Hotel And Parking Not Found" })
    // }
    res.send("delete");
  } catch (error) {
    console.log(error);
  }
};
