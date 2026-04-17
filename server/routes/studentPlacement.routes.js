import express from 'express';
import * as controller from '../controllers/studentPlacement.controller.js';
import { verifyToken, isAdmin, isCoordinator } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Bulk Import/Export - Admin Only
router.get('/export-template', isAdmin, controller.exportTemplate);
router.post('/import', isAdmin, controller.uploadMiddleware, controller.importStudents);
router.get('/export-placement-template', isAdmin, controller.exportPlacementTemplate);
router.post('/import-placements', isAdmin, controller.uploadMiddleware, controller.importPlacementDetails);
router.post('/delete-many', isAdmin, controller.deleteManyStudents);

// Placement Entry & Student View - Admin and Coordinator
router.post('/placement-detail', isCoordinator, controller.savePlacementDetail);
router.get('/placement-details', isCoordinator, controller.getAllPlacementDetails);
router.put('/placement-details/:id', isCoordinator, controller.updatePlacementDetail);
router.delete('/placement-details/:id', isCoordinator, controller.deletePlacementDetail);
router.get('/', isCoordinator, controller.getAllStudents);
router.get('/:id', isCoordinator, controller.getStudentById);

// Master Data Modification - Admin Only
router.post('/', isAdmin, controller.createStudent);
router.put('/:id', isAdmin, controller.updateStudent);
router.delete('/:id', isAdmin, controller.deleteStudent);

export default router;
