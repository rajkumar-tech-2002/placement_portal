import pool from '../config/db.config.js';

class PlacementCount {
    static async getAll(campus = null, department = null) {
        let query = 'SELECT * FROM placement_count_master';
        const params = [];

        if (campus || department) {
            query += ' WHERE 1=1';
            if (campus && campus !== 'Both') {
                query += ' AND campus = ?';
                params.push(campus);
            }
            if (department) {
                // Exact match or IT/CORE variants only
                query += ' AND (department = ? OR department = ? OR department = ?)';
                params.push(department, `${department} - IT`, `${department} - CORE`);
            }
        }

        query += ' ORDER BY campus, department';
        const [rows] = await pool.query(query, params);
        return rows;
    }

    static async updateCounts(id, data) {
        const {
            '7l': l7,
            '6l': l6,
            '5l': l5,
            '4l': l4,
            '3l': l3,
            '2l': l2,
            '1l': l1,
            average
        } = data;

        const [result] = await pool.query(
            `UPDATE placement_count_master 
             SET \`7l\` = ?, \`6l\` = ?, \`5l\` = ?, \`4l\` = ?, \`3l\` = ?, \`2l\` = ?, \`1l\` = ?, average = ?
             WHERE id = ?`,
            [l7, l6, l5, l4, l3, l2, l1, average, id]
        );
        return result;
    }

    static async updateSignature(campus, baseDepartment, signaturePath) {
        // Update all rows that match the campus and base department (e.g., "EEE - IT" and "EEE - CORE")
        const [result] = await pool.query(
            `UPDATE placement_count_master 
             SET signature = ? 
             WHERE campus = ? AND (department = ? OR department = ?)`,
            [signaturePath, campus, `${baseDepartment} - IT`, `${baseDepartment} - CORE`]
        );
        return result;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM placement_count_master WHERE id = ?', [id]);
        return rows[0];
    }

    static async getWillingCounts(campus, department) {
        // Handle "Both" campus
        const isBoth = campus === 'Both';
        let query = 'SELECT core_willing_count, both_willing_count FROM department_willing_view WHERE department = ?';
        const params = [department];

        if (!isBoth && campus) {
            query += ' AND campus = ?';
            params.push(campus);
        }

        const [rows] = await pool.query(query, params);
        return rows[0] || { core_willing_count: 0, both_willing_count: 0 };
    }
}

export default PlacementCount;
