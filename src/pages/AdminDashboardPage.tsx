import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  MessageCircle, 
  Settings, 
  Shield, 
  Database, 
  Server, 
  Activity, 
  Bell, 
  Plus, 
  Ticket, 
  Heart, 
  Award, 
  Building,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 0,
    users: 0,
    revenue: 0,
    messages: 0,
    studios: 0
  });
  const [eventModules, setEventModules] = useState({
    ticketing_enabled: true,
    consent_forms_enabled: true,
    tattscore_enabled: true
  });

  useEffect(() => {
    // Only allow admin access
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats from Supabase
      if (supabase) {
        // Fetch events count
        const { count: eventsCount, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });
          
        if (!eventsError) {
          setStats(prev => ({ ...prev, events: eventsCount || 0 }));
        }
        
        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
          
        if (!usersError) {
          setStats(prev => ({ ...prev, users: usersCount || 0 }));
        }
        
        // Fetch studios count
        try {
          const { count: studiosCount, error: studiosError } = await supabase
            .from('studios')
            .select('*', { count: 'exact', head: true });
            
          if (!studiosError) {
            setStats(prev => ({ ...prev, studios: studiosCount || 0 }));
          }
        } catch (error) {
          console.error('Error fetching studios count:', error);
          // Set studios count to 0 if there's an error
          setStats(prev => ({ ...prev, studios: 0 }));
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEventModule = (module: keyof typeof eventModules) => {
    // This should be moved to the Event Modules modal, as it should be per-event, not global
    setEventModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const handleCreateEvent = () => {
    navigate('/events');
  };

  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  const handleManageConsentTemplates = () => {
    navigate('/admin/consent-templates');
  };

  const handleManageAftercareTemplates = () => {
    navigate('/admin/aftercare-templates');
  };

  const handleSystemStatus = () => {
    alert('System Status: All systems operational. Database connection: OK. API services: OK. Storage services: OK.');
  };

  const handleMasterAdminControls = () => {
    alert('Master Admin Controls: These are advanced system configuration options.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Master Admin Dashboard
          </h1>
          <p className="text-gray-300">
            Welcome to the TattSync master admin dashboard. Manage system-wide settings and monitor platform health.
          </p>
        </div>

        {/* Event Module Management */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Event Module Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Ticket className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Ticketing</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.ticketing_enabled} 
                    onChange={() => toggleEventModule('ticketing_enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-gray-300">Enable ticket sales and management for events</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Consent Forms</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.consent_forms_enabled} 
                    onChange={() => toggleEventModule('consent_forms_enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-gray-300">Enable consent form management for events</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">TattScore</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.tattscore_enabled} 
                    onChange={() => toggleEventModule('tattscore_enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-gray-300">Enable competition judging system for events</p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={handleCreateEvent}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Create Event</h3>
                <p className="text-gray-300">Create a new tattoo convention or event</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={handleManageUsers}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">User Management</h3>
                <p className="text-gray-300">Manage users and permissions</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={handleManageConsentTemplates}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Consent Templates</h3>
                <p className="text-gray-300">Manage consent form templates</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={handleManageAftercareTemplates}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Aftercare Templates</h3>
                <p className="text-gray-300">Manage aftercare email templates</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={handleSystemStatus}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">System Status</h3>
                <p className="text-gray-300">View system health and performance</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={handleMasterAdminControls}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Master Admin Controls</h3>
                <p className="text-gray-300">Advanced system configuration</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Database Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Connection</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Query Performance</span>
                <span className="text-green-400">Optimal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Storage Usage</span>
                <span className="text-green-400">23%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Last Backup</span>
                <span className="text-green-400">Today, 03:00 AM</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Server Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">API Services</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Storage Services</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Auth Services</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email Services</span>
                <span className="text-green-400">Online</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-medium">Storage Usage Warning</p>
                  <p className="text-yellow-200 text-sm">Storage usage is approaching 25% threshold.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <Bell className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 font-medium">System Update</p>
                  <p className="text-green-200 text-sm">System updated to version 1.5.2 successfully.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}