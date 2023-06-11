import Hotel from "../models/Hotel.js";
import HotelAndParking from "../models/Hotel_Parking.js";
import Room from "../models/Room.js";
import path from "path";
import { fileURLToPath } from "url";
import { createNotificationProperty } from "../Functions/Notification/createNotification.js";

export const addRoom = async (req, res) => {
  try {
    const { hotelId, type, price, description, room_no } = req.body;

    if (!hotelId || !type || !price || !description || !room_no) {
      return res.status(422).json({
        error: "All fields are required! ",
        data: {
          hotelId,
          type,
          price,
          description,
          room_no,
        },
      });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(422).json({ error: "Hotel does not exist" });
    }

    const existingRooms = await Room.find({ _id: { $in: hotel.rooms } });
    const existingRoom = existingRooms.find(
      (room) => room.type.toLowerCase() === type.toLowerCase()
    );

    if (existingRoom) {
      existingRoom.price = price;
      existingRoom.description = description;
      // Check if any of the new room numbers already exist in the existing room object
      const newRoomNumbers = room_no.filter((roomNo) => {
        return !existingRoom.room_no.some((room) => room.number === roomNo);
      });

      if (newRoomNumbers.length === 0)
        return res.status(201).json({ error: "Room already exists" });

      // Add only the new room numbers that don't already exist
      newRoomNumbers.forEach((roomNo) => {
        // room_no.forEach((roomNo) => {
        existingRoom.room_no.push({ number: roomNo, unavailableDates: [] });
      });
      // room_no.forEach(roomNo => {
      //   existingRoom.room_no.push({ number: roomNo, unavailableDates: [] });
      // });
      await existingRoom.save();
      return res.status(200).json({ message: "Rooms Added Successfully" });
    }

    const roomObjects = room_no.map((roomNo) => ({
      number: roomNo,
      unavailableDates: [],
    }));
    const newRoom = new Room({
      hotelId,
      type,
      price,
      description,
      room_no: roomObjects,
    });

    const result = await newRoom.save();

    if (!result) {
      return res.status(500).json({ message: "Room Cannot be Added" });
    }

    hotel.rooms.push(newRoom._id);
    await hotel.save();
    createNotificationProperty(
      "Room",
      "New Room Added",
      `New ${type} room added to ${hotel.name}`,
      new Date(),
      hotel.ownerId
    );
    (await User.find({ account_type: "admin" })).forEach((user) => {
      createNotificationProperty(
        "Room",
        "New Room Added",
        `New ${type} room added to ${hotel.name}`,
        Date.now(),
        user._id
      );
    });

    return res.status(201).json({ message: "Rooms Added Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Room Could Not Be Added" });
  }
};

export const addHotelParkingRoom = async (req, res) => {
  try {
    const { hotelId, type, price, description, room_no } = req.body;

    if (!hotelId || !type || !price || !description || !room_no) {
      return res.status(422).json({
        error: "All fields are required! ",
        data: {
          hotelId,
          type,
          price,
          description,
          room_no,
        },
      });
    }

    const hotel = await HotelAndParking.findById(hotelId);

    if (!hotel) {
      return res.status(422).json({ error: "Hotel does not exist" });
    }

    const existingRooms = await Room.find({ _id: { $in: hotel.rooms } });
    const existingRoom = existingRooms.find(
      (room) => room.type.toLowerCase() === type.toLowerCase()
    );

    if (existingRoom) {
      existingRoom.price = price;
      existingRoom.description = description;
      // Check if any of the new room numbers already exist in the existing room object
      const newRoomNumbers = room_no.filter((roomNo) => {
        return !existingRoom.room_no.some((room) => room.number === roomNo);
      });

      if (newRoomNumbers.length === 0)
        return res.status(201).json({ error: "Room already exists" });

      // Add only the new room numbers that don't already exist
      newRoomNumbers.forEach((roomNo) => {
        // room_no.forEach((roomNo) => {
        existingRoom.room_no.push({ number: roomNo, unavailableDates: [] });
      });
      // room_no.forEach(roomNo => {
      //   existingRoom.room_no.push({ number: roomNo, unavailableDates: [] });
      // });
      await existingRoom.save();
      return res.status(200).json({ message: "Rooms Added Successfully" });
    }

    const roomObjects = room_no.map((roomNo) => ({
      number: roomNo,
      unavailableDates: [],
    }));
    const newRoom = new Room({
      hotelId,
      type,
      price,
      description,
      room_no: roomObjects,
    });

    const result = await newRoom.save();

    if (!result) {
      return res.status(500).json({ message: "Room Cannot be Added" });
    }

    hotel.rooms.push(newRoom._id);
    await hotel.save();
    createNotificationProperty(
      "Room",
      "New Room Added",
      `New ${type} room added to ${hotel.name}`,
      new Date(),
      hotel.ownerId
    );
    (await User.find({ account_type: "admin" })).forEach((user) => {
      createNotificationProperty(
        "Room",
        "New Room Added",
        `New ${type} room added to ${hotel.name}`,
        Date.now(),
        user._id
      );
    });

    return res.status(201).json({ message: "Rooms Added Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Room Could Not Be Added" });
  }
};

