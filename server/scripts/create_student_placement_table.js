import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const createTableSQL = `
CREATE TABLE IF NOT EXISTS student_placement_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50),
    name VARCHAR(100),
    cambus_details VARCHAR(10),
    willing VARCHAR(100),
    willing_domain VARCHAR(100),
    eligibility ENUM('Yes','No'),
    company_name VARCHAR(100),
    salary_range VARCHAR(50),
    salary DECIMAL(10,2),
    placed ENUM('Yes','No'),
    domain VARCHAR(100),
    dob DATE,
    gender ENUM('Male','Female','Other'),
    tenth_percentage DECIMAL(5,2),
    tenth_year YEAR,
    tenth_board VARCHAR(100),
    tenth_school_name VARCHAR(255),
    tenth_school_district VARCHAR(100),
    twelfth_percentage DECIMAL(5,2),
    twelfth_cutoff DECIMAL(5,2),
    twelfth_year YEAR,
    twelfth_board VARCHAR(100),
    twelfth_school_name VARCHAR(255),
    twelfth_school_district VARCHAR(100),
    diploma_percentage DECIMAL(5,2),
    diploma_branch VARCHAR(100),
    diploma_year YEAR,
    diploma_board VARCHAR(100),
    diploma_college_name VARCHAR(255),
    diploma_college_district VARCHAR(100),
    study_gap_years INT,
    current_arrears INT,
    history_of_arrears INT,
    ug_pg_cgpa DECIMAL(4,2),
    student_mobile VARCHAR(15),
    student_mobile_alt VARCHAR(15),
    whatsapp_number VARCHAR(15),
    personal_email VARCHAR(100),
    college_email VARCHAR(100),
    father_mobile VARCHAR(15),
    mother_mobile VARCHAR(15),
    aadhaar_number VARCHAR(20),
    pan_number VARCHAR(20),
    laptop_available ENUM('Yes','No'),
    address TEXT,
    pincode VARCHAR(10),
    hometown_district VARCHAR(100),
    programming_languages TEXT,
    technical_skills TEXT,
    certification_courses TEXT,
    if_mca_ug_degree VARCHAR(100),
    if_mca_ug_stream VARCHAR(100),
    if_mca_ug_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');
        await connection.query(createTableSQL);
        console.log('Table student_placement_master created or already exists.');
        await connection.end();
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

run();
