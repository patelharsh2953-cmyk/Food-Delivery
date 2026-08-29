import express from 'express';
import {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact,
    restoreContact,
    purgeContact
} from '../controllers/contactController.js';
import { validateContactForm } from '../middleware/validators.js';

const contactRouter = express.Router();

contactRouter.post('/', validateContactForm, createContact);
contactRouter.get('/', getAllContacts);
contactRouter.get('/:id', getContactById);
contactRouter.put('/:id', updateContact);
contactRouter.delete('/:id', deleteContact);
contactRouter.post('/restore', restoreContact);
contactRouter.patch('/restore/:id', restoreContact);
contactRouter.post('/purge', purgeContact);
contactRouter.delete('/purge/:id', purgeContact);

export default contactRouter;
