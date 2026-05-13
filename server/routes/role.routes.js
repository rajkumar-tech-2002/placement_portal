import express from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getRoles);
router.post('/', verifyToken, isAdmin, createRole);
router.put('/:id', verifyToken, isAdmin, updateRole);
router.delete('/:id', verifyToken, isAdmin, deleteRole);

export default router;
