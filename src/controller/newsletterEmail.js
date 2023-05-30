import Newsletteremail from "../models/newsletterEmail.js";

export const addEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const newEmail = new Newsletteremail({
            email,
        });
        await newEmail.save();
        res.status(201).json(newEmail);
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