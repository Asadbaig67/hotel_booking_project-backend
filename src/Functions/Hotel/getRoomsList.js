import { compareDate } from "./CompareDate.js";

export const getRoomsList = (roomData, dates) => {

   let room_no = roomData.room_no;
   let roomObj = {
      id: roomData._id,
      price: roomData.price,
      type: roomData.type,
      rooms_list: []
   }

   room_no.forEach((room, index) => {

      const result = compareDate(dates, room.unavailableDates);
      if (result === true) {
         roomObj.rooms_list.push(room.number);
      }

   });

   return roomObj;

}