export const getAllRoom = async (req, res) => {
  let result = await Room.find();
  res.send(result);
};

// Find Room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    console.log(error);
  }
};

// Update Room By Id And Room No
export const updateRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (req.body.type) {
      room.type = req.body.type;
    }
    if (req.body.price) {
      room.price = req.body.price;
    }
    if (req.body.description) {
      room.description = req.body.description;
    }

    if (req.body.room_no) {
      room.room_no = req.body.room_no;
    }

    const result = await room.save();
    if (result) {
      // createNotificationProperty(
      //   "Room",
      //   "Room Updated",
      //   `Room ${room.type} is updated`,
      //   Date.now(),
      //   result._id
      // );
      // (await User.find({ account_type: "admin" })).forEach((user) => {
      //   createNotificationProperty(
      //     "Room",
      //     "New Room Added",
      //     `New ${type} room added to ${hotel.name}`,
      //     Date.now(),
      //     user._id
      //   );
      // });

      res.status(200).json({ message: "Room Updated Successfully" });
    } else {
      res.status(500).json({ message: "Room Cannot be Updated" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Update Room Function
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const { price, description, roomNo } = req.body; // Destructuring Request Body

    const existingRooms = room.room_no.map((room) => room.number);

    const filteredRooms = roomNo.filter(
      (roomNo) => !existingRooms.includes(roomNo)
    );

    // RoomNo is comma separated list of rooms
    let newRoomsArray = filteredRooms.map((number) => ({
      number: number,
      unavailableDates: [],
    }));

    const updateRoom = await Room.findByIdAndUpdate(req.params.id, {
      price,
      description,
      $push: { room_no: { $each: newRoomsArray } },
    });
    if (!updateRoom) {
      return res.status(500).json({ message: "Room Cannot be Updated" });
    }

    return res.status(200).json({ message: "Room Updated Successfully" });
  } catch (error) {
    console.log(error);
  }
};

// Delete Room Numbers
export const deleteRoomNumbers = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const { roomNo } = req.body;

    const filteredRooms = room.room_no.filter(
      ({ number }) => number !== roomNo
    );

    const updateRoom = await Room.findByIdAndUpdate(req.params.id, {
      room_no: filteredRooms,
    });

    if (!updateRoom) {
      throw new Error("Room Cannot be Updated");
    }

    return res.status(200).json({ message: "Room Deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Unavailable Dates
export const updateUnavailableDates = async (req, res) => {
  try {
    // Finding Room By Id
    const room = await Room.findById(req.params.id);
    // Checking Room is available or not
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Updating Room Dates Manually
    let roomFound = false;
    let room_No = req.body.number; // Room No To Be Updated
    for (let i = 0; i < room.room_no.length; i++) {
      const room_no = room.room_no[i];
      if (room_No === room_no.number) {
        room_no.unavailableDates.push(req.body.unavailableDates); // Updating Requested Room Dates
        roomFound = true;
        break; // to exit the loop after the first match
      }
    }
    if (roomFound === false) {
      return res
        .status(404)
        .json({ message: `Room with Room NO:${room_No} does not exist` });
    }

    // Saving New Dates
    const result = await Room.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { room_no: room.room_no } },
      { new: true }
    );

    // Checking Result
    if (result) {
      res
        .status(200)
        .json({ message: "Room Dates Updated Successfully", room: result });
    } else {
      res.status(500).json({ message: "Room Cannot be Updated" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Delete Room By Id (Hotel)
export const deleteRoomByIdFromHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.query.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const room = await Room.findById(req.query.roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    const result = await Room.findByIdAndDelete(req.query.roomId);
    if (result) {
      res.status(200).json({ message: "Room Deleted Successfully" });
      hotel.rooms.pull(req.query.roomId);
      await hotel.save();
    } else {
      res.status(500).json({ message: "Room Cannot be Deleted" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Delete Room By Id (HotelAndParking)
export const deleteRoomByIdFromHotelAndParking = async (req, res) => {
  try {
    const hotel = await HotelAndParking.findById(req.query.hotelAndParkingId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const room = await Room.findById(req.query.roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    const result = await Room.findByIdAndDelete(req.query.roomId);
    if (result) {
      res.status(200).json({ message: "Room Deleted Successfully" });
      hotel.rooms.pull(req.query.roomId);
      await hotel.save();
    } else {
      res.status(500).json({ message: "Room Cannot be Deleted" });
    }
  } catch (error) {
    console.log(error);
  }
};
