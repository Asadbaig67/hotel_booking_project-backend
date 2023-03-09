import Room from "../models/Room.js";

export const addRoom = async (req, res) => {
  try {
    let room_obj = {};
    //new Date(year, month, day, hours, minutes, seconds, milliseconds)

    if (
      req.body.type &&
      req.body.price &&
      req.body.description &&
      req.body.photos &&
      req.body.room_no
    ) {
      (room_obj.type = req.body.type),
        (room_obj.price = req.body.price),
        (room_obj.description = req.body.description),
        (room_obj.photos = req.body.photos),
        (room_obj.room_no = req.body.room_no);
    } else {
      return res.status(422).json({ error: "All fields are required! " });
    }

    // const exists = await Room.findOne({ room_no: room_obj.room_no });
    // if (exists) {
    //   return res.status(422).json({ error: "Room already exists" });
    // }

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
  let userStart = new Date('2023-03-05');
  let userEnd = new Date('2023-03-09');

  result.map((room) => {
    console.log(` Room Type : ${room.type} `);
    room.room_no.map((room_no) => {
      console.log(`Room No: ${room_no.number}`);
      room_no.unavailableDates.map((date) => {
        if ((userStart >= date[0] && userStart <= date[1]) || (userEnd >= date[0] && userEnd <= date[1]) || (userStart <= date[0] && userEnd >= date[1])) {
          console.log(`Room No: ${room_no.number} is booked for ${date} and is not available for ${userStart} to ${userEnd}`);
        } else {
          console.log(`Room No: ${room_no.number} is available for ${userStart} to ${userEnd}`);
        }
      });
    });
  });

  res.send(result);
};
