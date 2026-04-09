import pool from '../config/db.config.js';

class StudentPlacement {
    static async getAll(limit = null, offset = null, search = '', sortBy = 'created_at', sortOrder = 'DESC', campus = []) {
        let sql = `
            SELECT 
                s.*,
                IF(COUNT(p.id) = 0, 'NA', 
                   IF(SUM(CASE WHEN p.placed = 'Yes' THEN 1 ELSE 0 END) > 0, 'Placed', 'Unplaced')
                ) as placement_status,
                MAX(p.salary) as highest_salary,
                (SELECT company_name FROM placement_details WHERE reg_no = s.reg_no ORDER BY salary DESC LIMIT 1) as highest_salary_company
            FROM student_placement_master s
            LEFT JOIN placement_details p ON s.reg_no = p.reg_no
        `;
        const params = [];
        const conditions = [];
        
        // Allowed sort columns for safety
        const allowedSortColumns = ['reg_no', 'name', 'placement_status', 'highest_salary', 'created_at', 'willing', 'willing_domain', 'department', 'cambus_details'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        if (search) {
            conditions.push('(s.name LIKE ? OR s.reg_no LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const placeholders = campus.map(() => '?').join(', ');
            conditions.push(`s.cambus_details IN (${placeholders})`);
            params.push(...campus);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const virtualColumns = ['placement_status', 'highest_salary', 'highest_salary_company'];
        const orderByColumn = virtualColumns.includes(safeSortBy) ? safeSortBy : `s.${safeSortBy}`;

        sql += ` GROUP BY s.id ORDER BY s.cambus_details ASC, s.department ASC, ${orderByColumn} ${safeSortOrder}`;

        if (limit !== null && offset !== null) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));
        }
        
        const [rows] = await pool.query(sql, params);
        return rows;
    }

    static async countAll(search = '', campus = []) {
        let sql = 'SELECT COUNT(*) as total FROM student_placement_master s';
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(s.name LIKE ? OR s.reg_no LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const placeholders = campus.map(() => '?').join(', ');
            conditions.push(`s.cambus_details IN (${placeholders})`);
            params.push(...campus);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await pool.query(sql, params);
        return rows[0].total;
    }

    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT 
                s.*,
                IF(COUNT(p.id) = 0, 'NA', 
                   IF(SUM(CASE WHEN p.placed = 'Yes' THEN 1 ELSE 0 END) > 0, 'Placed', 'Unplaced')
                ) as placement_status,
                MAX(p.salary) as highest_salary,
                (SELECT company_name FROM placement_details WHERE reg_no = s.reg_no ORDER BY salary DESC LIMIT 1) as highest_salary_company
            FROM student_placement_master s
            LEFT JOIN placement_details p ON s.reg_no = p.reg_no
            WHERE s.id = ?
            GROUP BY s.id
        `, [id]);
        return rows[0];
    }

    static async filterFields(data) {
        const columns = await this.getTableColumns();
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
        
        const sql = `INSERT INTO student_placement_master (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await pool.query(sql, values);
        return result.insertId;
    }

    static async update(id, data) {
        const filteredData = await this.filterFields(data);
        const fields = Object.keys(filteredData);
        if (fields.length === 0) return;
        
        const values = Object.values(filteredData);
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

    static async upsertPlacementDetail(data) {
        const { reg_no, company_name, ...otherData } = data;
        // Check for existing record of the same student in the same company
        const [existing] = await pool.query(
            'SELECT id FROM placement_details WHERE reg_no = ? AND company_name = ?',
            [reg_no, company_name]
        );

        if (existing.length > 0) {
            const fields = Object.keys(otherData);
            const values = Object.values(otherData);
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const sql = `UPDATE placement_details SET ${setClause} WHERE id = ?`;
            await pool.query(sql, [...values, existing[0].id]);
            return { action: 'updated', id: existing[0].id };
        } else {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = fields.map(() => '?').join(', ');
            const sql = `INSERT INTO placement_details (${fields.join(', ')}) VALUES (${placeholders})`;
            const [result] = await pool.query(sql, values);
            return { action: 'inserted', id: result.insertId };
        }
    }

    static async getTableColumns() {
        const [rows] = await pool.query('DESCRIBE student_placement_master');
        return rows.map(row => row.Field);
    }

    static async getTemplateColumns() {
        const columns = await this.getTableColumns();
        // Filter out id, created_at, updated_at for the template
        return columns.filter(field => !['id', 'created_at', 'updated_at'].includes(field));
    }

    static async getPlacementTableColumns() {
        const [rows] = await pool.query('DESCRIBE placement_details');
        return rows
            .map(row => row.Field)
            .filter(field => !['id', 'created_at', 'updated_at'].includes(field));
    }
}

export default StudentPlacement;
