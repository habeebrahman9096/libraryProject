const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middleware/auth');

// Admin login page
router.get('/login', forwardAuthenticated, authController.getLoginPage);

// Admin login submission
router.post('/login', forwardAuthenticated, authController.postLogin);

// Admin logout
router.post('/logout', authController.postLogout);
router.get('/logout', authController.postLogout);

module.exports = router;
