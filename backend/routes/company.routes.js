import express from 'express';
import { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany, getEligibleStudents, getEligibleCounts } from '../controllers/company.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllCompanies);
router.get('/eligible-counts', verifyToken, isAdmin, getEligibleCounts);
router.get('/:id', verifyToken, getCompanyById);
router.get('/:id/eligible-students', verifyToken, getEligibleStudents);
router.post('/', verifyToken, isAdmin, createCompany);
router.put('/:id', verifyToken, isAdmin, updateCompany);
router.delete('/:id', verifyToken, isAdmin, deleteCompany);

export default router;
