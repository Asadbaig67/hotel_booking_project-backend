export const compareDate = (userdate, booked_dates) => {
  //
  let room_available = true;
  const userStart = new Date(userdate[0]);
  const userEnd = new Date(userdate[1]);
  
  // Using for loop to check if user date is in between booked dates or not so that we can break the loop if we get false value
  for (let i = 0; i < booked_dates.length; i++) {
    const bookedStart = booked_dates[i][0];
    const bookedEnd = booked_dates[i][1];

    if (
      (userStart >= bookedStart && userStart <= bookedEnd) ||
      (userEnd >= bookedStart && userEnd <= bookedEnd) ||
      (userStart <= bookedStart && userEnd >= bookedEnd)
    ) {
      room_available = false;
      break;
    }
  }

  return room_available;
};
