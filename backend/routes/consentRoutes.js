const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');

// Submit a new consent form
router.post('/submit', consentController.submitConsentForm);

// Get consent form by ID
router.get('/forms/:id', consentController.getConsentForm);

// Get consent form by QR code
router.get('/qr/:code', consentController.getConsentFormByQrCode);

// Get consent form template by ID
router.get('/templates/:id', consentController.getConsentFormTemplate);

// Get all consent form templates
router.get('/templates', consentController.getAllConsentFormTemplates);

// Get all aftercare templates
router.get('/aftercare', consentController.getAllAftercareTemplates);

// Get aftercare template by ID
router.get('/aftercare/:id', consentController.getAftercareTemplate);

module.exports = router;