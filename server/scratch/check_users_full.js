import pool from '../config/db.config.js';

const check = async () => {
    try {
        const [userCols] = await pool.query('DESCRIBE users');
        console.log('Users table fields:');
        userCols.forEach(c => console.log(`- ${c.Field}: ${c.Type}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
