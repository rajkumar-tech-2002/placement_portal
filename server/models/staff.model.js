import pool from '../config/db.config.js';

class Staff {
    static async getAll(limit = null, offset = null, search = '', sortBy = 'name', sortOrder = 'ASC', campus = null, department = '') {
        let sql = 'SELECT * FROM staff_master';
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

        if (department) {
            conditions.push('department = ?');
            params.push(department);
        }

        if (search) {
            conditions.push('(name LIKE ? OR mobile LIKE ? OR designation LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        const allowedSortColumns = ['id', 'name', 'campus', 'department', 'designation', 'staff_type'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;
        
        if (limit !== null && offset !== null) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));
        }

        const [staff] = await pool.query(sql, params);
        return staff;
    }

    static async countAll(search = '', campus = null, department = '') {
        let sql = 'SELECT COUNT(*) as total FROM staff_master';
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

        if (department) {
            conditions.push('department = ?');
            params.push(department);
        }

        if (search) {
            conditions.push('(name LIKE ? OR mobile LIKE ? OR designation LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await pool.query(sql, params);
        return rows[0].total;
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

    static async bulkDelete(ids) {
        if (!ids || ids.length === 0) return true;
        await pool.query('DELETE FROM staff_master WHERE id IN (?)', [ids]);
        return true;
    }
}

export default Staff;
