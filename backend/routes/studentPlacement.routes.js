import express from 'express';
import * as controller from '../controllers/studentPlacement.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

// Bulk Import/Export
router.get('/export-template', controller.exportTemplate);
router.post('/import', controller.uploadMiddleware, controller.importStudents);
router.post('/delete-many', controller.deleteManyStudents);

router.get('/', controller.getAllStudents);
router.get('/:id', controller.getStudentById);
router.post('/', controller.createStudent);
router.put('/:id', controller.updateStudent);
router.delete('/:id', controller.deleteStudent);

export default router;
