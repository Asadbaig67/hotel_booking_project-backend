import Room from "../models/Room.js";
export const getRoomByHotel = async (cityHotel, roomsArr) => {
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
};
