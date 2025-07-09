import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Shield, Settings, Database, Key, Server, Globe, FileText, AlertTriangle, CheckCircle, User, Mail, Calendar, CreditCard, ToggleLeft, ToggleRight, Trophy, Tag, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChangeUserPassword } from '../components/admin/ChangeUserPassword';

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
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Event module management state
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [eventModules, setEventModules] = useState<any>({
    ticketing_enabled: false,
    applications_enabled: true,
    consent_forms_enabled: false,
    deals_enabled: false,
    messaging_enabled: true,
    booking_enabled: false,
    tattscore_enabled: false
  });
  const [isUpdatingModule, setIsUpdatingModule] = useState(false);

  useEffect(() => {
    // Only allow admin access
    if (!user || (user.role !== 'admin' && user.email !== 'admin@tattsync.com')) {
      console.log('Non-admin user detected, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
    
    fetchDashboardData();
    fetchEvents();
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
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      if (supabase) {
        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            name,
            status,
            event_slug,
            start_date,
            end_date,
            location,
            venue,
            event_manager_id,
            event_manager_email: users!events_event_manager_id_fkey(email)
          `)
          .order('created_at', { ascending: false });
          
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          return;
        }
        
        if (eventsData && eventsData.length > 0) {
          console.log('Fetched events:', eventsData);
          setEvents(eventsData);
          
          // Select the first event by default
          if (!selectedEvent) {
            setSelectedEvent(eventsData[0]);
            fetchEventModules(eventsData[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  const fetchEventModules = async (eventId: number) => {
    try {
      if (supabase) {
        // Fetch event modules
        const { data, error } = await supabase
          .from('event_modules')
          .select('*')
          .eq('event_id', eventId)
          .single();
          
        if (error) {
          console.error('Error fetching event modules:', error);
          return;
        }
        
        if (data) {
          console.log('Fetched event modules:', data);
          setEventModules({
            ...data,
            tattscore_enabled: data.tattscore_enabled || false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching event modules:', error);
    }
  };
  
  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
    fetchEventModules(event.id);
  };
  
  const handleToggleModule = async (module: string, enabled: boolean) => {
    if (!selectedEvent || !supabase) return;
    
    try {
      setIsUpdatingModule(true);
      
      // Update local state first for responsive UI
      setEventModules(prev => ({
        ...prev,
        [module]: enabled
      }));
      
      // Update in database
      const { error } = await supabase
        .from('event_modules')
        .update({
          [module]: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('event_id', selectedEvent.id);
        
      if (error) {
        console.error('Error updating event module:', error);
        // Revert local state on error
        setEventModules(prev => ({
          ...prev,
          [module]: !enabled
        }));
        throw error;
      }
      
      console.log(`Module ${module} ${enabled ? 'enabled' : 'disabled'} for event ${selectedEvent.id}`);
    } catch (error) {
      console.error('Error toggling module:', error);
    } finally {
      setIsUpdatingModule(false);
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
          <div className="mt-2 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1 inline-flex items-center">
            <Shield className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-purple-400 text-sm">Master Admin Access</span>
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
              <Users className="w-8 h-8 text-purple-400" />
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Admin Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">Admin Tools</h2>
              <nav className="space-y-2">
                <Link 
                  to="/admin/users"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-white">User Management</span>
                </Link>
                
                <Link 
                  to="/events"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-teal-400" />
                  <span className="text-white">Events</span>
                </Link>
                
                <div className="border-t border-white/10 my-4"></div>
                
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <h3 className="text-purple-400 font-medium mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Module Management
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Enable or disable modules for each event
                  </p>
                </div>
              </nav>
            </div>
            
            {/* System Status */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">System Status</h2>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-green-400 text-sm">Operational</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">Database</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">API Server</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">Authentication</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Module Management */}
          <div className="lg:col-span-9">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">Event Module Management</h2>
              
              {/* Event Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Event
                </label>
                <select
                  value={selectedEvent?.id || ''}
                  onChange={(e) => {
                    const eventId = parseInt(e.target.value);
                    const event = events.find(ev => ev.id === eventId);
                    if (event) {
                      handleEventSelect(event);
                    }
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" disabled>Select an event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id} className="bg-gray-800">
                      {event.name} ({event.status})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedEvent ? (
                <div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <h3 className="text-blue-300 font-medium mb-2">Module Configuration</h3>
                    <p className="text-blue-200 text-sm">
                      Enable or disable modules for <strong>{selectedEvent.name}</strong>. The Applications module is always enabled as the core functionality.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Applications (always enabled) */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-400" />
                          </div>
                          <h3 className="text-white font-medium">Applications</h3>
                        </div>
                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                          Core Module
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Application system for artists, traders, and other participants
                      </p>
                    </div>
                    
                    {/* Ticketing */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                          </div>
                          <h3 className="text-white font-medium">Ticketing</h3>
                        </div>
                        <button
                          onClick={() => handleToggleModule('ticketing_enabled', !eventModules.ticketing_enabled)}
                          disabled={isUpdatingModule}
                          className="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <span className={`${eventModules.ticketing_enabled ? 'bg-purple-600' : 'bg-gray-700'} inline-block h-6 w-11 rounded-full transition-colors`}></span>
                          <span
                            className={`${eventModules.ticketing_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          ></span>
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Ticket sales and management for attendees
                      </p>
                    </div>
                    
                    {/* Consent Forms */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                          <h3 className="text-white font-medium">Consent Forms</h3>
                        </div>
                        <button
                          onClick={() => handleToggleModule('consent_forms_enabled', !eventModules.consent_forms_enabled)}
                          disabled={isUpdatingModule}
                          className="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <span className={`${eventModules.consent_forms_enabled ? 'bg-purple-600' : 'bg-gray-700'} inline-block h-6 w-11 rounded-full transition-colors`}></span>
                          <span
                            className={`${eventModules.consent_forms_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          ></span>
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Medical history and consent form management
                      </p>
                    </div>
                    
                    {/* Deals */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <Tag className="w-5 h-5 text-yellow-400" />
                          </div>
                          <h3 className="text-white font-medium">Deals & Offers</h3>
                        </div>
                        <button
                          onClick={() => handleToggleModule('deals_enabled', !eventModules.deals_enabled)}
                          disabled={isUpdatingModule}
                          className="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <span className={`${eventModules.deals_enabled ? 'bg-purple-600' : 'bg-gray-700'} inline-block h-6 w-11 rounded-full transition-colors`}></span>
                          <span
                            className={`${eventModules.deals_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          ></span>
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Special deals and promotional offers
                      </p>
                    </div>
                    
                    {/* Messaging */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-purple-400" />
                          </div>
                          <h3 className="text-white font-medium">Messaging</h3>
                        </div>
                        <button
                          onClick={() => handleToggleModule('messaging_enabled', !eventModules.messaging_enabled)}
                          disabled={isUpdatingModule}
                          className="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <span className={`${eventModules.messaging_enabled ? 'bg-purple-600' : 'bg-gray-700'} inline-block h-6 w-11 rounded-full transition-colors`}></span>
                          <span
                            className={`${eventModules.messaging_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          ></span>
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm">
                        In-app messaging between participants
                      </p>
                    </div>
                    
                    {/* Booking */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-teal-400" />
                          </div>
                          <h3 className="text-white font-medium">Booking</h3>
                        </div>
                        <button
                          onClick={() => handleToggleModule('booking_enabled', !eventModules.booking_enabled)}
                          disabled={isUpdatingModule}
                          className="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <span className={`${eventModules.booking_enabled ? 'bg-purple-600' : 'bg-gray-700'} inline-block h-6 w-11 rounded-full transition-colors`}></span>
                          <span
                            className={`${eventModules.booking_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          ></span>
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Appointment booking system for artists
                      </p>
                    </div>
                    
                    {/* TattScore */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-orange-400" />
                          </div>
                          <h3 className="text-white font-medium">TattScore</h3>
                        </div>
                        <button
                          onClick={() => handleToggleModule('tattscore_enabled', !eventModules.tattscore_enabled)}
                          disabled={isUpdatingModule}
                          className="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <span className={`${eventModules.tattscore_enabled ? 'bg-purple-600' : 'bg-gray-700'} inline-block h-6 w-11 rounded-full transition-colors`}></span>
                          <span
                            className={`${eventModules.tattscore_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          ></span>
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Competition judging and scoring system
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-300 font-medium mb-1">Module Activation</h4>
                        <p className="text-yellow-200 text-sm">
                          Enabling or disabling modules will immediately affect the event. Make sure to communicate any changes to the event manager.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No events found</h3>
                  <p className="text-gray-400">
                    Create an event first to manage modules
                  </p>
                  <Link
                    to="/events"
                    className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Event
                  </Link>
                </div>
              )}
            </div>
            
            {/* Recent Users */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Users</h2>
                <Link 
                  to="/admin/users"
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
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
                ))}
                
                {recentUsers.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No users found</p>
                  </div>
                )}
              </div>
            </div>
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