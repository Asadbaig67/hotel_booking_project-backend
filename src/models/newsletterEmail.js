import mongoose from "mongoose";

const newsLetterSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
});

const Newsletteremail = mongoose.model("Newsletteremail", newsLetterSchema);

export default Newsletteremail;