import pool from '../config/db.config.js';

class Department {
    static async getAll(campus = null) {
        let sql = 'SELECT * FROM department';
        const params = [];
        
        if (campus) {
            const campusList = campus.split(',').map(c => c.trim()).filter(c => c !== '');
            if (campusList.length > 0) {
                const placeholders = campusList.map(() => '?').join(', ');
                sql += ` WHERE campus IN (${placeholders})`;
                params.push(...campusList);
            }
        }
        
        sql += ' ORDER BY department ASC';
        
        const [departments] = await pool.query(sql, params);
        return departments;
    }
    static async create(data) {
        const { campus, department } = data;
        const [result] = await pool.query(
            'INSERT INTO department (campus, department) VALUES (?, ?)',
            [campus, department]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { campus, department } = data;
        await pool.query(
            'UPDATE department SET campus = ?, department = ? WHERE id = ?',
            [campus, department, id]
        );
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM department WHERE id = ?', [id]);
        return true;
    }
}

export default Department;
