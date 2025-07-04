const { supabase, supabaseAdmin } = require('../config/database');

// Middleware to authenticate Supabase JWT tokens
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify Supabase JWT token using public client
    if (supabase) {
      // Set the session with the provided token
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: '' // Not needed for verification
      });
      
      if (sessionError || !sessionData?.user) {
        console.error('Supabase auth error:', sessionError);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      const user = sessionData.user;
      
      // Get user data from the database using admin client for database queries
      const { data: userData, error: userError } = await supabaseAdmin
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
      
      // Clear the session after verification to avoid side effects
      await supabase.auth.signOut();
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