import pool from '../config/db.config.js';

class Report {
    static async getOverallStats() {
        // Overall Student & Placement Stats
        const [[overall]] = await pool.query(`
            SELECT 
                COUNT(*) as total_students,
                SUM(CASE WHEN placed = 'Yes' THEN 1 ELSE 0 END) as placed_students,
                AVG(salary) as avg_package,
                MAX(salary) as highest_package
            FROM student_placement_master
        `);

        // Willingness Stats (Willing vs Not Willing)
        const [[willingness]] = await pool.query(`
            SELECT 
                SUM(CASE WHEN willing = 'willing' THEN 1 ELSE 0 END) as willing,
                SUM(CASE WHEN willing = 'Not Willing' THEN 1 ELSE 0 END) as not_willing
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
            FROM student_placement_master
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
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

    static async getWillingStudents() {
        const [rows] = await pool.query(`
            SELECT *
            FROM student_placement_master
            WHERE willing = 'willing'
            ORDER BY cambus_details ASC, department ASC, name ASC
        `);
        return rows;
    }

    static async getPlacedStudents() {
        const [rows] = await pool.query(`
            SELECT *
            FROM student_placement_master
            WHERE placed = 'Yes'
            ORDER BY cambus_details ASC, department ASC, name ASC
        `);
        return rows;
    }

    static async getCompanyWiseReport() {
        const [rows] = await pool.query(`
            SELECT company_name as name, COUNT(*) as count, AVG(salary) as avg_package
            FROM student_placement_master
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
            FROM student_placement_master
            WHERE placed = 'Yes' AND salary > 0
            GROUP BY range_label
            ORDER BY count DESC
        `);
        return rows;
    }
}
export default Report;
