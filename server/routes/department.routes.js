import express from 'express';
import { 
    getDepartments, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment,
    bulkDeleteDepartments
} from '../controllers/department.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', verifyToken, isAdmin, createDepartment);
router.post('/bulk-delete', verifyToken, isAdmin, bulkDeleteDepartments);
router.put('/:id', verifyToken, isAdmin, updateDepartment);
router.delete('/:id', verifyToken, isAdmin, deleteDepartment);

export default router;
