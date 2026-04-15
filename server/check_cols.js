import pool from './config/db.config.js';
async function run() {
    try {
        const [rows] = await pool.query('DESCRIBE student_placement_master');
        console.log('Columns:');
        rows.forEach(r => console.log(`- ${r.Field}`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
