const express = require('express');
const contractController = require('../controllers/contracts/contractController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticateToken, contractController.createContract);
router.get('/', authenticateToken, contractController.getContracts);

module.exports = router;
