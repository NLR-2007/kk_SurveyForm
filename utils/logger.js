const db = require('../database/db');

const logActivity = async (userId, actionDescription) => {
    try {
        await db.execute(
            'INSERT INTO activity_logs (user_id, action_description) VALUES (?, ?)',
            [userId, actionDescription]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = {
    logActivity
};
