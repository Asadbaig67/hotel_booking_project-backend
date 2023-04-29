import cookieSession from "cookie-session";
import Room from "../../models/Room.js";

// export const updateRoomDates = async (room, checkIn, checkOut) => {
//     const roomExist = await Room.findbyId(room.RoomId);
//     if (!roomExist) return { status: 404, message: "Room not found" };

//     // Find Room No in that room and filter the dates
//     const newRoomArray = roomExist.room_no.map((singleRoom) => {
//         if (singleRoom.number === room.Room_no) {
//             return singleRoom.unavailableDates.filter((date) => {
//                 return (date[0] === checkIn) && (date[1] === checkOut);
//             });
//         }
//     })

//     const updatedRoom = await newRoomArray.save();

// }
export const updateRoomDates = async (room, checkIn, checkOut) => {
    const roomExist = await Room.findById(room.RoomId);
    if (!roomExist) return { status: 404, message: "Room not found" };

    // console.log("Previsus Array = ", roomExist.room_no);
    // Find Room No in that room and filter the dates
    const updatedRoomNo = roomExist.room_no.map((singleRoom) => {
        if (singleRoom.number === room.Room_no) {
            return {
                number: singleRoom.number,
                unavailableDates: singleRoom.unavailableDates.filter((date) => {
                    // return (date[0] !== checkIn) || (date[1] !== checkOut);
                    return (date[0] >= checkOut) || (date[1] <= checkIn);

                })
            };
        } else {
            return singleRoom;
        }
    });

    // console.log("Updated Room Number = ", updatedRoomNo);
    roomExist.room_no = updatedRoomNo;
    const updatedRoom = await roomExist.save();
    return updatedRoom;
}
