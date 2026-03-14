const db = require('./database/db');

async function diagnostic() {
    try {
        console.log('--- Database Diagnostic ---');
        const [columns] = await db.query('SHOW COLUMNS FROM users');
        console.log('Columns in "users" table:');
        columns.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));

        const otpCols = ['otp_code', 'otp_expiry', 'telegram_chat_id'];
        const missing = otpCols.filter(name => !columns.some(col => col.Field === name));

        if (missing.length > 0) {
            console.error('MISSING COLUMNS:', missing.join(', '));
        } else {
            console.log('All required columns exist.');
        }

    } catch (err) {
        console.error('Diagnostic FAILED:', err);
    } finally {
        process.exit();
    }
}

diagnostic();
