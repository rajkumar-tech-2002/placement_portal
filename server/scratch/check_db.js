import pool from '../config/db.config.js';

const check = async () => {
    try {
        const [userCols] = await pool.query('DESCRIBE users');
        console.log('Users table:', JSON.stringify(userCols, null, 2));

        const [roleCols] = await pool.query('DESCRIBE role_master');
        console.log('Role Master table:', JSON.stringify(roleCols, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
