import Room from "../models/Room.js";

export const addRoom = async (req, res) => {
  try {
    let room_obj = {};
    //new Date(year, month, day, hours, minutes, seconds, milliseconds)

    if (
      req.body.room_no &&
      req.body.type &&
      req.body.price &&
      req.body.available &&
      req.body.description &&
      req.body.photos
    ) {
      (room_obj.room_no = req.body.room_no),
        (room_obj.type = req.body.type),
        (room_obj.price = req.body.price),
        (room_obj.available = req.body.available),
        (room_obj.description = req.body.description),
        (room_obj.photos = req.body.photos);
    } else {
      return res.status(422).json({ error: "All fields are required! " });
    }

    const exists = await Room.findOne({ room_no: room_obj.room_no });
    if (exists) {
      return res.status(422).json({ error: "Room already exists" });
    }

    const new_room = new Room(room_obj);
    new_room.markModified("reserve_date_start");
    new_room.markModified("reserve_date_end");
    const result = await new_room.save();
    if (result) {
      res.status(201).json({ message: "Room Added Successfully" });
    } else {
      res.status(500).json({ message: "Room Cannot be Added" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getAllRoom = async (req, res) => {
  let result = await Room.find();
  res.send(result);
};
