const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// All endpoints here require Admin rights
router.use([verifyToken, verifyAdmin]);

router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.updateUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
