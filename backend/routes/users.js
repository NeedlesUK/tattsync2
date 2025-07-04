const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only access their own data unless they're admin
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the requesting user is accessing their own data or is an admin
    if (req.user.userId !== id) {
      // Check if user is admin
      const userResult = await query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
      if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const result = await query(`
      SELECT id, name, email, role, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userResult = await query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const userRole = userResult.rows[0]?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all users' });
    }

    const result = await query(`
      SELECT id, name, email, role, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Check if user is admin
    const userResult = await query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const userRole = userResult.rows[0]?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update user roles' });
    }

    // Validate role
    const validRoles = ['admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer', 'event_manager', 'event_admin', 'client', 'studio_manager', 'judge'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await query(`
      UPDATE users 
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role, updated_at
    `, [role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;