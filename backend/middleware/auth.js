const { supabase } = require('../config/database');

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
      const { data, error } = await supabase.auth.getUser(token);
      const user = data?.user;
      
      if (error || !user) {
        console.error('Supabase auth error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      // Get user data from the database using Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user data from Supabase:', userError);
        // Use metadata as fallback if database query fails
        req.user = {
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'User',
          role: user.user_metadata?.role || 'artist'
        };
      } else if (userData) {
        // Use data from the database
        req.user = {
          userId: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        };
      } else {
        // Fallback to metadata if user not found in database
        req.user = {
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'User',
          role: user.user_metadata?.role || 'artist'
        };
      }
      
      console.log('Authenticated user:', req.user.name, 'with role:', req.user.role);
    } else {
      return res.status(500).json({ error: 'Authentication service not configured' });
    }
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken };