import pool from '../config/db.config.js';

const migratePendingToWilling = async () => {
    try {
        console.log('Starting migration: Pending -> Willing');
        
        // Update existing records
        const [result] = await pool.query("UPDATE drive_willingness SET status = 'Willing' WHERE status = 'Pending'");
        console.log(`Updated ${result.affectedRows} records from Pending to Willing.`);
        
        // Also update the table default for the column
        await pool.query("ALTER TABLE drive_willingness MODIFY COLUMN status ENUM('Pending', 'Willing', 'Not Willing', 'Attended', 'Absent') DEFAULT 'Willing'");
        console.log('Updated table default for status column.');

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migratePendingToWilling();
