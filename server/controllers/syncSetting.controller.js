import SyncSetting from '../models/syncSetting.model.js';
import pool from '../config/db.config.js';

export const getSyncSettings = async (req, res) => {
    try {
        const { moduleName } = req.params;
        const settings = await SyncSetting.getByName(moduleName);
        res.json(settings || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllSyncSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sync_settings');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSyncSetting = async (req, res) => {
    try {
        const { module_name, sync_day, sync_time, is_active } = req.body;
        const [result] = await pool.query(
            'INSERT INTO sync_settings (module_name, sync_day, sync_time, is_active) VALUES (?, ?, ?, ?)',
            [module_name, sync_day, sync_time, is_active ?? true]
        );
        res.status(201).json({ id: result.insertId, message: 'Sync setting created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSyncSetting = async (req, res) => {
    try {
        const { moduleName } = req.params;
        const { sync_day, sync_time, is_active } = req.body;
        await SyncSetting.update(moduleName, { sync_day, sync_time, is_active });
        res.json({ message: 'Sync setting updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSyncSetting = async (req, res) => {
    try {
        const { moduleName } = req.params;
        await pool.query('DELETE FROM sync_settings WHERE module_name = ?', [moduleName]);
        res.json({ message: 'Sync setting deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
