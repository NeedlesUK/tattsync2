import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  MessageCircle, 
  Settings, 
  Database, 
  Server, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  Award,
  Ticket,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventModules, setEventModules] = useState<{[key: string]: boolean}>({
    ticketing_enabled: false,
    consent_forms_enabled: false,
    tattscore_enabled: false
  });
  const [isUpdating, setIsUpdating] = useState<{[key: string]: boolean}>({});
  const [systemStatus, setSystemStatus] = useState({
    database: 'unknown',
    api: 'unknown',
    storage: 'unknown'
  });
  const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    studios: 0,
    revenue: 0
  });

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@tattsync.com';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    fetchEvents();
    checkSystemStatus();
    fetchStats();
  }, [isAdmin, navigate]);

  const fetchEvents = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('events')
          .select('id, name, status, event_slug')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching events:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setEvents(data);
          setSelectedEvent(data[0]);
          fetchEventModules(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventModules = async (eventId: number) => {
    try {
      setIsLoading(true);
      if (supabase) {
        const { data, error } = await supabase
          .from('event_modules')
          .select('*')
          .eq('event_id', eventId)
          .single();
          
        if (error) {
          console.error('Error fetching event modules:', error);
          // If no modules exist yet, set defaults
          setEventModules({
            ticketing_enabled: false,
            consent_forms_enabled: false,
            tattscore_enabled: false
          });
          return;
        }
        
        if (data) {
          setEventModules({
            ticketing_enabled: data.ticketing_enabled || false,
            consent_forms_enabled: data.consent_forms_enabled || false,
            tattscore_enabled: data.tattscore_enabled || false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching event modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = async (module: string, value: boolean) => {
    if (!selectedEvent) return;
    
    try {
      setIsUpdating(prev => ({ ...prev, [module]: true }));
      
      if (supabase) {
        // Update the module setting for the specific event
        const { error } = await supabase
          .from('event_modules')
          .upsert({
            event_id: selectedEvent.id,
            [module]: value,
            updated_at: new Date().toISOString()
          }, { onConflict: 'event_id' });
          
        if (error) {
          console.error(`Error updating ${module}:`, error);
          return;
        }
        
        // Update local state
        setEventModules(prev => ({
          ...prev,
          [module]: value
        }));
      }
    } catch (error) {
      console.error(`Error toggling ${module}:`, error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [module]: false }));
    }
  };

  const checkSystemStatus = async () => {
    try {
      // Check Supabase connection
      let dbStatus = 'unknown';
      let apiStatus = 'unknown';
      let storageStatus = 'unknown';
      
      if (supabase) {
        try {
          // Test database connection
          const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
            
          dbStatus = error ? 'error' : 'connected';
          
          // Test API connection
          const { data: apiData, error: apiError } = await supabase.auth.getSession();
          apiStatus = apiError ? 'error' : 'connected';
          
          // Test storage connection
          const { data: storageData, error: storageError } = await supabase.storage.listBuckets();
          storageStatus = storageError ? 'error' : 'connected';
        } catch (error) {
          console.error('Error checking system status:', error);
        }
      } else {
        dbStatus = 'disconnected';
        apiStatus = 'disconnected';
        storageStatus = 'disconnected';
      }
      
      setSystemStatus({
        database: dbStatus,
        api: apiStatus,
        storage: storageStatus
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const fetchStats = async () => {
    try {
      if (supabase) {
        // Fetch user count
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('count');
          
        if (!userError && userData && userData.length > 0) {
          setStats(prev => ({ ...prev, users: userData[0].count }));
        }
        
        // Fetch event count
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('count');
          
        if (!eventError && eventData && eventData.length > 0) {
          setStats(prev => ({ ...prev, events: eventData[0].count }));
        }
        
        // Fetch studio count
        const { data: studioData, error: studioError } = await supabase
          .from('studios')
          .select('count');
          
        if (!studioError && studioData && studioData.length > 0) {
          setStats(prev => ({ ...prev, studios: studioData[0].count }));
        } else {
          // If there's an error (like permission denied), set to 0
          setStats(prev => ({ ...prev, studios: 0 }));
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'disconnected':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not admin, redirect to dashboard
  if (!isAdmin) {
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
          <p className="text-gray-300">System-wide settings and controls</p>
        </div>

        {/* Event Module Management */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Event Module Management</h2>
              <p className="text-gray-300">Enable or disable modules for specific events</p>
            </div>
            
            {/* Event Selector */}
            <div className="mt-4 md:mt-0">
              <select
                value={selectedEvent?.id || ''}
                onChange={(e) => {
                  const eventId = parseInt(e.target.value);
                  const event = events.find(ev => ev.id === eventId);
                  if (event) {
                    setSelectedEvent(event);
                    fetchEventModules(eventId);
                  }
                }}
                className="bg-white/5 border border-white/20 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {events.map(event => (
                  <option key={event.id} value={event.id} className="bg-gray-800">
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedEvent ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ticketing Module */}
              <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Ticket className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Ticketing</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventModules.ticketing_enabled}
                      onChange={(e) => toggleModule('ticketing_enabled', e.target.checked)}
                      disabled={isUpdating['ticketing_enabled']}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-gray-300">
                  Enable ticket sales and management for {selectedEvent.name}
                </p>
                {isUpdating['ticketing_enabled'] && (
                  <div className="mt-2 flex items-center">
                    <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-2"></div>
                    <span className="text-purple-400 text-sm">Updating...</span>
                  </div>
                )}
              </div>

              {/* Consent Forms Module */}
              <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Consent Forms</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventModules.consent_forms_enabled}
                      onChange={(e) => toggleModule('consent_forms_enabled', e.target.checked)}
                      disabled={isUpdating['consent_forms_enabled']}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-gray-300">
                  Enable consent form management for {selectedEvent.name}
                </p>
                {isUpdating['consent_forms_enabled'] && (
                  <div className="mt-2 flex items-center">
                    <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-2"></div>
                    <span className="text-purple-400 text-sm">Updating...</span>
                  </div>
                )}
              </div>

              {/* TattScore Module */}
              <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">TattScore</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventModules.tattscore_enabled}
                      onChange={(e) => toggleModule('tattscore_enabled', e.target.checked)}
                      disabled={isUpdating['tattscore_enabled']}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-gray-300">
                  Enable competition judging system for {selectedEvent.name}
                </p>
                {isUpdating['tattscore_enabled'] && (
                  <div className="mt-2 flex items-center">
                    <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-2"></div>
                    <span className="text-purple-400 text-sm">Updating...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-300">No events found. Create an event to manage modules.</p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">System Status</h2>
              <p className="text-gray-300">Connection health and system alerts</p>
            </div>
            <button 
              onClick={checkSystemStatus}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              {systemStatus.database === 'connected' && systemStatus.api === 'connected' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              )}
              <h3 className="text-xl font-bold text-white">Connection Status</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Database Connection:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.database)}
                  <span className={getStatusColor(systemStatus.database)}>
                    {systemStatus.database === 'connected' ? 'Connected' : 
                     systemStatus.database === 'error' ? 'Error' : 
                     systemStatus.database === 'disconnected' ? 'Disconnected' : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">API Services:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.api)}
                  <span className={getStatusColor(systemStatus.api)}>
                    {systemStatus.api === 'connected' ? 'Connected' : 
                     systemStatus.api === 'error' ? 'Error' : 
                     systemStatus.api === 'disconnected' ? 'Disconnected' : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Storage Services:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.storage)}
                  <span className={getStatusColor(systemStatus.storage)}>
                    {systemStatus.storage === 'connected' ? 'Connected' : 
                     systemStatus.storage === 'error' ? 'Error' : 
                     systemStatus.storage === 'disconnected' ? 'Disconnected' : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            {(systemStatus.database !== 'connected' || systemStatus.api !== 'connected' || systemStatus.storage !== 'connected') && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  Some services are not connected. Check your environment variables and network connectivity.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Status */}
            <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Database Status</h3>
                </div>
                <button 
                  onClick={() => toggleCardExpansion('database')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedCards['database'] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Connection:</span>
                  <span className={getStatusColor(systemStatus.database)}>
                    {systemStatus.database === 'connected' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {expandedCards['database'] && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Database URL:</span>
                      <span className="text-white">
                        {supabase ? 
                          `${import.meta.env.VITE_SUPABASE_URL?.substring(0, 15)}...` : 
                          'Not configured'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Users:</span>
                      <span className="text-white">{stats.users}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Events:</span>
                      <span className="text-white">{stats.events}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Studios:</span>
                      <span className="text-white">{stats.studios}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Server Status */}
            <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Server className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Server Status</h3>
                </div>
                <button 
                  onClick={() => toggleCardExpansion('server')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedCards['server'] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">API Status:</span>
                  <span className={getStatusColor(systemStatus.api)}>
                    {systemStatus.api === 'connected' ? 'Operational' : 'Unavailable'}
                  </span>
                </div>
                
                {expandedCards['server'] && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Environment:</span>
                      <span className="text-white">
                        {import.meta.env.MODE === 'production' ? 'Production' : 'Development'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Storage:</span>
                      <span className={getStatusColor(systemStatus.storage)}>
                        {systemStatus.storage === 'connected' ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Version:</span>
                      <span className="text-white">1.0.0</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer"
            onClick={() => navigate('/admin/users')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">User Management</h3>
                <p className="text-gray-300 text-sm">Manage user accounts and permissions</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{stats.users} users</span>
              <span className="text-purple-400">View →</span>
            </div>
          </div>
          
          <div 
            className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer"
            onClick={() => navigate('/events')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Event Management</h3>
                <p className="text-gray-300 text-sm">Create and manage events</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{stats.events} events</span>
              <span className="text-teal-400">View →</span>
            </div>
          </div>
          
          <div 
            className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer"
            onClick={() => navigate('/admin/consent-templates')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Consent Templates</h3>
                <p className="text-gray-300 text-sm">Manage consent form templates</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">System-wide templates</span>
              <span className="text-red-400">View →</span>
            </div>
          </div>
          
          <div 
            className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer"
            onClick={() => navigate('/admin/aftercare-templates')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Aftercare Templates</h3>
                <p className="text-gray-300 text-sm">Manage aftercare email templates</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Email templates</span>
              <span className="text-blue-400">View →</span>
            </div>
          </div>
          
          <div 
            className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer"
            onClick={() => navigate('/ticket-management')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Ticket Management</h3>
                <p className="text-gray-300 text-sm">Manage ticket sales and scanning</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Ticket operations</span>
              <span className="text-green-400">View →</span>
            </div>
          </div>
          
          <div 
            className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer"
            onClick={() => navigate('/tattscore/admin')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">TattScore Admin</h3>
                <p className="text-gray-300 text-sm">Manage competition judging system</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Competition management</span>
              <span className="text-orange-400">View →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}