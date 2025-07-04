const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user conversations (protected route)
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // This is a simplified version - in a real app you'd have a more complex conversation system
    const result = await query(`
      SELECT DISTINCT
        u.id,
        u.name,
        u.role,
        u.email
      FROM users u
      WHERE u.id != $1
      ORDER BY u.name
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

module.exports = router;