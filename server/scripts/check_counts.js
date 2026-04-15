import pool from '../config/db.config.js';

async function checkCounts() {
    try {
        const [rows] = await pool.query('SELECT willing, count(*) as count FROM student_placement_master GROUP BY willing');
        console.log('Willing counts:', JSON.stringify(rows, null, 2));

        const [pRows] = await pool.query('SELECT placed, count(*) as count FROM placement_details GROUP BY placed');
        console.log('Placed counts:', JSON.stringify(pRows, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCounts();
