# Login Troubleshooting Guide

## Common Login Issues and Solutions

If you encounter issues with the login process hanging despite receiving a positive response from the authentication server, follow these steps to diagnose and fix the problem:

### 1. Check Console Logs

First, check the browser console for any errors or warnings:
- Look for authentication-related messages
- Check for any failed network requests
- Look for React rendering errors

### 2. Quick Fixes

Try these quick fixes first:

1. **Clear browser cache and cookies**
2. **Try a different browser**
3. **Restart the development server**

### 3. Code Fixes

If the issue persists, implement these fixes:

#### Fix 1: Set User State Immediately After Login

In `AuthContext.tsx`, ensure the user state is set immediately after login success:

```typescript
// In updateUserState function
if (session?.user) {
  // Set user immediately with basic information from session
  const userMetadata = session.user.user_metadata || {};
  const initialUser = {
    id: session.user.id,
    name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    role: userMetadata.role || 'artist', 
    roles: userMetadata.roles || [userMetadata.role || 'artist']
  };
  
  setUser(initialUser);
  setIsLoading(false);
  
  // Then continue with the full user data fetch...
}
```

#### Fix 2: Add Null Checks in Components

Ensure all components that use user data have proper null checks:

```typescript
// Instead of this
const isAdmin = user.role === 'admin';

// Do this
const isAdmin = user?.role === 'admin';
```

#### Fix 3: Force Navigation After Login

In the login handler, force navigation after successful login:

```typescript
const success = await login(formData.email, formData.password);
if (success) {
  // Force navigation to dashboard using window.location for a hard refresh
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 500);
}
```

#### Fix 4: Avoid Redundant State Updates

Ensure you're not setting user state multiple times in quick succession:

```typescript
// In login function
// Don't set user state here if updateUserState will do it
// Let updateUserState handle all user state updates
```

### 4. Debugging Techniques

If login issues persist:

1. Add more detailed logging throughout the authentication flow:
   ```typescript
   console.log('⏱️ Login attempt timestamp:', new Date().toISOString());
   console.log('📊 Database query result:', data);
   console.log('🔄 User state update:', {id, name, email, role});
   ```

2. Check network requests in the browser's Network tab:
   - Look for the auth request to `/auth/v1/token`
   - Check for any subsequent requests to fetch user data
   - Verify that all requests complete successfully

3. Verify that the Supabase client is properly initialized:
   ```typescript
   console.log('Supabase client initialized:', !!supabase);
   ```

4. Check that environment variables are correctly set:
   ```typescript
   console.log('🔑 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL?.substring(0, 10) + '...');
   console.log('🔑 VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
   console.log('🔑 API_URL:', import.meta.env.VITE_API_URL);
   ```

### 5. Database Structure Issues

If you have both `users` and `user_profiles` tables:

1. Ensure the relationship is correctly established:
   - `users` table should have the core user data (id, name, email, role)
   - `user_profiles` table should have extended profile information
   - They should be linked by the user's ID

2. Check that your `fetchUserData` function correctly queries both tables if needed:
   ```typescript
   const { data: userData } = await supabase
     .from('users')
     .select('*, user_profiles(*)')
     .eq('id', userId)
     .single();
   ```

3. Ensure RLS policies allow the user to read their own data

### 6. Last Resort Solutions

If all else fails:

1. Force a hard navigation with timeout:
   ```typescript
   setTimeout(() => {
     console.log('🧭 Forcing navigation to dashboard');
     window.location.href = '/dashboard';
   }, 1000);
   ```

2. Implement a loading state indicator:
   ```typescript
   {isLoading ? (
     <div className="loading-spinner">Loading user data...</div>
   ) : (
     <UserDashboard user={user} />
   )}
   ```

3. Add database read verification:
   ```typescript
   console.log('✅ DATABASE READ CONFIRMED - User data:', userData);
   ```