const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/logger');
const { sendTelegramMessage } = require('../utils/telegram');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'User account is inactive' });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid password' });
        }

        console.log('User authenticated, generating OTP...');

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        await db.execute(
            'UPDATE users SET otp_code = ?, otp_expiry = ? WHERE id = ?',
            [otp, expiry, user.id]
        );
        console.log('OTP generated and saved to DB.');

        // Send via Telegram
        if (user.telegram_chat_id) {
            try {
                await sendTelegramMessage(
                    user.telegram_chat_id, 
                    `<b>🔐 Kisaan Krushi Login</b>\n\nYour OTP is: <code>${otp}</code>\nValid for 5 minutes.`
                );
                console.log('OTP sent via Telegram.');
            } catch (err) {
                console.error('Failed to send telegram OTP error details:', err.message);
                return res.status(500).json({ error: 'Failed to send OTP via Telegram' });
            }
        } else {
            console.log('Telegram Chat ID missing for user.');
            return res.status(400).json({ error: 'Telegram Chat ID not found for this user. Contact Admin.' });
        }

        res.status(200).json({
            message: 'OTP sent to Telegram',
            otpRequired: true,
            email: user.email
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = users[0];

        if (!user.otp_code || user.otp_code !== otp) {
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(401).json({ error: 'OTP expired' });
        }

        // Clear OTP after use
        await db.execute('UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = ?', [user.id]);

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: 86400 }
        );

        await logActivity(user.id, 'User logged in (OTP verified)');

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: token
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.logout = async (req, res) => {
    try {
        await logActivity(req.userId, 'User logged out');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.register = async (req, res) => {
    // Only Admin can do this (protected by middleware)
    try {
        const { name, email, phone, password, role, telegram_chat_id } = req.body;

        if (!telegram_chat_id) {
            return res.status(400).json({ error: 'Telegram Chat ID is mandatory' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, phone, password, role, telegram_chat_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, role || 'user', telegram_chat_id]
        );

        await logActivity(req.userId, `Registered new user: ${email}`);

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
