const express = require('express');
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');
const productRoutes = require('./productRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const contractRoutes = require('./contractRoutes');

const router = express.Router();

// Auth routes (Login)
router.use('/auth', userRoutes); 

// Management routes
router.use('/users', userRoutes); 
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/contracts', contractRoutes);

module.exports = router;
