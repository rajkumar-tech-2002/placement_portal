import pool from '../config/db.config.js';

class Staff {
    static async getAll() {
        const [staff] = await pool.query('SELECT id, name, cambus, department, designation FROM staff_master ORDER BY name ASC');
        return staff;
    }
}

export default Staff;
