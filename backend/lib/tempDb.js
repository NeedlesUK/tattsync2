/**
 * Temporary Database Connection Module for Backend
 * 
 * This module provides a simple in-memory database for testing and development
 * when the actual Supabase connection is not available or experiencing issues.
 */

// Helper function to check if temp DB should be used
const shouldUseTempDb = () => {
  // Always use real Supabase when credentials are available
  return false;
};

// Export a function to get either the real Supabase client or the temp DB
const getDbClient = (realSupabase, realSupabaseAdmin) => {
  // Always return the real Supabase clients
  return { supabase: realSupabase, supabaseAdmin: realSupabaseAdmin };
};

module.exports = {
  shouldUseTempDb,
  getDbClient
};