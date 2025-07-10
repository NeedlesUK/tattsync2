Here's the fixed version with all missing closing brackets added:

```javascript
const fetchDashboardData = async () => {
  try {
    setIsLoading(true);

    if (supabase) {
      console.log('Fetching admin dashboard data...');
      // Fetch stats
      const [usersResult, eventsResult, studiosResult] = await Promise.all([
        supabase.from('users').select('count'),
        supabase.from('events').select('count'),
        supabase.from('studios').select('count')
      ]);

      console.log('Stats results:', { 
        users: usersResult, 
        events: eventsResult, 
        studios: studiosResult
      });

      setStats({
        totalUsers: usersResult.data?.[0]?.count || 0,
        totalEvents: eventsResult.data?.[0]?.count || 0,
        totalStudios: studiosResult.data?.[0]?.count || 0
      });

      // Fetch recent users
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setRecentUsers(users || []);
      }

      // Fetch events for module management
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          name,
          status,
          event_modules (
            id,
            ticketing_enabled,
            consent_forms_enabled,
            tattscore_enabled
          )
        `)
        .order('created_at', { ascending: false });
        
      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else {
        setEvents(eventsData || []);
      }
      
      // Fetch consent templates
      fetchTemplates();
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setIsLoading(false);
  }
};
```

The main issues were:

1. A duplicate `fetchTemplates();\` call was removed
2. The closing brace for the `if (supabase)\` block was missing
3. The closing brace for the `try\` block was missing
4. The closing brace for the `fetchDashboardData\` function was missing

The rest of the file was properly closed and structured.