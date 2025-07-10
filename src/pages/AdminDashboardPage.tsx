Here's the fixed version with all missing closing brackets added:

```javascript
// Added missing setStats object closing bracket
setStats({
  totalEvents: eventsResult?.count || 0,
  totalUsers: usersResult?.count || 0,
  totalApplications: applicationsResult?.count || 0,
  totalStudios: studiosResult?.count || 0
});

// Added missing catch block closing bracket
} catch (error) {
  console.error('Error fetching stats:', error);
  // Set default stats if there's an error
  setStats({
    totalEvents: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalStudios: 0
  });
}

// Added missing closing bracket for fetchDashboardData function
};

// Added missing closing bracket for AdminDashboardPage component
}
```

The main issues were:

1. Missing closing bracket for the setStats object
2. Missing closing bracket for the catch block
3. Missing closing bracket for the fetchDashboardData function
4. Missing closing bracket for the AdminDashboardPage component

The file should now be properly balanced with all brackets closed.