import pool from './config/db.config.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 8);
        await pool.query(
            'INSERT INTO users (name, user_id, password, role, department, cambus) VALUES (?, ?, ?, ?, ?, ?)',
            ['Test Admin', 'testadmin', hashedPassword, 'ADMIN', 'Placement', 'Both']
        );
        console.log('Test admin created successfully: testadmin / admin123');
        process.exit(0);
    } catch (error) {
        console.error('Failed to create test admin:', error);
        process.exit(1);
    }
};

createAdmin();
