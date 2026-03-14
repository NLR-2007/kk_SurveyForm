const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Adding columns to users table...');
        // Standard MySQL ALTER TABLE (IF NOT EXISTS is not standard for columns, so we'll catch errors)
        const queries = [
            "ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR(50) AFTER phone",
            "ALTER TABLE users ADD COLUMN otp_code VARCHAR(10) AFTER password",
            "ALTER TABLE users ADD COLUMN otp_expiry DATETIME AFTER otp_code"
        ];

        for (const q of queries) {
            try {
                await connection.query(q);
                console.log(`Success: ${q}`);
            } catch (e) {
                if (e.code === 'ER_DUP_COLUMN_NAME') {
                    console.log(`Column already exists: ${q.split(' ').pop()}`);
                } else {
                    console.error(`Error in ${q}:`, e.message);
                }
            }
        }
        
        console.log('Update Main Admin...');
        await connection.query("UPDATE users SET telegram_chat_id = '8457143835' WHERE email = 'nlr@kisaankrushi.com'");
        console.log('Migration complete.');

    } catch (err) {
        console.error('Migration FAILED:', err);
    } finally {
        await connection.end();
        process.exit();
    }
}

migrate();
