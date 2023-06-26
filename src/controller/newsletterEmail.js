import Newsletteremail from "../models/newsletterEmail.js";
import { newsletterEmail } from "./mailer.js"

export const addEmail = async (req, res) => {
   const { email } = req.body;

   try {

      const existingemail = await Newsletteremail.findOne({ email });
      if (!existingemail) {
         const newEmail = new Newsletteremail({
            email,
         });
         const result = await newsletterEmail(email);
         if (!result.status) {
            return res.status(409).json({ message: result.message });
         }
         await newEmail.save();
         return res.status(201).json({ message: "Email added successfully" });
      }

      return res.status(200).json({ message: "Email already exists" });

   } catch (error) {
      res.status(409).json({ message: error.message });
   }
};
export const getAllEmails = async (req, res) => {
   try {
      const result = await Newsletteremail.find();
      res.send(result);
   } catch (error) {
      res.status(404).json({ message: error.message });
   }
}