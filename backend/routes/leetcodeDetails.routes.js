import express from 'express';
import * as controller from '../controllers/leetcodeDetails.controller.js';
import { verifyToken, isCoordinator } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(isCoordinator);

// Bulk Import/Export
router.get('/export-template', controller.exportTemplate);
router.post('/import', controller.uploadMiddleware, controller.importDetails);
router.post('/delete-many', controller.deleteManyDetails);

router.get('/', controller.getAllDetails);
router.get('/:id', controller.getDetailById);
router.post('/', controller.createDetail);
router.put('/:id', controller.updateDetail);
router.delete('/:id', controller.deleteDetail);

export default router;
