import pool from '../config/db.config.js';

class Company {
    static async findAll() {
        const [companies] = await pool.query('SELECT * FROM companies ORDER BY name ASC');
        return companies;
    }

    static async create(companyData) {
        const {
            name, website, description, campus, drive_date, category, on_off_campus, salary_lpa,
            min_10th_percent, min_12th_percent, min_ug_cgpa, max_history_arrears, max_current_arrears, gender_preference
        } = companyData;
        const [result] = await pool.query(
            'INSERT INTO companies (name, website, description, campus, drive_date, category, on_off_campus, salary_lpa, min_10th_percent, min_12th_percent, min_ug_cgpa, max_history_arrears, max_current_arrears, gender_preference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, website, description, campus, drive_date, category, on_off_campus, salary_lpa, min_10th_percent, min_12th_percent, min_ug_cgpa, max_history_arrears, max_current_arrears, gender_preference]
        );
        const companyId = result.insertId;

        // Sync eligible students automatically
        const DriveWillingness = (await import('./driveWillingness.model.js')).default;
        const eligibleStudents = await this.getEligibleStudents(companyId);
        await DriveWillingness.syncEligibleStudents(companyId, eligibleStudents);

        return { id: companyId, ...companyData };
    }

    static async update(id, companyData) {
        const {
            name, website, description, campus, drive_date, category, on_off_campus, salary_lpa,
            min_10th_percent, min_12th_percent, min_ug_cgpa, max_history_arrears, max_current_arrears, gender_preference
        } = companyData;
        await pool.query(
            'UPDATE companies SET name = ?, website = ?, description = ?, campus = ?, drive_date = ?, category = ?, on_off_campus = ?, salary_lpa = ?, min_10th_percent = ?, min_12th_percent = ?, min_ug_cgpa = ?, max_history_arrears = ?, max_current_arrears = ?, gender_preference = ? WHERE id = ?',
            [name, website, description, campus, drive_date, category, on_off_campus, salary_lpa, min_10th_percent, min_12th_percent, min_ug_cgpa, max_history_arrears, max_current_arrears, gender_preference, id]
        );

        // Sync eligible students automatically (in case criteria changed)
        const DriveWillingness = (await import('./driveWillingness.model.js')).default;
        const eligibleStudents = await this.getEligibleStudents(id);
        await DriveWillingness.syncEligibleStudents(id, eligibleStudents);

        return { id, ...companyData };
    }

    static async delete(id) {
        await pool.query('DELETE FROM companies WHERE id = ?', [id]);
        return { id };
    }

    static async findById(id) {
        const [companies] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
        return companies[0];
    }

    static async getEligibleCount(id) {
        const company = await this.findById(id);
        if (!company) return 0;

        let sql = "SELECT COUNT(*) as count FROM student_placement_master WHERE willing = 'Willing'";
        const params = [];

        if (company.campus && company.campus !== 'Both') {
            sql += ' AND cambus_details = ?';
            params.push(company.campus);
        }

        if (company.min_10th_percent !== null && company.min_10th_percent !== '') {
            sql += ' AND tenth_percentage >= ?';
            params.push(company.min_10th_percent);
        }
        if (company.min_12th_percent !== null && company.min_12th_percent !== '') {
            sql += ' AND twelfth_percentage >= ?';
            params.push(company.min_12th_percent);
        }
        if (company.min_ug_cgpa !== null && company.min_ug_cgpa !== '') {
            sql += ' AND ug_pg_cgpa >= ?';
            params.push(company.min_ug_cgpa);
        }
        if (company.max_history_arrears !== null && company.max_history_arrears !== '') {
            sql += ' AND history_of_arrears <= ?';
            params.push(company.max_history_arrears);
        }
        if (company.max_current_arrears !== null && company.max_current_arrears !== '') {
            sql += ' AND current_arrears <= ?';
            params.push(company.max_current_arrears);
        }
        if (company.gender_preference && company.gender_preference !== 'All') {
            sql += ' AND gender = ?';
            params.push(company.gender_preference);
        }

        const [result] = await pool.query(sql, params);
        return result[0].count;
    }

    static async getEligibleStudents(id) {
        const company = await this.findById(id);
        if (!company) throw new Error('Company not found');

        let sql = "SELECT * FROM student_placement_master WHERE willing = 'Willing'";
        const params = [];

        if (company.campus && company.campus !== 'Both') {
            sql += ' AND cambus_details = ?';
            params.push(company.campus);
        }

        if (company.min_10th_percent !== null && company.min_10th_percent !== '') {
            sql += ' AND tenth_percentage >= ?';
            params.push(company.min_10th_percent);
        }
        if (company.min_12th_percent !== null && company.min_12th_percent !== '') {
            sql += ' AND twelfth_percentage >= ?';
            params.push(company.min_12th_percent);
        }
        if (company.min_ug_cgpa !== null && company.min_ug_cgpa !== '') {
            sql += ' AND ug_pg_cgpa >= ?';
            params.push(company.min_ug_cgpa);
        }
        if (company.max_history_arrears !== null && company.max_history_arrears !== '') {
            sql += ' AND history_of_arrears <= ?';
            params.push(company.max_history_arrears);
        }
        if (company.max_current_arrears !== null && company.max_current_arrears !== '') {
            sql += ' AND current_arrears <= ?';
            params.push(company.max_current_arrears);
        }
        if (company.gender_preference && company.gender_preference !== 'All') {
            sql += ' AND gender = ?';
            params.push(company.gender_preference);
        }

        sql += ' ORDER BY cambus_details ASC, department ASC';

        const [students] = await pool.query(sql, params);
        return students;
    }
}

export default Company;
