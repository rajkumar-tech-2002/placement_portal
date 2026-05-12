import pool from '../config/db.config.js';

class Report {
    static async getOverallStats(campus) {
        const isBoth = campus === 'Both';
        const campusFilter = isBoth ? '' : ` WHERE campus_details = '${campus}'`;
        const campusFilterWhere = isBoth ? '' : ` AND campus_details = '${campus}'`;
        
        // Drive filter is different because it's from companies table
        const driveCampusFilter = isBoth ? '' : ` WHERE campus = '${campus}' OR campus = 'Both'`;

        // Overall Student & Placement Stats
        const [[overall]] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM student_placement_master ${isBoth ? '' : ` WHERE campus_details = '${campus}'`}) as total_students,
                (SELECT COUNT(DISTINCT s.reg_no) FROM placement_details p JOIN student_placement_master s ON p.reg_no = s.reg_no WHERE p.placed = 'Yes' ${isBoth ? '' : ` AND s.campus_details = '${campus}'`}) as placed_students,
                (SELECT IFNULL(AVG(p.salary), 0) FROM placement_details p JOIN student_placement_master s ON p.reg_no = s.reg_no WHERE p.placed = 'Yes' AND p.salary > 0 ${isBoth ? '' : ` AND s.campus_details = '${campus}'`}) as avg_package,
                (SELECT IFNULL(MAX(p.salary), 0) FROM placement_details p JOIN student_placement_master s ON p.reg_no = s.reg_no WHERE p.placed = 'Yes' ${isBoth ? '' : ` AND s.campus_details = '${campus}'`}) as highest_package
        `);

        // Willingness Stats
        const [[willingness]] = await pool.query(`
            SELECT 
                SUM(CASE WHEN LOWER(willing) = 'willing' THEN 1 ELSE 0 END) as willing,
                SUM(CASE WHEN LOWER(willing) = 'not willing' THEN 1 ELSE 0 END) as not_willing
            FROM student_placement_master
            ${isBoth ? '' : ` WHERE campus_details = '${campus}'`}
        `);

        // Domain Stats
        const [domains] = await pool.query(`
            SELECT willing_domain as domain, COUNT(*) as count
            FROM student_placement_master
            WHERE (willing_domain IS NOT NULL AND willing_domain != '')
            ${isBoth ? '' : ` AND campus_details = '${campus}'`}
            GROUP BY willing_domain
            ORDER BY count DESC
            LIMIT 5
        `);

        // Drive Stats
        const [[drives]] = await pool.query(`
            SELECT 
                COUNT(*) as total_drives,
                SUM(CASE WHEN drive_date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_drives,
                SUM(CASE WHEN drive_date < CURDATE() THEN 1 ELSE 0 END) as completed_drives
            FROM companies
            ${driveCampusFilter}
        `);

        // Monthly Placement Trend
        const [trends] = await pool.query(`
            SELECT DATE_FORMAT(p.created_at, '%b %Y') as month, COUNT(*) as count
            FROM placement_details p
            JOIN student_placement_master s ON p.reg_no = s.reg_no
            WHERE p.placed = 'Yes' AND p.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            ${isBoth ? '' : ` AND s.campus_details = '${campus}'`}
            GROUP BY month
            ORDER BY MIN(p.created_at) ASC
        `);

        return {
            ...overall,
            willingness: willingness || { willing: 0, not_willing: 0 },
            domains,
            drive_stats: drives || { total_drives: 0, upcoming_drives: 0, completed_drives: 0 },
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
            const campusClause = ` AND campus_details IN (?)`;
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

        query += ` ORDER BY campus_details ASC, department ASC, name ASC`;

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
        const [campuses] = await pool.query(`SELECT DISTINCT campus_details as value FROM student_placement_master WHERE campus_details IS NOT NULL AND campus_details != ''`);
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
            const campusClause = ` AND s.campus_details IN (?)`;
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

        query += ` ORDER BY s.campus_details ASC, s.department ASC, s.name ASC`;

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


    static async getCompanyWiseReport(campus = 'Both') {
        const isBoth = campus === 'Both';
        const [rows] = await pool.query(`
            SELECT p.company_name as name, COUNT(*) as count, AVG(p.salary) as avg_package
            FROM placement_details p
            JOIN student_placement_master s ON p.reg_no = s.reg_no
            WHERE p.placed = 'Yes' AND p.company_name IS NOT NULL AND p.company_name != ''
            ${isBoth ? '' : ` AND s.campus_details = '${campus}'`}
            GROUP BY p.company_name
            ORDER BY count DESC
        `);
        return rows;
    }

    static async getPackageDistribution(campus = 'Both') {
        const isBoth = campus === 'Both';
        const [rows] = await pool.query(`
            SELECT 
                CASE 
                    WHEN p.salary < 3 THEN '< 3 LPA'
                    WHEN p.salary >= 3 AND p.salary < 5 THEN '3 - 5 LPA'
                    WHEN p.salary >= 5 AND p.salary < 8 THEN '5 - 8 LPA'
                    ELSE '8+ LPA'
                END as range_label,
                COUNT(*) as count
            FROM placement_details p
            JOIN student_placement_master s ON p.reg_no = s.reg_no
            WHERE p.placed = 'Yes' AND p.salary > 0
            ${isBoth ? '' : ` AND s.campus_details = '${campus}'`}
            GROUP BY range_label
            ORDER BY count DESC
        `);
        return rows;
    }

    static async getLeetCodeStudents(limit, offset, search = '', campus = [], department = '') {
        let query = `
            SELECT *
            FROM leetcode_details
            WHERE 1=1
        `;
        let countQuery = `
            SELECT COUNT(*) as total
            FROM leetcode_details
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            const searchClause = ` AND (name LIKE ? OR reg_no LIKE ?)`;
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            const campusClause = ` AND campus_details IN (?)`;
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

        query += ` ORDER BY campus_details ASC, department ASC, name ASC`;

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

    static async getLeetCodeConsolidatedReport(limit, offset, search = '', campus = [], department = '') {
        let baseQuery = `
            FROM leetcode_details
            WHERE last_contest_name IS NOT NULL AND last_contest_name != ''
        `;
        const params = [];

        if (search) {
            baseQuery += ` AND (last_contest_name LIKE ? OR last_contest_date LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (campus && campus.length > 0) {
            baseQuery += ` AND campus_details IN (?)`;
            params.push(campus);
        }

        if (department) {
            baseQuery += ` AND department = ?`;
            params.push(department);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (SELECT 1 ${baseQuery} GROUP BY campus_details, department, last_contest_date, last_contest_name) as sub`;
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        let query = `
            SELECT 
                CONCAT(campus_details, '-', department, '-', last_contest_name) as report_id,
                campus_details, 
                department, 
                last_contest_date, 
                last_contest_name,
                SUM(CASE WHEN last_contest_solved = 1 THEN 1 ELSE 0 END) as solved_1,
                SUM(CASE WHEN last_contest_solved = 2 THEN 1 ELSE 0 END) as solved_2,
                SUM(CASE WHEN last_contest_solved = 3 THEN 1 ELSE 0 END) as solved_3,
                SUM(CASE WHEN last_contest_solved = 4 THEN 1 ELSE 0 END) as solved_4,
                COUNT(*) as total_students
            ${baseQuery}
            GROUP BY campus_details, department, last_contest_date, last_contest_name
            ORDER BY last_contest_date DESC, campus_details ASC, department ASC
            LIMIT ? OFFSET ?
        `;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);
        return { rows, total };
    }

    static async getPlacementConsolidatedReport(campus = 'Both') {
        const isBoth = campus === 'Both';
        let query = `SELECT * FROM placement_consolidate_report`;
        const params = [];

        if (!isBoth) {
            query += ` WHERE campus = ?`;
            params.push(campus);
        }

        query += ` ORDER BY campus ASC, department ASC`;
        const [rows] = await pool.query(query, params);
        return rows;
    }
}
export default Report;
