const db = require('../database/db');
const { logActivity } = require('../utils/logger');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, phone, role, status, created_at FROM users');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // active or inactive

        if (status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const [result] = await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: `User status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Protection for Main Admin
        const [targetUser] = await db.execute('SELECT email FROM users WHERE id = ?', [id]);
        if (targetUser.length > 0 && targetUser[0].email === 'nlr@kisaankrushi.com') {
            const [requester] = await db.execute('SELECT email FROM users WHERE id = ?', [req.userId]);
            if (requester[0].email !== 'nlr@kisaankrushi.com') {
                return res.status(403).json({ error: 'Permissions denied. Main Admin cannot be deleted by other admins.' });
            }
        }

        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await logActivity(req.userId, `Deleted user ID: ${id}`);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, role, telegram_chat_id } = req.body;

        const [result] = await db.execute(
            'UPDATE users SET name = ?, phone = ?, role = ?, telegram_chat_id = ? WHERE id = ?',
            [name, phone, role, telegram_chat_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await logActivity(req.userId, `Updated details for user ID: ${id}`);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
