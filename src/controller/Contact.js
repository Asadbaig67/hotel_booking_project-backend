import Contact from '../models/Contact.js';
import User from "../models/user.js";
import { SendEmail } from '../Functions/Emails/SendEmail.js';

export const createContact = async (req, res) => {
   const { name, email, message } = req.body;
   try {
      const newContact = new Contact({ name, email, message });
      await newContact.save();


      // Notification
      (await User.find({ account_type: "admin" })).forEach((user) => {
         createNotificationProperty(
            "Contact",
            `${name} has contacted you`,
            `Email: ${email} \n Message: ${message}`,
            Date.now(),
            user._id
         );
      });

      // Send Email
      await SendEmail({
         name: name,
         email: email,
         subject: "Contact Us Feedback",
         message: "We have received your message and will get back to you as soon as possible. Thank you for contacting us."
      });

      res.status(201).json(newContact);
   } catch (error) {
      res.status(409).json({ message: error.message });
   }

}

export const getContacts = async (req, res) => {
   try {
      const contacts = await Contact.find();
      res.status(200).json(contacts);
   } catch (error) {
      res.status(404).json({ message: error.message });
   }
};
