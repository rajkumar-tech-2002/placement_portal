import pool from '../config/db.config.js';

async function updateCompaniesTable() {
    try {
        const [rows] = await pool.query('DESCRIBE companies');
        const columns = rows.map(r => r.Field);

        const newColumns = [
            'ALTER TABLE companies ADD COLUMN min_10th_percent DECIMAL(5,2) DEFAULT NULL',
            'ALTER TABLE companies ADD COLUMN min_12th_percent DECIMAL(5,2) DEFAULT NULL',
            'ALTER TABLE companies ADD COLUMN min_ug_cgpa DECIMAL(4,2) DEFAULT NULL',
            'ALTER TABLE companies ADD COLUMN max_history_arrears INT DEFAULT NULL',
            'ALTER TABLE companies ADD COLUMN max_current_arrears INT DEFAULT NULL',
            "ALTER TABLE companies ADD COLUMN gender_preference ENUM('All', 'Male', 'Female') DEFAULT 'All'"
        ];

        for (const sql of newColumns) {
            const columnName = sql.split('ADD COLUMN ')[1].split(' ')[0];
            if (!columns.includes(columnName)) {
                console.log(`Adding column ${columnName}...`);
                await pool.query(sql);
            } else {
                console.log(`Column ${columnName} already exists.`);
            }
        }

        console.log('Companies table updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating companies table:', error);
        process.exit(1);
    }
}

updateCompaniesTable();
