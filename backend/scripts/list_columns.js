import pool from './config/db.config.js';
const [rows] = await pool.query('DESCRIBE student_placement_master');
console.log(JSON.stringify(rows.map(r => r.Field), null, 2));
process.exit(0);
