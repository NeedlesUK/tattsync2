const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');

// Submit a new consent form
router.post('/submit', consentController.submitConsentForm);

// Get consent form by ID
router.get('/forms/:id', consentController.getConsentForm);

// Get consent form by QR code
router.get('/qr/:code', consentController.getConsentFormByQrCode);

module.exports = router;