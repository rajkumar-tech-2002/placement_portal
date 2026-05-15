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
        const { sync_day, sync_time, is_active, next_run_at } = data;
        const [result] = await pool.query(
            'UPDATE sync_settings SET sync_day = ?, sync_time = ?, is_active = ?, next_run_at = ? WHERE module_name = ?',
            [sync_day, sync_time, is_active, next_run_at || null, moduleName]
        );
        return result;
    },

    updateStatus: async (moduleName, statusData) => {
        const { last_run_start, last_run_end, last_run_status, last_error, next_run_at } = statusData;
        const [result] = await pool.query(
            `UPDATE sync_settings SET 
                last_run_start = COALESCE(?, last_run_start),
                last_run_end = COALESCE(?, last_run_end),
                last_run_status = COALESCE(?, last_run_status),
                last_error = COALESCE(?, last_error),
                next_run_at = COALESCE(?, next_run_at)
            WHERE module_name = ?`,
            [last_run_start, last_run_end, last_run_status, last_error, next_run_at, moduleName]
        );
        return result;
    }
};

export default SyncSetting;
