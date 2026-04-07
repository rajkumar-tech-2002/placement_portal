import express from 'express';
import { 
    getPerformanceReport, 
    getDriveReport,
    getWillingReport,
    getPlacedReport,
    getCompanyWiseReport,
    getPackageDistReport 
} from '../controllers/report.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/performance', verifyToken, isAdmin, getPerformanceReport);
router.get('/drive/:drive_id', verifyToken, isAdmin, getDriveReport);
router.get('/willing', verifyToken, isAdmin, getWillingReport);
router.get('/placed', verifyToken, isAdmin, getPlacedReport);
router.get('/company-wise', verifyToken, isAdmin, getCompanyWiseReport);
router.get('/package-dist', verifyToken, isAdmin, getPackageDistReport);

export default router;
