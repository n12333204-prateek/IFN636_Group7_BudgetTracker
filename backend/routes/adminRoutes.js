const express = require('express');
const { getAllUsers, updateUserStatus, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/status', protect, adminOnly, updateUserStatus);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;