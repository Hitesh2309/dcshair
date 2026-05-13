const express = require('express');
const contractController = require('../controllers/contracts/contractController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/create',                    authenticateToken, contractController.createContract);
router.get('/list',                       authenticateToken, contractController.getContracts);
router.get('/options',                    authenticateToken, contractController.getContractOptions);
router.get('/customer/:customerId/parties', authenticateToken, contractController.getCustomerParties);
router.post('/party',                     authenticateToken, contractController.createParty);
router.post('/terms-of-payment',          authenticateToken, contractController.createTermsOfPayment);
router.get('/:id/pdf',                    authenticateToken, contractController.getContractPdf);
router.get('/:id/preview',                authenticateToken, contractController.previewContractPdf);

module.exports = router;
