import express from 'express';
import { 
    getSyncSettings, 
    getAllSyncSettings, 
    createSyncSetting, 
    updateSyncSetting, 
    deleteSyncSetting 
} from '../controllers/syncSetting.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllSyncSettings);
router.get('/:moduleName', verifyToken, isAdmin, getSyncSettings);
router.post('/', verifyToken, isAdmin, createSyncSetting);
router.put('/:moduleName', verifyToken, isAdmin, updateSyncSetting);
router.delete('/:moduleName', verifyToken, isAdmin, deleteSyncSetting);

export default router;
