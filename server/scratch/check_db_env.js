import pool from '../config/db.config.js';

const check = async () => {
    try {
        const [db] = await pool.query('SELECT DATABASE()');
        console.log('Current database:', db[0]['DATABASE()']);

        const [tables] = await pool.query('SHOW TABLES');
        console.log('Tables:', JSON.stringify(tables, null, 2));

        const [userCols] = await pool.query('DESCRIBE users');
        console.log('Users table fields:', JSON.stringify(userCols, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
