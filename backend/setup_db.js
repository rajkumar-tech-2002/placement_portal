import pool from './config/db.config.js';

const setupTables = async () => {
    try {
        console.log('Starting table setup...');
        
        // 1. Create drive_willingness table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS drive_willingness (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT NOT NULL,
                student_reg_no VARCHAR(255) NOT NULL,
                department VARCHAR(100),
                cambus_details VARCHAR(20),
                status ENUM('Pending', 'Willing', 'Not Willing', 'Attended', 'Absent') DEFAULT 'Willing',
                coordinator_id VARCHAR(255),
                remarks TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
                UNIQUE KEY unique_drive_student (company_id, student_reg_no)
            )
        `);
        console.log('Table drive_willingness verified/created.');

        // 2. Verify companies table has website and description
        const [columns] = await pool.query('DESCRIBE companies');
        const fields = columns.map(c => c.Field);
        
        if (!fields.includes('website')) {
            await pool.query('ALTER TABLE companies ADD COLUMN website VARCHAR(255) AFTER name');
            console.log('Added website column to companies.');
        }
        if (!fields.includes('description')) {
            await pool.query('ALTER TABLE companies ADD COLUMN description TEXT AFTER website');
            console.log('Added description column to companies.');
        }

        if (!fields.includes('campus')) {
            await pool.query("ALTER TABLE companies ADD COLUMN campus ENUM('NEC', 'NCT', 'Both') DEFAULT 'Both' AFTER description");
            console.log('Added campus column to companies.');
        }

        // 3. Verify users table has cambus
        const [userColumns] = await pool.query('DESCRIBE users');
        const userFields = userColumns.map(c => c.Field);

        if (!userFields.includes('cambus')) {
            await pool.query("ALTER TABLE users ADD COLUMN cambus ENUM('NEC', 'NCT', 'Both') DEFAULT 'Both' AFTER department");
            console.log('Added cambus column to users.');
        }

        console.log('Database setup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
};

setupTables();
