import pool from '../config/db.config.js';

class Role {
    static async findAll() {
        const [roles] = await pool.query('SELECT * FROM role_master ORDER BY role ASC');
        return roles;
    }

    static async create(roleName) {
        const [result] = await pool.query('INSERT INTO role_master (role) VALUES (?)', [roleName]);
        return { id: result.insertId, role: roleName };
    }
}

export default Role;
