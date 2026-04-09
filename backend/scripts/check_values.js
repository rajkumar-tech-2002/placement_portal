import pool from '../config/db.config.js';

async function checkValues() {
    try {
        const [wRows] = await pool.query('SELECT DISTINCT willing FROM student_placement_master');
        console.log('Distinct willing values:', JSON.stringify(wRows));

        const [pRows] = await pool.query('SELECT DISTINCT placed FROM placement_details');
        console.log('Distinct placed values:', JSON.stringify(pRows));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkValues();
