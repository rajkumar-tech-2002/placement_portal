import express from 'express';
import { markWillingness, getDriveAttendance, getCoordinatorDrives, getWillingStudents } from '../controllers/driveWillingness.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to check if user is coordinator or admin
const isCoordinatorOrAdmin = (req, res, next) => {
  if (req.user.role === 'COORDINATOR' || req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};

router.get('/drives', verifyToken, isCoordinatorOrAdmin, getCoordinatorDrives);
router.get('/drives/:id/attendance', verifyToken, isCoordinatorOrAdmin, getDriveAttendance);
router.get('/drives/:id/willing', verifyToken, isAdmin, getWillingStudents);
router.post('/mark-willingness', verifyToken, isCoordinatorOrAdmin, markWillingness);

export default router;
