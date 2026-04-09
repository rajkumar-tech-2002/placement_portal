import pool from '../config/db.config.js';

class Report {
    static async getOverallStats() {
        // Overall Student & Placement Stats
        const [[overall]] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM student_placement_master) as total_students,
                (SELECT COUNT(DISTINCT reg_no) FROM placement_details WHERE placed = 'Yes') as placed_students,
                (SELECT IFNULL(AVG(salary), 0) FROM placement_details WHERE placed = 'Yes' AND salary > 0) as avg_package,
                (SELECT IFNULL(MAX(salary), 0) FROM placement_details WHERE placed = 'Yes') as highest_package
        `);

        // Willingness Stats (Willing vs Not Willing)
        const [[willingness]] = await pool.query(`
            SELECT 
                SUM(CASE WHEN LOWER(willing) = 'willing' THEN 1 ELSE 0 END) as willing,
                SUM(CASE WHEN LOWER(willing) = 'not willing' THEN 1 ELSE 0 END) as not_willing
            FROM student_placement_master
        `);

        // Domain Stats (Grouping by willing_domain)
        const [domains] = await pool.query(`
            SELECT willing_domain as domain, COUNT(*) as count
            FROM student_placement_master
            WHERE willing_domain IS NOT NULL AND willing_domain != ''
            GROUP BY willing_domain
            ORDER BY count DESC
            LIMIT 5
        `);

        // Drive Stats (Upcoming vs Completed from companies table)
        const [[drives]] = await pool.query(`
            SELECT 
                COUNT(*) as total_drives,
                SUM(CASE WHEN drive_date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_drives,
                SUM(CASE WHEN drive_date < CURDATE() THEN 1 ELSE 0 END) as completed_drives
            FROM companies
        `);

        // Monthly Placement Trend
        const [trends] = await pool.query(`
            SELECT DATE_FORMAT(created_at, '%b %Y') as month, COUNT(*) as count
            FROM placement_details
            WHERE placed = 'Yes' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month
            ORDER BY MIN(created_at) ASC
        `);

        return {
            ...overall,
            willingness,
            domains,
            drive_stats: drives,
            trends
        };
    }

    static async getDriveReport(driveId) {
        const [report] = await pool.query(`
            SELECT 
                COUNT(*) as total_eligible,
                SUM(CASE WHEN willing = 'Yes' THEN 1 ELSE 0 END) as total_willing,
                SUM(CASE WHEN placed = 'Yes' THEN 1 ELSE 0 END) as total_placed
            FROM student_placement_master
        `); // This is a fallback since we removed drive-specific status for simplicity in this project
        return report[0];
    }

    static async getWillingStudents(limit, offset, search = '', campus = [], department = '', domain = '') {
        let query = `
            SELECT *
            FROM student_placement_master
            WHERE LOWER(willing) = 'willing'
        `;
        let countQuery = `
            SELECT COUNT(*) as total
            FROM student_placement_master
            WHERE LOWER(willing) = 'willing'
        `;
        const params = [];

        if (search) {
            const searchClause = ` AND (name LIKE ? OR reg_no LIKE ?)`;
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const campusClause = ` AND cambus_details IN (?)`;
            query += campusClause;
            countQuery += campusClause;
            params.push(campus);
        }

        if (department) {
            const deptClause = ` AND department = ?`;
            query += deptClause;
            countQuery += deptClause;
            params.push(department);
        }

        if (domain) {
            const domainClause = ` AND willing_domain = ?`;
            query += domainClause;
            countQuery += domainClause;
            params.push(domain);
        }

        query += ` ORDER BY cambus_details ASC, department ASC, name ASC`;

        if (limit !== undefined && offset !== undefined) {
            query += ` LIMIT ?, ?`;
            params.push(offset, parseInt(limit));
        }

        const [rows] = await pool.query(query, params);
        
        // Count request doesn't need LIMIT params
        const countParams = params.slice(0, params.length - (limit !== undefined ? 2 : 0));
        const [[{ total }]] = await pool.query(countQuery, countParams);

        return { rows, total };
    }

    static async getWillingFilterOptions() {
        const [campuses] = await pool.query(`SELECT DISTINCT cambus_details as value FROM student_placement_master WHERE cambus_details IS NOT NULL AND cambus_details != ''`);
        const [departments] = await pool.query(`SELECT DISTINCT department as value FROM student_placement_master WHERE department IS NOT NULL AND department != ''`);
        const [domains] = await pool.query(`SELECT DISTINCT willing_domain as value FROM student_placement_master WHERE willing_domain IS NOT NULL AND willing_domain != ''`);
        const [companies] = await pool.query(`SELECT DISTINCT company_name as value FROM placement_details WHERE placed = 'Yes' AND company_name IS NOT NULL AND company_name != ''`);
        
        return {
            campuses: campuses.map(c => c.value),
            departments: departments.map(d => d.value),
            domains: domains.map(d => d.value),
            companies: companies.map(c => c.value)
        };
    }



    static async getPlacedStudents(limit, offset, search = '', campus = [], department = '', company = '') {
        let query = `
            SELECT s.*, p.company_name, p.salary, p.domain as placed_domain, p.created_at as placement_date
            FROM student_placement_master s
            JOIN placement_details p ON s.reg_no = p.reg_no
            WHERE p.placed = 'Yes'
        `;
        let countQuery = `
            SELECT COUNT(*) as total
            FROM student_placement_master s
            JOIN placement_details p ON s.reg_no = p.reg_no
            WHERE p.placed = 'Yes'
        `;
        const params = [];

        if (search) {
            const searchClause = ` AND (s.name LIKE ? OR s.reg_no LIKE ? OR p.company_name LIKE ?)`;
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const campusClause = ` AND s.cambus_details IN (?)`;
            query += campusClause;
            countQuery += campusClause;
            params.push(campus);
        }

        if (department) {
            const deptClause = ` AND s.department = ?`;
            query += deptClause;
            countQuery += deptClause;
            params.push(department);
        }

        if (company) {
            const companyClause = ` AND p.company_name = ?`;
            query += companyClause;
            countQuery += companyClause;
            params.push(company);
        }

        query += ` ORDER BY s.cambus_details ASC, s.department ASC, s.name ASC`;

        if (limit !== undefined && offset !== undefined) {
            query += ` LIMIT ?, ?`;
            params.push(offset, parseInt(limit));
        }

        const [rows] = await pool.query(query, params);
        
        // Count request doesn't need LIMIT params
        const countParams = params.slice(0, params.length - (limit !== undefined ? 2 : 0));
        const [[{ total }]] = await pool.query(countQuery, countParams);

        return { rows, total };
    }


    static async getCompanyWiseReport() {
        const [rows] = await pool.query(`
            SELECT company_name as name, COUNT(*) as count, AVG(salary) as avg_package
            FROM placement_details
            WHERE placed = 'Yes' AND company_name IS NOT NULL AND company_name != ''
            GROUP BY company_name
            ORDER BY count DESC
        `);
        return rows;
    }

    static async getPackageDistribution() {
        const [rows] = await pool.query(`
            SELECT 
                CASE 
                    WHEN salary < 3 THEN '< 3 LPA'
                    WHEN salary >= 3 AND salary < 5 THEN '3 - 5 LPA'
                    WHEN salary >= 5 AND salary < 8 THEN '5 - 8 LPA'
                    ELSE '8+ LPA'
                END as range_label,
                COUNT(*) as count
            FROM placement_details
            WHERE placed = 'Yes' AND salary > 0
            GROUP BY range_label
            ORDER BY count DESC
        `);
        return rows;
    }
}
export default Report;
