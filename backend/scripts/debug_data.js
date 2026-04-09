import pool from '../config/db.config.js';

async function checkData() {
    try {
        const [rows] = await pool.query('SELECT count(*) as count FROM student_placement_master');
        console.log('Total students in student_placement_master:', rows[0].count);

        const [pRows] = await pool.query('SELECT count(*) as count FROM placement_details');
        console.log('Total records in placement_details:', pRows[0].count);

        const [willingCounts] = await pool.query('SELECT willing, count(*) as count FROM student_placement_master GROUP BY willing');
        console.log('Willing counts:', willingCounts);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
