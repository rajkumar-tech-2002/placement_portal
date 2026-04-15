import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test the connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL');
        connection.release();
    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
    }
})();

export default pool;
