const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const surveyController = require('../controllers/surveyController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const fs = require('fs');

// Ensure upload directories exist
const photosDir = path.join(__dirname, '..', 'uploads', 'photos');
const audioDir = path.join(__dirname, '..', 'uploads', 'audio');

if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// Multer configured for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'photo') {
            cb(null, photosDir);
        } else if (file.fieldname === 'audio') {
            cb(null, audioDir);
        } else {
            cb(null, 'uploads');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
router.post(
    '/',
    [verifyToken],
    upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
    surveyController.createSurvey
);

// Admin routes
router.get('/', [verifyToken, verifyAdmin], surveyController.getAllSurveys);
router.delete('/:id', [verifyToken, verifyAdmin], surveyController.deleteSurvey);

// User routes (get own surveys)
router.get('/my-surveys', [verifyToken], surveyController.getUserSurveys);

module.exports = router;
