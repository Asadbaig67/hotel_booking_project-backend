const mongoose = require('mongoose');
//Date schema
const date = new mongoose.Schema({
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    }

})

// creating a schema
const roomschema = new mongoose.Schema({
    room_no: {
        type: Number,
        require: true
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    reserve_date_start: {
        type: Date,
    },

    reserve_date_end: {
        type: Date,
    },
    available: {
        type: Boolean,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    photos: [
        {
            pic_url: {
                type: String,
                required: true
            }
        }
    ]
});

// createing a new collection
const Room = mongoose.model('Room', roomschema);

// export this module
module.exports = Room;