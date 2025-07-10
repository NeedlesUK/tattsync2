import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CreditCard, MessageCircle, User, Settings, FileText, Shield, Gift, Heart, Award, Building, Ticket, FileCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlobalDealsModal } from '../components/settings/GlobalDealsModal';

export function AdminDashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 0,
    users: 0,
    applications: 0,
    studios: 0
  });
  const [isGlobalDealsModalOpen, setIsGlobalDealsModalOpen] = useState(false);
  const [eventModules, setEventModules] = useState({
    ticketing_enabled: false,
    consent_forms_enabled: false,
    tattscore_enabled: false
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      setIsLoading(true);
      
      // Check if Supabase is properly configured before attempting to fetch data
      if (!supabase) {
        console.warn('⚠️ Supabase not configured. Using fallback data.');
        setStats({
          events: 0,
          users: 0,
          applications: 0,
          studios: 0
        });
        setIsLoading(false);
        return;
      }
      
      if (supabase && user) {
        // Fetch events count
        try {
          const { count: eventsCount, error: eventsError } = await supabase
            .from('events')
            .select('id', { count: 'exact', head: true });
            
          if (eventsError) {
            console.error('Error fetching events count:', eventsError);
          } else {
            console.log('Events count:', eventsCount);
            setStats(prev => ({ ...prev, events: eventsCount || 0 }));
          }
        } catch (error) {
          console.error('Error fetching events count:', error);
        }
        
        // Fetch users count
        try {
          const { count: usersCount, error: usersError } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true });
            
          if (usersError) {
            console.error('Error fetching users count:', usersError);
          } else {
            console.log('Users count:', usersCount);
            setStats(prev => ({ ...prev, users: usersCount || 0 }));
          }
        } catch (error) {
          console.error('Error fetching users count:', error);
        }
        
        // Fetch applications count
        try {
          const { count: applicationsCount, error: applicationsError } = await supabase
            .from('applications')
            .select('id', { count: 'exact', head: true });
            
          if (applicationsError) {
            console.error('Error fetching applications count:', applicationsError);
          } else {
            console.log('Applications count:', applicationsCount);
            setStats(prev => ({ ...prev, applications: applicationsCount || 0 }));
          }
        } catch (error) {
          console.error('Error fetching applications count:', error);
        }
        
        // Fetch studios count
        try {
          const { count: studiosCount, error: studiosError } = await supabase
            .from('studios')
            .select('id', { count: 'exact', head: true });
            
          if (studiosError) {
            console.error('Error fetching studios count:', studiosError);
            // If we get a 403 error (permission denied), just set count to 0
            if (studiosError.code === '403') {
              setStats(prev => ({ ...prev, studios: 0 }));
            }
          } else {
            console.log('Studios count:', studiosCount);
            setStats(prev => ({ ...prev, studios: studiosCount || 0 }));
          }
        } catch (error) {
          console.error('Error fetching studios count:', error);
          setStats(prev => ({ ...prev, studios: 0 }));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEventModule = async (module: string, enabled: boolean) => {
    try {
      console.log(`Toggling ${module} to ${enabled}`);
      setEventModules(prev => ({ ...prev, [module]: enabled }));
      
      // In a real implementation, this would update the database
      if (supabase) {
        // Update all events to have this module enabled/disabled
        // This is a simplification - in a real app, you'd likely have a more targeted approach
        const { error } = await supabase
          .from('event_modules')
          .update({ [module]: enabled })
          .eq('id', 'global_settings');
          
        if (error) {
          console.error(`Error updating ${module}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error toggling ${module}:`, error);
    }
  };

  const handleSaveGlobalDeals = async (data: any) => {
    try {
      // In a real implementation, save to API
      console.log('Saving global deals:', data);
    } catch (error) {
      console.error('Error saving global deals:', error);
    }
  };

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
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-white">Master Admin Dashboard</h1>
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Master Admin</span>
            </span>
          </div>
          <p className="text-gray-300">
            System-wide settings and controls for the TattSync platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.events}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.users}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.applications}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Studios</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.studios}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Event Module Management */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Event Module Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-medium">Ticketing</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.ticketing_enabled} 
                    onChange={(e) => toggleEventModule('ticketing_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-gray-400 text-sm">
                Enable ticket sales and management for events
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-medium">Consent Forms</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.consent_forms_enabled} 
                    onChange={(e) => toggleEventModule('consent_forms_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-gray-400 text-sm">
                Enable consent form management for events
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-medium">TattScore</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.tattscore_enabled} 
                    onChange={(e) => toggleEventModule('tattscore_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-gray-400 text-sm">
                Enable competition judging system for events
              </p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => navigate('/events')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Event Modules</h3>
            </div>
            <p className="text-gray-300 text-sm">Manage event modules and settings</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => navigate('/admin/users')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">User Management</h3>
            </div>
            <p className="text-gray-300 text-sm">Manage users and permissions</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => console.log('Navigate to statistics')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Statistics</h3>
            </div>
            <p className="text-gray-300 text-sm">View platform statistics and analytics</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => console.log('Navigate to system status')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">System Status</h3>
            </div>
            <p className="text-gray-300 text-sm">Monitor system health and performance</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsGlobalDealsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Global Deals</h3>
            </div>
            <p className="text-gray-300 text-sm">Manage platform-wide deals and offers</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => navigate('/admin/consent-templates')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Consent Form Templates</h3>
            </div>
            <p className="text-gray-300 text-sm">Manage global consent form templates</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => navigate('/admin/aftercare-templates')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Aftercare Templates</h3>
            </div>
            <p className="text-gray-300 text-sm">Manage aftercare email templates</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => console.log('Master Admin Controls')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Master Admin Controls</h3>
            </div>
            <p className="text-gray-300 text-sm">Advanced system configuration</p>
          </div>
        </div>

        {/* Modals */}
        <GlobalDealsModal
          isOpen={isGlobalDealsModalOpen}
          onClose={() => setIsGlobalDealsModalOpen(false)}
          onSave={handleSaveGlobalDeals}
        />
      </div>
    </div>
  );
}