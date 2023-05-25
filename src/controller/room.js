import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import path from "path";
import { fileURLToPath } from "url";
import { createNotification } from "../Functions/Notification/createNotification.js";

export const addRoom = async (req, res) => {
  // try {

  // if (!req.files || Object.keys(req.files).length === 0) {
  //   return res.status(400).json({ error: "No files were uploaded." });
  // }

  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);
  // const roomslocation = path.join(__dirname, "..", "uploads", "RoomImages");

  // const files = Object.values(req.files).flat();
  // const fileNames = [];
  // for (let i = 0; i < files.length; i++) {
  //   const file = files[i];
  //   const fileName = file.name.replace(/\s+/g, '');
  //   fileNames.push(fileName);
  //   const filePath = path.join(roomslocation, fileName);
  //   // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
  //   await file.mv(filePath);
  // }

  // const baseUrl = "http://localhost:5000";
  // const photos = fileNames.map((fileName) => `${baseUrl}/uploads/RoomImages/${fileName}`);

  //   let { hotelId, type, price, description, room_no, } = req.body;

  //   if (!type || !price || !description || !room_no) {
  //     return res.status(422).json({ error: "All fields are required! " });
  //   }

  //   const getHotel = await Hotel.findById(hotelId);

  //   if (!getHotel) {
  //     return res.status(422).json({ error: "Hotel does not exist" });
  //   }

  //   const roomsArray = getHotel.rooms;
  //   if (roomsArray) {
  //     try {
  //       await Promise.all(roomsArray.map(async (roomId) => {
  //         const roomExists = await Room.findById(roomId);
  //         if (roomExists.type.toLowerCase() === type.toLowerCase()) {
  //           for (const roomNo of room_no) {
  //             roomExists.room_no.push({ number: roomNo, unavailableDates: [] });
  //           }
  //           await roomExists.save();
  //         }
  //       }));
  //     } catch (err) {
  //       console.error(err);
  //       return res.status(400).json({ error: "Room Could Not Be Added" })
  //     }
  //   } else {

  //     // const exists = await Room.findOne({ type: type });
  //     // if (exists) {
  //     //   return res.status(422).json({ error: "Room already exists" });
  //     // }

  //     // Converting Rooms Array to Object with Room No and Unavailable Dates 
  //     room_no = room_no.map((roomNo) => {
  //       return { number: roomNo, unavailableDates: [] };
  //     });

  //     const new_room = new Room({
  //       hotelId,
  //       type,
  //       price,
  //       description,
  //       room_no,
  //     });

  //     const result = await new_room.save();

  //     if (!result) {
  //       return res.status(500).json({ message: "Room Cannot be Added" });
  //     }
  //     // Add New Room to Its Hotel And Save
  //     const hotel = await Hotel.findById(hotelId);
  //     hotel.rooms.push(new_room._id);
  //     await hotel.save();

  //     return res.status(201).json({ message: "Rooms Added Successfully" });
  //   }

  // } catch (error) {
  //   console.log(error);
  // }

  try {

    const { hotelId, type, price, description, room_no } = req.body;

    if (!hotelId || !type || !price || !description || !room_no) {
      return res.status(422).json({
        error: "All fields are required! ", data: {
          hotelId, type, price, description, room_no

        }
      });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(422).json({ error: "Hotel does not exist" });
    }

    const existingRooms = await Room.find({ _id: { $in: hotel.rooms } });
    const existingRoom = existingRooms.find(room => room.type.toLowerCase() === type.toLowerCase());

    if (existingRoom) {
      existingRoom.price = price;
      existingRoom.description = description;
      // Check if any of the new room numbers already exist in the existing room object
      const newRoomNumbers = room_no.filter(roomNo => {
        return !existingRoom.room_no.some(room => room.number === roomNo);
      });

      if (newRoomNumbers.length === 0) return res.status(201).json({ error: "Room already exists" });

      // Add only the new room numbers that don't already exist
      newRoomNumbers.forEach(roomNo => {
        existingRoom.room_no.push({ number: roomNo, unavailableDates: [] });
      });
      // room_no.forEach(roomNo => {
      //   existingRoom.room_no.push({ number: roomNo, unavailableDates: [] });
      // });
      await existingRoom.save();
      return res.status(200).json({ message: "Rooms Added Successfully" });
    }

    const roomObjects = room_no.map(roomNo => ({ number: roomNo, unavailableDates: [] }));
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

    return res.status(201).json({ message: "Rooms Added Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Room Could Not Be Added" });
  }


};

export const getAllRoom = async (req, res) => {
  let result = await Room.find();
  // let userStart = new Date('2023-03-05');
  // let userEnd = new Date('2023-03-09');

  // result.map((room) => {
  //   console.log(` Room Type : ${room.type} `);
  //   room.room_no.map((room_no) => {
  //     console.log(`Room No: ${room_no.number}`);
  //     room_no.unavailableDates.map((date) => {
  //       if ((userStart >= date[0] && userStart <= date[1]) || (userEnd >= date[0] && userEnd <= date[1]) || (userStart <= date[0] && userEnd >= date[1])) {
  //         console.log(`Room No: ${room_no.number} is booked for ${date} and is not available for ${userStart} to ${userEnd}`);
  //       } else {
  //         console.log(`Room No: ${room_no.number} is available for ${userStart} to ${userEnd}`);
  //       }
  //     });
  //   });
  // });

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
      createNotification(
        "Room",
        "Room Updated",
        `Room ${room.type} has been updated`,
        Date.now(),
        result._id
      );
      res.status(200).json({ message: "Room Updated Successfully" });
    } else {
      res.status(500).json({ message: "Room Cannot be Updated" });
    }
  } catch (error) {
    console.log(error);
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
