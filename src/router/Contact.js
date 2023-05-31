import express from 'express';
const router = express.Router();
import { getContacts, createContact } from '../controller/Contact.js';



// get all Contacts
router.get('/getallcontacts', getContacts);

// Create a new Contact
router.post('/create', createContact);

export default router;