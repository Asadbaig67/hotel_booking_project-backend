import cookieSession from "cookie-session";
import Room from "../../models/Room.js";

export const updateRoomDates = async (room, checkIn, checkOut) => {
    const roomExist = await Room.findById(room.RoomId);
    if (!roomExist) return { status: 404, message: "Room not found" };
    const updatedRoomNo = roomExist.room_no.map((singleRoom) => {
        if (singleRoom.number === room.Room_no) {
            return {
                number: singleRoom.number,
                unavailableDates: singleRoom.unavailableDates.filter((date) => {
                    return (date[0] >= checkOut) || (date[1] <= checkIn);

                })
            };
        } else {
            return singleRoom;
        }
    });

    roomExist.room_no = updatedRoomNo;
    const updatedRoom = await roomExist.save();
    return updatedRoom;
}
