import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, MessageCircle, Settings, Shield, User, Mail, Edit, Key, X, FileText, Heart, Building, BarChart, Globe, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '../components/dashboard/StatsCard';

export function AdminDashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalStudios: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [aftercareTemplates, setAftercareTemplates] = useState<any[]>([]);

  // Navigation state
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    // Only allow admin access
    if (user?.role !== 'admin' && user?.email !== 'admin@tattsync.com') {
      navigate('/dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

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
         console.log('Fetched events with modules:', eventsData);
          setEvents(eventsData || []);
        }
        
        // Fetch templates
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = () => {
    if (!supabase) return;
    
    // Fetch consent templates
    supabase
      .from('consent_form_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching consent templates:', error);
        } else {
          console.log('Fetched consent templates:', data);
          setTemplates(data || []);
        }
      });
    
    // Fetch aftercare templates
    supabase
      .from('aftercare_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching aftercare templates:', error);
        } else {
          console.log('Fetched aftercare templates:', data);
          setAftercareTemplates(data || []);
        }
      });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Navigation sections
  const navSections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart, color: 'bg-blue-600' },
    { id: 'event-modules', label: 'Event Modules', icon: Calendar, color: 'bg-purple-600' },
    { id: 'user-management', label: 'User Management', icon: Users, color: 'bg-indigo-600' },
    { id: 'consent-templates', label: 'Consent Templates', icon: Heart, color: 'bg-pink-600' },
    { id: 'aftercare-templates', label: 'Aftercare Templates', icon: FileText, color: 'bg-teal-600' },
    { id: 'statistics', label: 'Statistics', icon: BarChart, color: 'bg-blue-600' },
    { id: 'system-status', label: 'System Status', icon: Settings, color: 'bg-gray-600' },
    { id: 'global-deals', label: 'Global Deals', icon: Globe, color: 'bg-green-600' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only allow admin access
  if (user?.role !== 'admin' && user?.email !== 'admin@tattsync.com') {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">
            Welcome to the TattSync Master Admin Dashboard
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {navSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeSection === section.id
                    ? `${section.color || 'bg-purple-600'} text-white`
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${activeSection !== 'dashboard' && 'hidden'}`}>
          <StatsCard 
            title="Total Users"
            value={stats.totalUsers.toString()}
            change=""
            icon={Users}
            color="purple"
          />
          <StatsCard 
            title="Total Events"
            value={stats.totalEvents.toString()}
            change=""
            icon={Calendar}
            color="teal"
          />
          <StatsCard 
            title="Total Studios"
            value={stats.totalStudios.toString()}
            change=""
            icon={Building}
            color="orange"
          />
        </div>

        {/* Main Content */}
        {/* Dashboard Section - Overview */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${activeSection !== 'dashboard' && 'hidden'}`}>
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Users</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/admin/users?edit=${user.id}`)}
                              className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded text-sm transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/users?password=${user.id}`)}
                              className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded text-sm transition-colors"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {recentUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No users found</p>
                </div>
              )}
              
              <div className="mt-4 text-right">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View All Users
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Modules Section */}
        <div className={activeSection !== 'event-modules' ? 'hidden' : ''}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Event Module Management</h2>
              <button
                onClick={() => navigate('/events')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Create New Event
              </button>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticketing</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Consent Forms</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TattScore</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white font-medium">{event.name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            event.status === 'published' 
                              ? 'bg-green-500/20 text-green-400' 
                              : event.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={event.event_modules && event.event_modules[0] ? event.event_modules[0].ticketing_enabled : false} 
                              onChange={async (e) => {
                                if (supabase) {
                                  const newValue = e.target.checked;
                                  console.log(`Updating ticketing_enabled to ${newValue} for event ${event.id}`);
                                  const { error } = await supabase
                                    .from('event_modules')
                                    .upsert({
                                      event_id: event.id,
                                      ticketing_enabled: newValue,
                                      // Preserve other module settings
                                      consent_forms_enabled: event.event_modules?.[0]?.consent_forms_enabled,
                                      tattscore_enabled: event.event_modules?.[0]?.tattscore_enabled,
                                      messaging_enabled: event.event_modules?.[0]?.messaging_enabled,
                                      applications_enabled: event.event_modules?.[0]?.applications_enabled,
                                      deals_enabled: event.event_modules?.[0]?.deals_enabled,
                                      booking_enabled: event.event_modules?.[0]?.booking_enabled,
                                      updated_at: new Date().toISOString()
                                    }, { onConflict: 'event_id' });
                                    
                                  if (error) {
                                    console.error('Error updating ticketing module:', error);
                                  } else {
                                    console.log('Successfully updated ticketing module');
                                    // Update local state
                                    setEvents(events.map(e => {
                                      if (e.id === event.id) {
                                        return {
                                          ...e,
                                          event_modules: [{
                                            ...e.event_modules[0],
                                            ticketing_enabled: newValue
                                          }]
                                        };
                                      }
                                      return e;
                                    }));
                                  }
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={event.event_modules && event.event_modules[0] ? event.event_modules[0].consent_forms_enabled : false}
                              onChange={async (e) => {
                                if (supabase) {
                                  const newValue = e.target.checked;
                                  console.log(`Updating consent_forms_enabled to ${newValue} for event ${event.id}`);
                                  const { error } = await supabase
                                    .from('event_modules')
                                    .upsert({
                                      event_id: event.id,
                                      consent_forms_enabled: newValue,
                                      // Preserve other module settings
                                      ticketing_enabled: event.event_modules?.[0]?.ticketing_enabled,
                                      tattscore_enabled: event.event_modules?.[0]?.tattscore_enabled,
                                      messaging_enabled: event.event_modules?.[0]?.messaging_enabled,
                                      applications_enabled: event.event_modules?.[0]?.applications_enabled,
                                      deals_enabled: event.event_modules?.[0]?.deals_enabled,
                                      booking_enabled: event.event_modules?.[0]?.booking_enabled,
                                      updated_at: new Date().toISOString()
                                    }, { onConflict: 'event_id' });
                                    
                                  if (error) {
                                    console.error('Error updating consent forms module:', error);
                                  } else {
                                    console.log('Successfully updated consent forms module');
                                    // Update local state
                                    setEvents(events.map(e => {
                                      if (e.id === event.id) {
                                        return {
                                          ...e,
                                          event_modules: [{
                                            ...e.event_modules[0],
                                            consent_forms_enabled: newValue
                                          }]
                                        };
                                      }
                                      return e;
                                    }));
                                  }
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={event.event_modules && event.event_modules[0] ? event.event_modules[0].tattscore_enabled : false}
                              onChange={async (e) => {
                                if (supabase) {
                                  const newValue = e.target.checked;
                                  console.log(`Updating tattscore_enabled to ${newValue} for event ${event.id}`);
                                  const { error } = await supabase
                                    .from('event_modules')
                                    .upsert({
                                      event_id: event.id,
                                      tattscore_enabled: newValue,
                                      // Preserve other module settings
                                      ticketing_enabled: event.event_modules?.[0]?.ticketing_enabled,
                                      consent_forms_enabled: event.event_modules?.[0]?.consent_forms_enabled,
                                      messaging_enabled: event.event_modules?.[0]?.messaging_enabled,
                                      applications_enabled: event.event_modules?.[0]?.applications_enabled,
                                      deals_enabled: event.event_modules?.[0]?.deals_enabled,
                                      booking_enabled: event.event_modules?.[0]?.booking_enabled,
                                      updated_at: new Date().toISOString()
                                    }, { onConflict: 'event_id' });
                                    
                                  if (error) {
                                    console.error('Error updating tattscore module:', error);
                                  } else {
                                    console.log('Successfully updated tattscore module');
                                    // Update local state
                                    setEvents(events.map(e => {
                                      if (e.id === event.id) {
                                        return {
                                          ...e,
                                          event_modules: [{
                                            ...e.event_modules[0],
                                            tattscore_enabled: newValue
                                          }]
                                        };
                                      }
                                      return e;
                                    }));
                                  }
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {events.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No events found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Consent Templates Section */}
        <div className={activeSection !== 'consent-templates' ? 'hidden' : ''}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Consent Form Templates</h2>
              <button
                onClick={() => navigate('/admin/consent-templates')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Manage Templates
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Template Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Medical History</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-medium">{template.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {template.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {template.requires_medical_history ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                            Required
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
                            Not Required
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(template.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/consent-templates?edit=${template.id}`)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {templates.length === 0 && (
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No consent templates found</p>
                <button
                  onClick={() => navigate('/admin/consent-templates')}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Template</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Aftercare Templates Section */}
        <div className={activeSection !== 'aftercare-templates' ? 'hidden' : ''}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Aftercare Templates</h2>
              <button
                onClick={() => navigate('/admin/aftercare-templates')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Manage Templates
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Template Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Procedure Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {aftercareTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-medium">{template.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {template.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 capitalize">
                          {template.procedure_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(template.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/aftercare-templates?edit=${template.id}`)}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {aftercareTemplates.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No aftercare templates found</p>
                <button
                  onClick={() => navigate('/admin/aftercare-templates')}
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Template</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Management Section */}
        <div className={activeSection !== 'user-management' ? 'hidden' : ''}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">User Management</h2>
              <button
                onClick={() => navigate('/admin/users')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View All Users
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/users?edit=${user.id}`)}
                            className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded text-sm transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/users?password=${user.id}`)}
                            className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded text-sm transition-colors"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className={activeSection !== 'statistics' ? 'hidden' : ''}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">System Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard 
                title="Total Users"
                value={stats.totalUsers.toString()}
                change=""
                icon={Users}
                color="purple"
              />
              <StatsCard 
                title="Total Events"
                value={stats.totalEvents.toString()}
                change=""
                icon={Calendar}
                color="teal"
              />
              <StatsCard 
                title="Total Studios"
                value={stats.totalStudios.toString()}
                change=""
                icon={Building}
                color="orange"
              />
            </div>
          </div>
        </div>

        {/* System Status Section */}
        <div className={activeSection !== 'system-status' ? 'hidden' : ''}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Database</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Storage</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Email Service</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Version</span>
                <span className="text-gray-300">1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Deals Section */}
        <div className={activeSection !== 'global-deals' ? 'hidden' : ''}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Global Deals Management</h2>
              <button
                onClick={() => navigate('/event-settings')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Manage Global Deals
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              Create and manage deals that can be applied across all events in the system.
            </p>
          </div>
        </div>

        {/* Sidebar - Admin Actions */}
        <div className="fixed right-8 top-32 w-64 space-y-8 hidden lg:block">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Admin Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-colors flex items-start space-x-3"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">User Management</h3>
                  <p className="text-gray-400 text-sm">Manage user accounts and permissions</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/admin/consent-templates')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-colors flex items-start space-x-3"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Consent Templates</h3>
                  <p className="text-gray-400 text-sm">Manage consent form templates</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/admin/aftercare-templates')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-colors flex items-start space-x-3"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Aftercare Templates</h3>
                  <p className="text-gray-400 text-sm">Manage aftercare email templates</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/events')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-colors flex items-start space-x-3"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Event Management</h3>
                  <p className="text-gray-400 text-sm">Create and manage events</p>
                </div>
              </button>
            </div>
          </div>          
        </div>
      </div>
    </div>
  );
}