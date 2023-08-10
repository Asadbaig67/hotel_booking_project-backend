export const checkHotelAvailability = (
  hotelData,
  singleRoom,
  twinRoom,
  familyRoom,
  room_available
) => {
  hotelData.map((hotel) => {
    hotel.rooms.map((room) => {
      room.room_no = room.room_no.filter((roomNo) => roomNo.available);

      if (
        (room.room.type === "Single" &&
          singleRoom > 0 &&
          room.room_no.length < singleRoom) ||
        (room.room.type === "Twin" &&
          twinRoom > 0 &&
          room.room_no.length < twinRoom) ||
        (room.room.type === "Family" &&
          familyRoom > 0 &&
          room.room_no.length < familyRoom)
      ) {
        room.room_no = [];
      }
    });
    hotel.rooms = hotel.rooms.filter((room) => room.room_no.length > 0);

    if (singleRoom > 0) {
      hotel.rooms.map((roomData) => {
        if (roomData.room.type === "Single") {
          room_available[0] = true;
        }
      });
      if (room_available[0] === false) {
        hotel.rooms = [];
      }
    }
    if (twinRoom > 0) {
      hotel.rooms.map((roomData) => {
        if (roomData.room.type === "Twin") {
          room_available[1] = true;
        }
      });
      if (room_available[1] === false) {
        hotel.rooms = [];
      }
    }
    if (familyRoom > 0) {
      hotel.rooms.map((roomData) => {
        if (roomData.room.type === "Family") {
          room_available[2] = true;
        }
      });
      if (room_available[2] === false) {
        hotel.rooms = [];
      }
    }
    room_available.fill(false);
  });
  return hotelData;
};
