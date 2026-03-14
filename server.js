const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve HTML pages (basic routing for frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Import Routes
const authRoutes = require('./routes/auth');
const surveyRoutes = require('./routes/surveys');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
