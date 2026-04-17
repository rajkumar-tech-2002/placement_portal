import pool from '../config/db.config.js';

class LeetCodeDetail {
    static async getAll(limit = null, offset = null, search = '', sortBy = 'created_at', sortOrder = 'DESC', campus = [], department = null) {
        let sql = 'SELECT * FROM leetcode_details';
        const params = [];
        const conditions = [];
        
        const allowedSortColumns = ['reg_no', 'name', 'campus_details', 'department', 'total_solved', 'contest_rating', 'global_ranking', 'leet_rank', 'created_at'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        if (search) {
            conditions.push('(name LIKE ? OR reg_no LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const placeholders = campus.map(() => '?').join(', ');
            conditions.push(`campus_details IN (${placeholders})`);
            params.push(...campus);
        }

        if (department) {
            conditions.push('department = ?');
            params.push(department);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        // Apply primary sort, followed by campus, department, and reg_no as secondary sorts
        if (safeSortBy === 'created_at') {
            // Default view: sort by campus, dept, reg_no
            sql += ` ORDER BY campus_details ASC, department ASC, reg_no ASC`;
        } else {
            // Specific column sort: apply user choice first, then others for ties
            sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}, campus_details ASC, department ASC, reg_no ASC`;
        }

        if (limit !== null && offset !== null) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));
        }
        
        const [rows] = await pool.query(sql, params);
        return rows;
    }

    static async countAll(search = '', campus = [], department = null) {
        let sql = 'SELECT COUNT(*) as total FROM leetcode_details';
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(name LIKE ? OR reg_no LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const placeholders = campus.map(() => '?').join(', ');
            conditions.push(`campus_details IN (${placeholders})`);
            params.push(...campus);
        }

        if (department) {
            conditions.push('department = ?');
            params.push(department);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await pool.query(sql, params);
        return rows[0].total;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM leetcode_details WHERE id = ?', [id]);
        return rows[0];
    }

    static async filterFields(data) {
        const [rows] = await pool.query('DESCRIBE leetcode_details');
        const columns = rows.map(row => row.Field);
        const filtered = {};
        for (const field of columns) {
            if (data[field] !== undefined) {
                filtered[field] = data[field];
            }
        }
        return filtered;
    }

    static async create(data) {
        const filteredData = await this.filterFields(data);
        const fields = Object.keys(filteredData);
        if (fields.length === 0) return null;
        
        const values = Object.values(filteredData);
        const placeholders = fields.map(() => '?').join(', ');
        
        const sql = `INSERT INTO leetcode_details (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await pool.query(sql, values);
        return result.insertId;
    }

    static async update(id, data) {
        const filteredData = await this.filterFields(data);
        const fields = Object.keys(filteredData).filter(f => !['id', 'created_at', 'updated_at'].includes(f));
        if (fields.length === 0) return;
        
        const values = Object.values(filteredData).filter((v, i) => fields.includes(Object.keys(filteredData)[i]));
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        
        const sql = `UPDATE leetcode_details SET ${setClause} WHERE id = ?`;
        await pool.query(sql, [...values, id]);
    }

    static async delete(id) {
        await pool.query('DELETE FROM leetcode_details WHERE id = ?', [id]);
    }

    static async deleteMany(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(', ');
        await pool.query(`DELETE FROM leetcode_details WHERE id IN (${placeholders})`, ids);
    }

    static async upsert(data) {
        const { reg_no, ...otherData } = data;
        const [existing] = await pool.query('SELECT id FROM leetcode_details WHERE reg_no = ?', [reg_no]);

        if (existing.length > 0) {
            await this.update(existing[0].id, otherData);
            return { action: 'updated', id: existing[0].id };
        } else {
            const id = await this.create(data);
            return { action: 'inserted', id };
        }
    }

    static async getTemplateColumns() {
        return ['reg_no', 'name', 'campus_details', 'department', 'leetcode_username'];
    }
}

export default LeetCodeDetail;
