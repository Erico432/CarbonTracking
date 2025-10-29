// server/routes/auth.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/profile', protect, require('../controllers/authController').getProfile);
router.put('/profile', protect, require('../controllers/authController').updateProfile);

module.exports = router;
