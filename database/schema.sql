CREATE DATABASE IF NOT EXISTS farmer_survey_db;
USE farmer_survey_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    telegram_chat_id VARCHAR(50),
    otp_code VARCHAR(10),
    otp_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS surveys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    village VARCHAR(100) NOT NULL,
    mandal VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    suggestion TEXT,
    audio_file VARCHAR(255),
    photo_file VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_description TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin users
INSERT INTO users (name, email, phone, password, role, status)
SELECT 'Admin User', 'nlr@kisaankrushi.com', '1234567890', '$2b$10$fT34YIAXqQbQDZiwtIym/eJJwpVK5g2L4tbG0kGI09G7UXcp8YSrhm', 'admin', 'active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nlr@kisaankrushi.com');

INSERT INTO users (name, email, phone, password, role, status)
SELECT 'CTO Admin', 'cto.kisaankrushi@gmail.com', '9876543210', '$2b$10$MmRvJIHLHoPf2FIibOeg7uvvfgGNoLAuW1C1aTyYsIX5k2/4avQZiC', 'admin', 'active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'cto.kisaankrushi@gmail.com');
