import express from 'express';
import { 
    getStaff, 
    createStaff, 
    updateStaff, 
    deleteStaff 
} from '../controllers/staff.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getStaff);
router.post('/', verifyToken, isAdmin, createStaff);
router.put('/:id', verifyToken, isAdmin, updateStaff);
router.delete('/:id', verifyToken, isAdmin, deleteStaff);

export default router;
