import pool from '../config/db.config.js';

class Role {
    static async findAll() {
        const [roles] = await pool.query('SELECT * FROM role_master ORDER BY role DESC');
        return roles;
    }

    static async create(roleName) {
        const [result] = await pool.query('INSERT INTO role_master (role) VALUES (?)', [roleName]);
        return { id: result.insertId, role: roleName };
    }

    static async update(id, roleName) {
        await pool.query('UPDATE role_master SET role = ? WHERE id = ?', [roleName, id]);
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM role_master WHERE id = ?', [id]);
        return true;
    }
}

export default Role;
