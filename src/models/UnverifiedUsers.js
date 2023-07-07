import mongoose from "mongoose";

const UnverifiedUsersSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    property_type: {
        type: String,
        required: true,
    },
    property_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
    },
});

const UnverifiedUsers = mongoose.model("UnverifiedUsers", UnverifiedUsersSchema);

export default UnverifiedUsers;