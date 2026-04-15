import pool from '../config/db.config.js';

const updateSchemaV3 = async () => {
    try {
        console.log('Updating leetcode_details schema for precise totals...');
        
        const addColumn = async (sql) => {
            try {
                await pool.query(sql);
            } catch (err) {
                if (err.code !== 'ER_DUP_FIELDNAME') throw err;
            }
        };

        await addColumn('ALTER TABLE leetcode_details ADD COLUMN total_participants INT DEFAULT 0');
        await addColumn('ALTER TABLE leetcode_details ADD COLUMN last_contest_total_questions INT DEFAULT 0');
        await addColumn('ALTER TABLE leetcode_details ADD COLUMN last_contest_solved INT DEFAULT 0');

        console.log('Schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to update schema:', error);
        process.exit(1);
    }
};

updateSchemaV3();
