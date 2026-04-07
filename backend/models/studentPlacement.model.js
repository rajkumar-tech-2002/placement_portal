import pool from '../config/db.config.js';

class StudentPlacement {
    static async getAll(limit = null, offset = null, search = '', sortBy = 'created_at', sortOrder = 'DESC', campus = []) {
        let sql = 'SELECT * FROM student_placement_master';
        const params = [];
        const conditions = [];
        
        // Allowed sort columns for safety
        const allowedSortColumns = ['reg_no', 'name', 'placed', 'salary', 'created_at', 'willing', 'willing_domain', 'department', 'cambus_details'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        if (search) {
            conditions.push('(name LIKE ? OR reg_no LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const placeholders = campus.map(() => '?').join(', ');
            conditions.push(`cambus_details IN (${placeholders})`);
            params.push(...campus);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ` ORDER BY cambus_details ASC, department ASC, ${safeSortBy} ${safeSortOrder}`;

        if (limit !== null && offset !== null) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));
        }
        
        const [rows] = await pool.query(sql, params);
        return rows;
    }

    static async countAll(search = '', campus = []) {
        let sql = 'SELECT COUNT(*) as total FROM student_placement_master';
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(name LIKE ? OR reg_no LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const placeholders = campus.map(() => '?').join(', ');
            conditions.push(`cambus_details IN (${placeholders})`);
            params.push(...campus);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await pool.query(sql, params);
        return rows[0].total;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM student_placement_master WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map(() => '?').join(', ');
        
        const sql = `INSERT INTO student_placement_master (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await pool.query(sql, values);
        return result.insertId;
    }

    static async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        
        const sql = `UPDATE student_placement_master SET ${setClause} WHERE id = ?`;
        await pool.query(sql, [...values, id]);
    }

    static async delete(id) {
        await pool.query('DELETE FROM student_placement_master WHERE id = ?', [id]);
    }

    static async deleteMany(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(', ');
        await pool.query(`DELETE FROM student_placement_master WHERE id IN (${placeholders})`, ids);
    }

    static async upsert(data) {
        const { reg_no, ...otherData } = data;
        const [existing] = await pool.query('SELECT id FROM student_placement_master WHERE reg_no = ?', [reg_no]);

        if (existing.length > 0) {
            await this.update(existing[0].id, otherData);
            return { action: 'updated', id: existing[0].id };
        } else {
            const id = await this.create(data);
            return { action: 'inserted', id };
        }
    }

    static async getTableColumns() {
        const [rows] = await pool.query('DESCRIBE student_placement_master');
        // Filter out id, created_at, updated_at for the template
        return rows
            .map(row => row.Field)
            .filter(field => !['id', 'created_at', 'updated_at'].includes(field));
    }
}

export default StudentPlacement;
