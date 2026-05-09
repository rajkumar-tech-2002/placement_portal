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
}

export default Department;
