import express from 'express';
import { getAllPlacementCounts, updatePlacementCounts, uploadSignature } from '../controllers/placementCount.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllPlacementCounts);
router.put('/:id', verifyToken, updatePlacementCounts);
router.post('/upload-signature', verifyToken, uploadSignature);

export default router;
