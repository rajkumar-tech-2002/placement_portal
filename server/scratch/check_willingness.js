import pool from '../config/db.config.js';

const check = async () => {
    try {
        const [cols] = await pool.query('DESCRIBE drive_willingness');
        console.log('drive_willingness fields:', JSON.stringify(cols, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
