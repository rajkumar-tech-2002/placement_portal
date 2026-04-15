import pool from '../config/db.config.js';

async function updateSchema() {
    try {
        console.log('Connecting to database...');
        
        console.log('Adding leetcode_username...');
        try {
            await pool.query('ALTER TABLE leetcode_details ADD COLUMN leetcode_username VARCHAR(255) AFTER leet_code_profile');
        } catch (e) { console.log('leetcode_username may already exist'); }
        
        console.log('Adding last_synced_at...');
        try {
            await pool.query('ALTER TABLE leetcode_details ADD COLUMN last_synced_at TIMESTAMP NULL AFTER updated_at');
        } catch (e) { console.log('last_synced_at may already exist'); }
        
        console.log('Adding sync_status...');
        try {
            await pool.query("ALTER TABLE leetcode_details ADD COLUMN sync_status ENUM('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' AFTER last_synced_at");
        } catch (e) { console.log('sync_status may already exist'); }
        
        console.log('Adding error_message...');
        try {
            await pool.query('ALTER TABLE leetcode_details ADD COLUMN error_message TEXT AFTER sync_status');
        } catch (e) { console.log('error_message may already exist'); }
        
        console.log('Adding total_solved...');
        try {
            await pool.query('ALTER TABLE leetcode_details ADD COLUMN total_solved INT DEFAULT 0 AFTER problem_solved_count');
        } catch (e) { console.log('total_solved may already exist'); }
        
        console.log('Creating index...');
        try {
            await pool.query('CREATE INDEX idx_leetcode_username ON leetcode_details(leetcode_username)');
        } catch (e) { console.log('Index may already exist'); }
        
        console.log('Database schema updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to update schema:', err.message);
        process.exit(1);
    }
}

updateSchema();
