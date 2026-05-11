const express = require('express');
const shipmentController = require('../controllers/shipments/shipmentController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticateToken, shipmentController.createShipment);
router.get('/', authenticateToken, shipmentController.getShipments);

module.exports = router;
