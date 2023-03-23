export const validateBooking = (req) => {

    if (req.query.Booking_type === 'hotel') {

        const { Booking_type, userId, hotelId, room, checkIn, checkOut, price } = req.query;

        if (!Booking_type || !userId || !hotelId || !room || !checkIn || !checkOut || !price) {
            throw new Error("Please enter all fields. All fields are required.");
        }

        return {
            Booking_type,
            userId,
            hotelId,
            room: JSON.parse(room),
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            price: JSON.parse(price),
            createdAt: Date.now(),
        };
    } else if (req.query.Booking_type === 'hotelandparking') {

        const { Booking_type, userId, hotelId, room, checkIn, checkOut, price, parkingDetails } = req.query;

        if (!Booking_type || !userId || !hotelId || !room || !parkingDetails || !checkIn || !checkOut || !price) {
            throw new Error("Please enter all fields. All fields are required.");
        }

        return {
            Booking_type,
            userId,
            hotelId,
            room: JSON.parse(room),
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            price: JSON.parse(price),
            parkingDetails: JSON.parse(parkingDetails),
            createdAt: Date.now(),
        };
    } else if (req.query.Booking_type === 'parking') {
        const { Booking_type, userId, parkingId, checkIn, checkOut, parkingDetails } = req.query;

        if (!Booking_type || !userId || !parkingId || !parkingDetails || !checkIn || !checkOut || !price) {
            throw new Error("Please enter all fields. All fields are required.");
        }

        return {
            Booking_type,
            userId,
            parkingId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            parkingDetails: JSON.parse(parkingDetails),
            createdAt: Date.now(),
        };
    }

};