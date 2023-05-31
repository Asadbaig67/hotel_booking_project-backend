import mongoose from 'mongoose'

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    message: {
        type: String,
    }
});

const Contact = mongoose.model('Contact', ContactSchema);

export default Contact;