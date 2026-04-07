import pool from './config/db.config.js';
const [rows] = await pool.query('DESCRIBE student_placement_master');
console.log(rows.map(r => r.Field));
process.exit(0);
