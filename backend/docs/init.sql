-- Create Database
CREATE DATABASE IF NOT EXISTS placement_portal;
USE placement_portal;

-- 1. Users table (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'COORDINATOR', 'STUDENT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Students table (Industry Style)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    dept VARCHAR(100) NOT NULL,
    batch VARCHAR(10) NOT NULL, -- e.g., 2024, 2025
    sslc_percent DECIMAL(5, 2) NOT NULL,
    hsc_percent DECIMAL(5, 2) NOT NULL,
    ug_cgpa DECIMAL(4, 2) NOT NULL,
    current_arrears INT DEFAULT 0,
    history_of_arrears INT DEFAULT 0,
    skills JSON, -- List of skills
    resume_url VARCHAR(255),
    placed_status ENUM('NOT_PLACED', 'PLACED') DEFAULT 'NOT_PLACED',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Drives table
CREATE TABLE IF NOT EXISTS drives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    job_description TEXT,
    package_ctc DECIMAL(10, 2) NOT NULL, -- CTC in LPA
    location VARCHAR(255),
    drive_date DATE,
    last_date_to_apply DATE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 5. Eligibility Criteria table
CREATE TABLE IF NOT EXISTS eligibility_criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drive_id INT NOT NULL,
    min_sslc_percent DECIMAL(5, 2) DEFAULT 0,
    min_hsc_percent DECIMAL(5, 2) DEFAULT 0,
    min_ug_cgpa DECIMAL(4, 2) DEFAULT 0,
    max_current_arrears INT DEFAULT 0,
    allow_history_of_arrears BOOLEAN DEFAULT TRUE,
    allowed_departments JSON, -- Array of strings
    allowed_batches JSON, -- Array of strings
    FOREIGN KEY (drive_id) REFERENCES drives(id) ON DELETE CASCADE
);

-- 6. Rounds table
CREATE TABLE IF NOT EXISTS rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drive_id INT NOT NULL,
    round_name VARCHAR(100) NOT NULL,
    round_order INT NOT NULL, -- Sequence: 1, 2, 3...
    FOREIGN KEY (drive_id) REFERENCES drives(id) ON DELETE CASCADE
);

-- 7. Student Drive Status table (Core tracking)
CREATE TABLE IF NOT EXISTS student_drive_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    drive_id INT NOT NULL,
    is_eligible BOOLEAN DEFAULT FALSE,
    willingness BOOLEAN DEFAULT NULL, -- NULL: pending, TRUE: Yes, FALSE: No
    attendance BOOLEAN DEFAULT NULL, -- NULL: pending, TRUE: attended
    current_round_id INT, -- Current round student is in
    final_status ENUM('IN_PROGRESS', 'PLACED', 'REJECTED') DEFAULT 'IN_PROGRESS',
    rejected_at_round_id INT,
    offer_letter_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY student_drive (student_id, drive_id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (drive_id) REFERENCES drives(id),
    FOREIGN KEY (current_round_id) REFERENCES rounds(id),
    FOREIGN KEY (rejected_at_round_id) REFERENCES rounds(id)
);

-- 8. Round Results table
CREATE TABLE IF NOT EXISTS round_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    drive_id INT NOT NULL,
    round_id INT NOT NULL,
    status ENUM('PASS', 'FAIL', 'PENDING') DEFAULT 'PENDING',
    remarks TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY student_round (student_id, round_id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (drive_id) REFERENCES drives(id),
    FOREIGN KEY (round_id) REFERENCES rounds(id)
);
