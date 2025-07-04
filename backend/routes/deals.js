const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all deals (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // For now, return empty array since we don't have deals table yet
    // In a real implementation, you'd query the deals table
    res.json([]);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

module.exports = router;