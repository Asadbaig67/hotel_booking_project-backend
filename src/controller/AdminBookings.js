import AdminBookings from "../models/AdminBookings.js";
import Hotel from "../models/Hotel.js";
import HotelandParking from "../models/Hotel_Parking.js";
import Parking from "../models/Parking.js";
import { SendEmail } from "../Functions/Emails/SendEmail.js";
import { updateunavailabledates } from "../Functions/Booking/UpdateUnavailableDates.js";


// POST API FUNCTIONS

export const AddHotelBooking = async (req, res) => {

  const { hotelId, name, email, phone, checkIn, checkOut, rooms, adults, childrens, total_price } = req.body;

  console.log(hotelId);
  const newHotelBooking = new AdminBookings({
    hotelId: hotelId,
    user_info: {
      name,
      email,
      phone_number: phone,
    },
    persons: {
      adults,
      childrens,
    },
    dates: {
      check_in: checkIn,
      check_out: checkOut,
    },
    booked_rooms: rooms,
    booking_type: "hotel",
    total_price,
    created_at: new Date().toISOString(),
  });

  try {
    const success = await newHotelBooking.save();
    if (!success) {
      return res.status(500).json({ error: "Error while saving hotel booking" });
    }

    // On Successful Booking Make API Request To Update The Rooms That Have Been Reserved In This Booking
    try {
      const result = await updateunavailabledates(rooms, checkIn, checkOut);

      // If Any Of The Rooms Failed To Update, Send Error
      if (!result.some((result) => result)) {
        // Delete the record that was saved
        await newHotelBooking.deleteOne();
        return res.status(400).json({ msg: "Booking ==> Failed" });
      }
    } catch (updateError) {
      // Delete the record that was saved
      await newHotelBooking.deleteOne();
      return res.status(500).json({ error: "Error while updating unavailable dates", message: updateError.message });
    }

    const hotel = await Hotel.findById(hotelId);
    try {
      await SendEmail({
        name,
        email,
        subject: "Booking Confirmation",
        message: `Your booking has been confirmed. Your booking details are as follows: </br>
              Hotel Name: ${hotel.name} 
              Check In: ${checkIn} 
              Check Out: ${checkOut} 
              Room(s): ${rooms.map((r) => r.Room_no)} 
              Total Price: ${total_price} 
              `,
      });

      return res.status(200).json({ msg: "Booking ==> Successful", result: success });
    } catch (error) {
      // Delete the record that was saved
      await newHotelBooking.deleteOne();
      return res.status(500).json({ error: "Error while sending email", message: error.message });
    }
  } catch (error) {
    await newHotelBooking.deleteOne();
    return res.status(409).json({ error: "Error In Saving", message: error.message });
  }



};

export const AddParkingBooking = async (req, res) => {

  const { parkingId, name, email, phone, checkIn, checkOut, parking_info, total_price } = req.body;

  const newParkingBooking = new AdminBookings({
    parkingId,
    user_info: {
      name,
      email,
      phone_number: phone,
    },
    dates: {
      check_in: checkIn,
      check_out: checkOut,
    },
    parking_info,
    booking_type: "parking",
    total_price,
    created_at: new Date().toISOString(),
  });

  try {
    const success = await newParkingBooking.save();
    if (!success) {
      console.log("Issue Is Here 0");
      return res.status(500).json({ error: "Error while saving hotel booking" });
    }

    const Existing_parking = await Parking.findByIdAndUpdate(
      parkingId,
      { $inc: { booked_slots: parking_info.booked_slots } },
      { new: true }
    );
    if (!Existing_parking) {
      return res.status(409).json({ message: "Error Occured Booking Denied!" });
    }

    // const parking = await Parking.findById(parkingId);
    try {

      await SendEmail({
        name,
        email,
        subject: "Booking Confirmation",
        message: `Your booking has been confirmed. Your booking details are as follows:
        Parking Name: ${Existing_parking.name} \n
        Check In: ${checkIn} \n
        Check Out: ${checkOut} \n
        Total Slots: ${parking_info.booked_slots} \n
        Total Price: ${total_price} \n
        `,
      });

      return res.status(200).json({ msg: "Booking ==> Successful", result: success });
    } catch (error) {
      // Delete the record that was saved
      await newParkingBooking.deleteOne();
      console.log("Issue Is Here 1");
      return res.status(500).json({ error: "Error while sending email", message: error.message });
    }
  } catch (error) {
    await newParkingBooking.deleteOne();
    return res.status(409).json({ error: "Error In Saving", message: error.message });
  }

};

export const AddHotelAndParkingBooking = async (req, res) => {

  const { hotelAndParkingId, name, email, phone, checkIn, checkOut, rooms, adults, childrens, parking_info, total_price } = req.body;

  const newHotelBooking = new AdminBookings({
    hotelAndParkingId,
    user_info: {
      name,
      email,
      phone_number: phone,
    },
    persons: {
      adults,
      childrens,
    },
    dates: {
      check_in: checkIn,
      check_out: checkOut,
    },
    booked_rooms: rooms,
    booking_type: "hotelandparking",
    parking_info,
    total_price,
    created_at: new Date().toISOString(),
  });

  try {
    const success = await newHotelBooking.save();
    if (!success) {
      return res.status(500).json({ error: "Error while saving hotel and parking booking" });
    }

    // On Successful Booking Make API Request To Update The Rooms That Have Been Reserved In This Booking
    try {
      const result = await updateunavailabledates(rooms, checkIn, checkOut);

      // If Any Of The Rooms Failed To Update, Send Error
      if (!result.some((result) => result)) {
        // Delete the record that was saved
        await newHotelBooking.deleteOne();
        return res.status(400).json({ msg: "Booking ==> Failed" });
      }
    } catch (updateError) {
      // Delete the record that was saved
      await newHotelBooking.deleteOne();
      return res.status(500).json({ error: "Error while updating unavailable dates", message: updateError.message });
    }

    const hotel = await HotelandParking.findById(hotelAndParkingId);
    try {
      await SendEmail({
        name,
        email,
        subject: "Booking Confirmation",
        message: `Your booking has been confirmed. Your booking details are as follows: </br>
              Hotel Name: ${hotel.hotel_name} 
              Check In: ${checkIn} 
              Check Out: ${checkOut} 
              Room(s): ${rooms.map((r) => r.Room_no)} 
              Total Price: ${total_price} 
              `,
      });

      return res.status(200).json({ msg: "Booking ==> Successful", result: success });
    } catch (error) {
      // Delete the record that was saved
      await newHotelBooking.deleteOne();
      return res.status(500).json({ error: "Error while sending email", message: error.message });
    }
  } catch (error) {
    await newHotelBooking.deleteOne();
    return res.status(409).json({ error: "Error In Saving", message: error.message });
  }




};


// GET API FUNCTIONS
export const GetHotelBookings = async (req, res) => {
};

export const GetParkingBookings = async (req, res) => {
};

export const GetHotelAndParkingBookings = async (req, res) => {
};

export const GetHotelBookingById = async (req, res) => {
};

export const GetParkingBookingById = async (req, res) => {
};

export const GetHotelAndParkingBookingById = async (req, res) => {
};

// PUT API FUNCTIONS
export const UpdateHotelBookingById = async (req, res) => {
}

export const UpdateParkingBookingById = async (req, res) => {
}

export const UpdateHotelAndParkingBookingById = async (req, res) => {

}

// DELETE API FUNCTIONS
export const DeleteHotelBookingById = async (req, res) => {
}

export const DeleteParkingBookingById = async (req, res) => {
}

export const DeleteHotelAndParkingBookingById = async (req, res) => {

}

