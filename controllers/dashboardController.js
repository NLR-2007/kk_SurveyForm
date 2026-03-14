const db = require('../database/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // Run multiple queries in parallel for efficiency
        const [
            [totalSurveys],
            [totalUsers],
            [surveysToday],
            [activeSurveyors]
        ] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM surveys'),
            db.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"'),
            db.execute('SELECT COUNT(*) as count FROM surveys WHERE DATE(created_at) = CURDATE()'),
            db.execute('SELECT COUNT(DISTINCT created_by) as count FROM surveys WHERE DATE(created_at) = CURDATE()')
        ]);

        res.status(200).json({
            totalSurveys: totalSurveys[0].count,
            totalUsers: totalUsers[0].count,
            surveysToday: surveysToday[0].count,
            activeSurveyors: activeSurveyors[0].count
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAnalyticsCharts = async (req, res) => {
    try {
        // District Distribution
        const [districtData] = await db.execute(`
            SELECT district, COUNT(*) as count 
            FROM surveys 
            GROUP BY district 
            ORDER BY count DESC
            LIMIT 10
        `);

        // Crop Distribution
        const [cropData] = await db.execute(`
            SELECT crop, COUNT(*) as count 
            FROM surveys 
            GROUP BY crop 
            ORDER BY count DESC
            LIMIT 10
        `);

        // Daily submissions for the last 7 days
        const [dailyData] = await db.execute(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM surveys 
            WHERE created_at >= DATE(NOW() - INTERVAL 7 DAY)
            GROUP BY DATE(created_at) 
            ORDER BY date ASC
        `);

        res.status(200).json({
            districtData,
            cropData,
            dailyData
        });
    } catch (error) {
        console.error('Analytics Charts Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
