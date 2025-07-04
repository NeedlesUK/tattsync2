const jwt = require('jsonwebtoken');
const { supabase, query } = require('../config/database');

// Middleware to authenticate Supabase JWT tokens
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify Supabase JWT token
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error('Supabase auth error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      console.log('Supabase user data:', user);
      
      // Always query the database for the user's role to ensure consistency
      let role = 'artist'; // Default fallback
      try {
        const userResult = await query('SELECT role FROM users WHERE id = $1', [user.id]);
        if (userResult.rows.length > 0) {
          role = userResult.rows[0].role;
          console.log('Role from database:', role);
        } else {
          console.log('User not found in database, using default role:', role);
        }
      } catch (dbError) {
        console.error('Error fetching user role from database:', dbError);
        // Use metadata as fallback only if database query fails
        role = user.user_metadata?.role || 'artist';
        console.log('Using metadata role as fallback:', role);
      }
      
      req.user = {
        userId: user.id,
        email: user.email,
        role: role
      };
      
      console.log('Authenticated user:', req.user);
    } else {
      // Fallback to JWT verification if Supabase is not configured
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken };