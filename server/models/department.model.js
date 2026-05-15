import pool from '../config/db.config.js';

class Department {
    static async getAll(limit = null, offset = null, search = '', sortBy = 'department', sortOrder = 'ASC', campus = null) {
        let sql = 'SELECT * FROM department';
        const params = [];
        const conditions = [];
        
        if (campus) {
            const campusList = Array.isArray(campus) ? campus : campus.split(',').map(c => c.trim()).filter(c => c !== '');
            if (campusList.length > 0) {
                const placeholders = campusList.map(() => '?').join(', ');
                conditions.push(`campus IN (${placeholders})`);
                params.push(...campusList);
            }
        }

        if (search) {
            conditions.push('department LIKE ?');
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        const allowedSortColumns = ['id', 'campus', 'department'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'department';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;
        
        if (limit !== null && offset !== null) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));
        }

        const [departments] = await pool.query(sql, params);
        return departments;
    }

    static async countAll(search = '', campus = null) {
        let sql = 'SELECT COUNT(*) as total FROM department';
        const params = [];
        const conditions = [];

        if (campus) {
            const campusList = Array.isArray(campus) ? campus : campus.split(',').map(c => c.trim()).filter(c => c !== '');
            if (campusList.length > 0) {
                const placeholders = campusList.map(() => '?').join(', ');
                conditions.push(`campus IN (${placeholders})`);
                params.push(...campusList);
            }
        }

        if (search) {
            conditions.push('department LIKE ?');
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await pool.query(sql, params);
        return rows[0].total;
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

    static async bulkDelete(ids) {
        if (!ids || ids.length === 0) return true;
        await pool.query('DELETE FROM department WHERE id IN (?)', [ids]);
        return true;
    }
}

export default Department;
