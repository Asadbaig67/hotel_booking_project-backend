import Room from "../../models/Room.js";

export const getRoomByPrices = async (rooms) => {
  // const roomPrices = {};
  let StandardPrice = 0;

  await Promise.all(
    rooms.map(async (roomId) => {
      try {
        const room = await Room.findById(roomId.toString());
        if (room.type === "Single") {
          StandardPrice = room.price;
        }
      } catch (error) {
        throw new Error(`Error getting room ${roomId}: ${error.message}`);
      }
    })
  );

  return StandardPrice;
};

