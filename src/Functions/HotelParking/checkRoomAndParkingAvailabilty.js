// import { compareDate } from "../Hotel/CompareDate.js";
// export const checkRoomAndParkingAvailability = (hotelRecord, dates) => {
//   const hotelData = [];
//   hotelRecord.map((hotel, i) => {
//     hotelData[i] = {};
//     hotelData[i].hotel = hotel.hotel;
//     hotelData[i].parking =
//       hotel.hotel.parking_total_slots - hotel.hotel.parking_booked_slots;
//     hotelData[i].rooms = [];
//     hotel.rooms.map((room, j) => {
//       hotelData[i].rooms[j] = {};
//       hotelData[i].rooms[j].room = room;
//       hotelData[i].rooms[j].room_no = [];
//       room.room_no.map((roomNo, k) => {
//         hotelData[i].rooms[j].room_no[k] = {};
//         hotelData[i].rooms[j].room_no[k].number = roomNo.number;
//         hotelData[i].rooms[j].room_no[k].unavailableDates = [];
//         roomNo.unavailableDates.map((date, l) => {
//           hotelData[i].rooms[j].room_no[k].unavailableDates[l] = date;
//         });
//         hotelData[i].rooms[j].room_no[k].available = compareDate(
//           dates,
//           roomNo.unavailableDates
//         );
//       });
//     });
//   });
//   return hotelData;
// };

// previous version

import { compareDate } from "../Hotel/CompareDate.js";
export const checkRoomAndParkingAvailability = (hotelRecord, dates) => {
  const hotelData = [];
  hotelRecord.map((hotel, i) => {
    hotelData[i] = {};
    hotelData[i].hotel = hotel.hotel;
    hotelData[i].parking =
      hotel.hotel.parking_total_slots - hotel.hotel.parking_booked_slots;
    hotelData[i].rooms = [];
    hotel.rooms.map((room, j) => {
      hotelData[i].rooms[j] = {};
      hotelData[i].rooms[j].room = room;
      hotelData[i].rooms[j].room_no = [];
      room.room_no.map((roomNo, k) => {
        hotelData[i].rooms[j].room_no[k] = {};
        hotelData[i].rooms[j].room_no[k].number = roomNo.number;
        hotelData[i].rooms[j].room_no[k].unavailableDates = [];
        roomNo.unavailableDates.map((date, l) => {
          hotelData[i].rooms[j].room_no[k].unavailableDates[l] = date;
        });
        hotelData[i].rooms[j].room_no[k].available = compareDate(
          dates,
          roomNo.unavailableDates
        );
      });
    });
  });
  return hotelData;
};

