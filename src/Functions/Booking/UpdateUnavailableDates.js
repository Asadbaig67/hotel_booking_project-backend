import fetch from "node-fetch";
export const updateunavailabledates = async (room, checkIn, checkOut) => {
    const result = await Promise.all(room.map(async (Room) => {
        const response = await fetch(`http://46.32.232.208:5000/room/updateunavailabledates/${Room.RoomId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number: Room.Room_no,
                unavailableDates: [checkIn, checkOut]
            })
        });
        return response.json();
    }));
    return result;
}
