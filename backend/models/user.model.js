import pool from '../config/db.config.js';

class User {
    static async findByUserId(userId) {
        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        return users[0];
    }

    static async create(userData) {
        const { name, user_id, password, role, department, cambus } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (name, user_id, password, role, department, cambus) VALUES (?, ?, ?, ?, ?, ?)',
            [name, user_id, password, role, department, cambus]
        );
        return { id: result.insertId, ...userData };
    }

    static async findById(id) {
        const [users] = await pool.query('SELECT id, name, user_id, role, cambus FROM users WHERE id = ?', [id]);
        return users[0];
    }

    static async findAll() {
        const [users] = await pool.query('SELECT id, name, user_id, role, department, cambus, created_at FROM users ORDER BY created_at DESC');
        return users;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    
    static async update(id, userData) {
        const { name, user_id, role, department, cambus, password } = userData;
        let query = 'UPDATE users SET name = ?, user_id = ?, role = ?, department = ?, cambus = ?';
        let params = [name, user_id, role, department, cambus];
        
        if (password) {
            query += ', password = ?';
            params.push(password);
        }
        
        query += ' WHERE id = ?';
        params.push(id);
        
        const [result] = await pool.query(query, params);
        return result.affectedRows > 0;
    }

    static async deleteMany(ids) {
        const [result] = await pool.query('DELETE FROM users WHERE id IN (?)', [ids]);
        return result.affectedRows > 0;
    }
}

export default User;
