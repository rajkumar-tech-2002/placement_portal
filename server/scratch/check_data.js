import pool from '../config/db.config.js';

const check = async () => {
    try {
        const [roles] = await pool.query('SELECT * FROM role_master');
        console.log('Roles data:', JSON.stringify(roles, null, 2));

        const [users] = await pool.query('SELECT name, role FROM users');
        console.log('Users data:', JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
