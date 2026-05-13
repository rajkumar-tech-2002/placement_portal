import pool from '../config/db.config.js';

const SyncSetting = {
    getByName: async (moduleName) => {
        const [rows] = await pool.query(
            'SELECT * FROM sync_settings WHERE module_name = ? AND is_active = true',
            [moduleName]
        );
        return rows[0];
    },

    update: async (moduleName, data) => {
        const { sync_day, sync_time, is_active } = data;
        const [result] = await pool.query(
            'UPDATE sync_settings SET sync_day = ?, sync_time = ?, is_active = ? WHERE module_name = ?',
            [sync_day, sync_time, is_active, moduleName]
        );
        return result;
    }
};

export default SyncSetting;
