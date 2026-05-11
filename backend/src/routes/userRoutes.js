const express = require('express');
const userController = require('../controllers/users/userController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// These will be mounted under specific paths in the main router
router.post('/login', userController.login);
router.post('/', authenticateToken, userController.createUser);
router.get('/', authenticateToken, userController.getUsers);

module.exports = router;
