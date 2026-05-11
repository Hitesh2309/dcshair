const express = require('express');
const customerController = require('../controllers/customers/customerController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticateToken, customerController.createCustomer);
router.get('/', authenticateToken, customerController.getCustomers);

module.exports = router;
