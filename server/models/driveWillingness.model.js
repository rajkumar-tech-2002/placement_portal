import pool from '../config/db.config.js';

class DriveWillingness {
    static async markWillingness({ companyId, studentRegNo, status, coordinatorId, remarks = '', department = null, cambus_details = null }) {
        // Use REPLACE to handle both insert and update
        const sql = `
            INSERT INTO drive_willingness (company_id, student_reg_no, status, coordinator_id, remarks, department, cambus_details)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status), coordinator_id = VALUES(coordinator_id), remarks = VALUES(remarks), department = IFNULL(VALUES(department), department), cambus_details = IFNULL(VALUES(cambus_details), cambus_details)
        `;
        // Note: We need a unique constraint on (company_id, student_reg_no) for ON DUPLICATE KEY UPDATE to work reliably
        // I'll add that constraint in a separate step if it doesn't exist
        const [result] = await pool.query(sql, [companyId, studentRegNo, status, coordinatorId, remarks, department, cambus_details]);
        return result;
    }

    static async getWillingnessByCompany(companyId) {
        const sql = 'SELECT * FROM drive_willingness WHERE company_id = ?';
        const [rows] = await pool.query(sql, [companyId]);
        return rows;
    }

    static async getDrivesByCampus(campus = 'Both', department = null) {
        const params = [];
        let willingFilter = '';
        let eligibleFilter = '';

        if (department) {
            willingFilter += ' AND dw.department = ?';
            eligibleFilter += ' AND dw.department = ?';
            params.push(department, department);
        }

        if (campus && campus !== 'Both') {
            willingFilter += ' AND (dw.cambus_details = ? OR dw.cambus_details = \'Both\')';
            eligibleFilter += ' AND (dw.cambus_details = ? OR dw.cambus_details = \'Both\')';
            params.push(campus, campus);
        }

        let sql = `
            SELECT c.*, 
            (SELECT COUNT(*) FROM drive_willingness dw WHERE dw.company_id = c.id AND dw.status = 'Willing' ${willingFilter}) as willing_count,
            (SELECT COUNT(*) FROM drive_willingness dw WHERE dw.company_id = c.id ${eligibleFilter}) as eligible_count
            FROM companies c
            WHERE 1=1
        `;

        if (campus && campus !== 'Both') {
            sql += ' AND (c.campus = ? OR c.campus = \'Both\')';
            params.push(campus);
        }

        sql += ' ORDER BY c.drive_date ASC';
        
        // Reorder parameters to match subqueries position: [willingParams, eligibleParams, outerParams]
        const orderedParams = [];
        if (department) orderedParams.push(department);
        if (campus && campus !== 'Both') orderedParams.push(campus);
        if (department) orderedParams.push(department);
        if (campus && campus !== 'Both') orderedParams.push(campus);
        if (campus && campus !== 'Both') orderedParams.push(campus);

        const [rows] = await pool.query(sql, orderedParams);
        return rows;
    }

    static async getWillingStudents(companyId) {
        const sql = `
            SELECT dw.*, spm.name, spm.personal_email, spm.student_mobile, spm.ug_pg_cgpa
            FROM drive_willingness dw
            JOIN student_placement_master spm ON dw.student_reg_no = spm.reg_no
            WHERE dw.company_id = ? AND dw.status = 'Willing'
            ORDER BY dw.cambus_details ASC, dw.department ASC, spm.name ASC
        `;
        const [rows] = await pool.query(sql, [companyId]);
        return rows;
    }

    static async syncEligibleStudents(companyId, eligibleStudents) {
        if (!eligibleStudents) return;

        if (eligibleStudents.length === 0) {
            // If no one is eligible, clear the table for this company (or at least those with Pending status)
            await pool.query('DELETE FROM drive_willingness WHERE company_id = ? AND status = \'Willing\'', [companyId]);
            return;
        }

        const eligibleRegNos = eligibleStudents.map(s => s.reg_no);
        
        // 1. Remove students who are no longer eligible (only if they are in 'Pending' status)
        // If a student already marked themselves as willing but is now ineligible, we might want to keep or remove them.
        // For now, let's keep those who have a status but remove 'Pending' ones who are no longer eligible.
        await pool.query(
            'DELETE FROM drive_willingness WHERE company_id = ? AND status = \'Willing\' AND student_reg_no NOT IN (?)', 
            [companyId, eligibleRegNos]
        );

        // 2. Prepare bulk insert values
        const values = eligibleStudents.map(student => [companyId, student.reg_no, 'Willing', student.department, student.cambus_details]);
        
        // 3. INSERT new eligible students. ON DUPLICATE KEY UPDATE nothing (or just department/campus) to avoid overwriting existing 'Willing'/'Not Willing' status
        const sql = `
            INSERT INTO drive_willingness (company_id, student_reg_no, status, department, cambus_details)
            VALUES ?
            ON DUPLICATE KEY UPDATE 
                department = VALUES(department),
                cambus_details = VALUES(cambus_details)
        `;
        
        await pool.query(sql, [values]);
    }
}

export default DriveWillingness;
