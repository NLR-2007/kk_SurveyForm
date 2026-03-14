const db = require('../database/db');
const { logActivity } = require('../utils/logger');

exports.createSurvey = async (req, res) => {
    try {
        const {
            farmer_name, phone_number, village, mandal, district,
            state, crop, suggestion, latitude, longitude
        } = req.body;

        const photo_file = req.files['photo'] ? req.files['photo'][0].filename : null;
        const audio_file = req.files['audio'] ? req.files['audio'][0].filename : null;

        const [result] = await db.execute(
            `INSERT INTO surveys (
                farmer_name, phone_number, village, mandal, district, 
                state, crop, suggestion, audio_file, photo_file, 
                latitude, longitude, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                farmer_name, phone_number, village, mandal, district,
                state, crop, suggestion, audio_file, photo_file,
                latitude || null, longitude || null, req.userId
            ]
        );

        await logActivity(req.userId, `Submitted new survey for ${farmer_name} in ${district}`);

        res.status(201).json({ message: 'Survey created successfully', surveyId: result.insertId });
    } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllSurveys = async (req, res) => {
    try {
        const { district, crop, surveyorId, startDate, endDate } = req.query;
        let query = `
            SELECT s.*, u.name as surveyor_name 
            FROM surveys s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE 1=1
        `;
        const queryParams = [];

        if (district) {
            query += ' AND s.district = ?';
            queryParams.push(district);
        }
        if (crop) {
            query += ' AND s.crop = ?';
            queryParams.push(crop);
        }
        if (surveyorId) {
            query += ' AND s.created_by = ?';
            queryParams.push(surveyorId);
        }
        if (startDate && endDate) {
            query += ' AND DATE(s.created_at) BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }

        query += ' ORDER BY s.created_at DESC';

        const [surveys] = await db.execute(query, queryParams);
        res.status(200).json(surveys);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserSurveys = async (req, res) => {
    try {
        const [surveys] = await db.execute(
            'SELECT * FROM surveys WHERE created_by = ? ORDER BY created_at DESC',
            [req.userId]
        );
        res.status(200).json(surveys);
    } catch (error) {
        console.error('Error in getUserSurveys:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute('DELETE FROM surveys WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        
        await logActivity(req.userId, `Deleted survey ID: ${id}`);
        res.status(200).json({ message: 'Survey deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
