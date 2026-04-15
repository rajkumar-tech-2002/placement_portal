import express from 'express';
import { createUser, getUsers, deleteUser, updateUser, deleteManyUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/', createUser);
router.get('/', getUsers);
router.delete('/:id', deleteUser);
router.put('/:id', updateUser);
router.post('/delete-many', deleteManyUsers);

export default router;
