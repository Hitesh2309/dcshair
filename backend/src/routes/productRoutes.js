const express = require('express');
const productController = require('../controllers/products/productController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/create', authenticateToken, productController.createProduct);
router.post('/get', authenticateToken, productController.getProducts);

module.exports = router;
