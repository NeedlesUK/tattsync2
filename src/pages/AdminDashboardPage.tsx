import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Settings, Database, Key, Server, Globe, FileText, AlertCircle, CheckCircle, User, Mail, Calendar, CreditCard, X, Shield, ToggleLeft as Toggle, Eye, EyeOff, Building, FileText2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChangeUserPassword } from '../components/admin/ChangeUserPassword';
import { useNavigate } from 'react-router-dom';

export function AdminDashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalApplications: 0,
    totalTickets: 0
  });
  const [events, setEvents] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Add state for active section
  const [activeSection, setActiveSection] = useState<'modules' | 'users' | 'system' | 'applications'>('modules');

  useEffect(() => {
    // Only allow admin access
    if (!user || (user.role !== 'admin' && user.email !== 'admin@tattsync.com')) {
      console.log('Non-admin user detected, redirecting to dashboard');
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
        const [usersResult, eventsResult, applicationsResult, ticketsResult] = await Promise.all([
          supabase.from('users').select('count'),
          supabase.from('events').select('count'),
          supabase.from('applications').select('count'),
          supabase.from('tickets').select('count')
        ]);
        
        console.log('Stats results:', { 
          users: usersResult, 
          events: eventsResult, 
          applications: applicationsResult, 
          tickets: ticketsResult 
        });
        
        setStats({
          totalUsers: usersResult.data?.[0]?.count || 0,
          totalEvents: eventsResult.data?.[0]?.count || 0,
          totalApplications: applicationsResult.data?.[0]?.count || 0,
          totalTickets: ticketsResult.data?.[0]?.count || 0
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
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = (user: any) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChangeComplete = () => {
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const toggleEventModule = async (eventId: number, module: 'ticketing' | 'consent' | 'tattscore', currentValue: boolean) => {
    if (!supabase) return;
    
    console.log('Toggling module:', module, 'for event:', eventId, 'current value:', currentValue);
    
    try {
      // Find the event module record
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        console.error('Event modules not found for event:', eventId);
        return;
      }
      
      // Check if event_modules exists
      if (!event.event_modules || 
          (Array.isArray(event.event_modules) && event.event_modules.length === 0)) {
        console.log('No event modules found, creating new module record');
        
        // Create a new event_modules record
        const { data: newModule, error: createError } = await supabase
          .from('event_modules')
          .insert({
            event_id: eventId,
            ticketing_enabled: module === 'ticketing' ? !currentValue : false,
            consent_forms_enabled: module === 'consent' ? !currentValue : false,
            tattscore_enabled: module === 'tattscore' ? !currentValue : false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating event module:', createError);
          return;
        }
        
        // Update local state
        setEvents(events.map(e => {
          if (e.id === eventId) {
            return {
              ...e,
              event_modules: [newModule]
            };
          }
          return e;
        }));
        
        console.log(`${module} module enabled for event ${eventId}`);
        return;
      }
      
      // Normalize event_modules to always be an array
      let eventModules;
      if (Array.isArray(event.event_modules)) {
        eventModules = event.event_modules.length > 0 ? event.event_modules : null;
      } else {
        eventModules = event.event_modules ? [event.event_modules] : null;
      }
      
      if (!eventModules) {
        console.error('Event modules array is empty for event:', eventId);
        return;
      }
      
      const moduleId = eventModules[0]?.id;
      if (!moduleId) {
        console.error('No module ID found for event:', eventId);
        return;
      }
      
      // Prepare the update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (module === 'ticketing') {
        updateData.ticketing_enabled = !currentValue;
      } else if (module === 'consent') {
        updateData.consent_forms_enabled = !currentValue;
      } else if (module === 'tattscore') {
        updateData.tattscore_enabled = !currentValue;
      }
      
      // Update the module settings
      const { error } = await supabase
        .from('event_modules')
        .update(updateData)
        .eq('id', moduleId);
        
      if (error) {
        console.error('Error updating event module:', error);
        return;
      }
      
      // Update local state
      setEvents(events.map(e => {
        if (e.id === eventId && e.event_modules) {
          let currentModules;
          if (Array.isArray(e.event_modules)) {
            currentModules = e.event_modules.length > 0 ? e.event_modules : [updateData];
          } else {
            currentModules = e.event_modules ? [e.event_modules] : [updateData];
          }
          
          return {
            ...e,
            event_modules: [{
              ...currentModules[0],
              ...updateData
            }]
          };
        }
        return e;
      }));
      
      console.log(`${module} module ${currentValue ? 'disabled' : 'enabled'} for event ${eventId}`);
    } catch (error) {
      console.error('Error toggling event module:', error);
    }
  };

  const navigateToPage = (path: string) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Double-check admin access after loading
  if (!user || (user.role !== 'admin' && user.email !== 'admin@tattsync.com')) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">System-wide management and controls</p>
          
          {/* Quick access buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => setActiveSection('modules')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'modules' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Event Modules
            </button>
            <button
              onClick={() => setActiveSection('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'users' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveSection('applications')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'applications' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => setActiveSection('system')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'system' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              System Status
            </button>
            <button
              onClick={() => navigateToPage('/event-settings')}
              className="px-4 py-2 rounded-lg font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              Global Deals
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <User className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Applications</p>
                <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tickets Sold</p>
                <p className="text-2xl font-bold text-white">{stats.totalTickets}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Event Module Management Section */}
          {activeSection === 'modules' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Event Module Management</h2>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 text-sm">Master Admin Controls</span>
                </div>
              </div>
              
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
                    {events.map((event) => {
                      // Normalize event_modules to always be an array for safe access
                      const eventModules = event.event_modules 
                        ? (Array.isArray(event.event_modules) ? event.event_modules : [event.event_modules])
                        : [];
                      
                      const modules = eventModules.length > 0 
                        ? eventModules[0] 
                        : { ticketing_enabled: false, consent_forms_enabled: false, tattscore_enabled: false };
                      
                      return (
                        <tr key={event.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-white font-medium">{event.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              event.status === 'published' 
                                ? 'bg-green-500/20 text-green-400' 
                                : event.status === 'draft'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleEventModule(event.id, 'ticketing', modules.ticketing_enabled)}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                modules.ticketing_enabled
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}
                            >
                              {modules.ticketing_enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleEventModule(event.id, 'consent', modules.consent_forms_enabled)}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                modules.consent_forms_enabled
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}
                            >
                              {modules.consent_forms_enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleEventModule(event.id, 'tattscore', modules.tattscore_enabled)}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                modules.tattscore_enabled
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}
                            >
                              {modules.tattscore_enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No events found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-300 font-medium">Module Information</h3>
                </div>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• <strong>Ticketing:</strong> Enables ticket sales and management for the event</li>
                  <li>• <strong>Consent Forms:</strong> Enables medical history and consent form functionality</li>
                  <li>• <strong>TattScore:</strong> Enables the competition judging system</li>
                </ul>
              </div>
            </div>
          )}

          {/* System Status Section */}
          {activeSection === 'system' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Database</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">API Server</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Authentication</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Frontend</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>
          )}

          {/* User Management Section */}
          {activeSection === 'users' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Users</h2>
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleChangePassword(user)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {recentUsers.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No users found</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Manage All Users
                </button>
              </div>
            </div>
          )}
          
          {/* Applications Management Section */}
          {activeSection === 'applications' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText2 className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-semibold text-white">Applications Management</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Application Types</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">Configure application types and forms for events</p>
                  <button
                    onClick={() => navigateToPage('/event-settings')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Manage Types
                  </button>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Applicants</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">View and manage all applicants across events</p>
                  <button
                    onClick={() => navigateToPage('/admin/applications')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Applicants
                  </button>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Settings</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">Configure global application settings</p>
                  <button
                    onClick={() => navigateToPage('/event-settings')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Application Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Change Password</h2>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <ChangeUserPassword 
                userId={selectedUser.id} 
                userName={selectedUser.name}
                onComplete={handlePasswordChangeComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import useNavigate at the top
// import { useNavigate } from 'react-router-dom'; - already imported above