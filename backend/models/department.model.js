import pool from '../config/db.config.js';

class Department {
    static async getAll() {
        const [departments] = await pool.query('SELECT * FROM department ORDER BY department ASC');
        return departments;
    }
}

export default Department;
