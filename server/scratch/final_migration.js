import pool from '../config/db.config.js';

const migrate = async () => {
    try {
        console.log('Starting migration...');

        // 1. Alter users table
        // - Change role to VARCHAR(255)
        // - Add department if missing
        // - Ensure campus is used
        const [userCols] = await pool.query('DESCRIBE users');
        const userFields = userCols.map(c => c.Field);

        if (!userFields.includes('department')) {
            await pool.query('ALTER TABLE users ADD COLUMN department VARCHAR(255) AFTER password');
            console.log('Added department column to users.');
        }

        // Change role to VARCHAR(255) to support dynamic roles
        await pool.query('ALTER TABLE users MODIFY COLUMN role VARCHAR(255) NOT NULL');
        console.log('Changed role column to VARCHAR(255) in users.');

        // If 'cambus' exists but 'campus' doesn't, rename it. 
        // Based on previous check, 'campus' exists. Let's just make sure it's VARCHAR(255).
        await pool.query('ALTER TABLE users MODIFY COLUMN campus VARCHAR(255) NOT NULL');
        console.log('Ensured campus column is VARCHAR(255) in users.');

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
