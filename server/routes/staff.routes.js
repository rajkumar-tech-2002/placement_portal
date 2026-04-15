import express from 'express';
import { getStaff } from '../controllers/staff.controller.js';

const router = express.Router();

router.get('/', getStaff);

export default router;
