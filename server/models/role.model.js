import pool from '../config/db.config.js';

class Role {
    static async findAll(limit = null, offset = null, search = '', sortBy = 'role', sortOrder = 'ASC') {
        let sql = 'SELECT * FROM role_master';
        const params = [];
        
        if (search) {
            sql += ' WHERE role LIKE ?';
            params.push(`%${search}%`);
        }
        
        const allowedSortColumns = ['id', 'role'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'role';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;
        
        if (limit !== null && offset !== null) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));
        }

        const [roles] = await pool.query(sql, params);
        return roles;
    }

    static async countAll(search = '') {
        let sql = 'SELECT COUNT(*) as total FROM role_master';
        const params = [];

        if (search) {
            sql += ' WHERE role LIKE ?';
            params.push(`%${search}%`);
        }

        const [rows] = await pool.query(sql, params);
        return rows[0].total;
    }

    static async create(roleName) {
        const [result] = await pool.query('INSERT INTO role_master (role) VALUES (?)', [roleName]);
        return { id: result.insertId, role: roleName };
    }

    static async update(id, roleName) {
        await pool.query('UPDATE role_master SET role = ? WHERE id = ?', [roleName, id]);
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM role_master WHERE id = ?', [id]);
        return true;
    }

    static async bulkDelete(ids) {
        if (!ids || ids.length === 0) return true;
        await pool.query('DELETE FROM role_master WHERE id IN (?)', [ids]);
        return true;
    }
}

export default Role;
