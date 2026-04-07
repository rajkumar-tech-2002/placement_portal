import pool from '../config/db.config.js';

const migrate = async () => {
    try {
        console.log('Adding columns to drive_willingness table...');
        
        // 1. Check existing columns
        const [columns] = await pool.query('DESCRIBE drive_willingness');
        const fields = columns.map(c => c.Field);
        
        if (!fields.includes('department')) {
            await pool.query('ALTER TABLE drive_willingness ADD COLUMN department VARCHAR(100) AFTER student_reg_no');
            console.log('Added department column.');
        }
        
        if (!fields.includes('cambus_details')) {
            await pool.query('ALTER TABLE drive_willingness ADD COLUMN cambus_details VARCHAR(20) AFTER department');
            console.log('Added cambus_details column.');
        }
        
        // 2. Backfill existing data from student_placement_master
        console.log('Backfilling data...');
        await pool.query(`
            UPDATE drive_willingness dw
            JOIN student_placement_master spm ON dw.student_reg_no = spm.reg_no
            SET dw.department = spm.department,
                dw.cambus_details = spm.cambus_details
            WHERE dw.department IS NULL OR dw.cambus_details IS NULL
        `);
        console.log('Backfill complete.');
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
