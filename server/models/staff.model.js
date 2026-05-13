import pool from '../config/db.config.js';

class Staff {
    static async getAll() {
        const [staff] = await pool.query('SELECT * FROM staff_master ORDER BY name ASC');
        return staff;
    }

    static async create(data) {
        const { name, campus, department, mobile, staff_type, designation } = data;
        const [result] = await pool.query(
            'INSERT INTO staff_master (name, campus, department, mobile, staff_type, designation) VALUES (?, ?, ?, ?, ?, ?)',
            [name, campus, department, mobile, staff_type, designation]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, campus, department, mobile, staff_type, designation } = data;
        await pool.query(
            'UPDATE staff_master SET name = ?, campus = ?, department = ?, mobile = ?, staff_type = ?, designation = ? WHERE id = ?',
            [name, campus, department, mobile, staff_type, designation, id]
        );
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM staff_master WHERE id = ?', [id]);
        return true;
    }
}

export default Staff;
