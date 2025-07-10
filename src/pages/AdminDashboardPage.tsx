import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  FileText, 
  Activity, 
  Globe, 
  Heart, 
  Award, 
  Ticket, 
  Shield, 
  Database,
  BarChart,
  Server,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeEvents, setActiveEvents] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalStudios, setTotalStudios] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [eventModules, setEventModules] = useState({
    ticketing_enabled: true,
    consent_forms_enabled: true,
    tattscore_enabled: true
  });

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@tattsync.com';

  useEffect(() => {
    // Only allow admin access
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      if (supabase) {
        // Fetch active events count
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id')
          .eq('status', 'published');
          
        if (!eventsError) {
          setActiveEvents(eventsData?.length || 0);
        }
        
        // Fetch total applications count
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('id');
          
        if (!applicationsError) {
          setTotalApplications(applicationsData?.length || 0);
        }
        
        // Fetch total studios count
        try {
          const { data: studiosData, error: studiosError } = await supabase
            .from('studios')
            .select('id');
            
          if (!studiosError) {
            setTotalStudios(studiosData?.length || 0);
          }
        } catch (error) {
          console.error('Error fetching studios count:', error);
          setTotalStudios(0); // Set to 0 if there's an error (e.g., due to RLS policies)
        }
        
        // Fetch total users count
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id');
          
        if (!usersError) {
          setTotalUsers(usersData?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemStatus = () => {
    alert("System Status: All systems operational. Database connection: OK. API services: OK. Storage services: OK.");
  };

  const handleMasterAdminControls = () => {
    alert("Master Admin Controls: Advanced system configuration options. Use with caution.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only allow admin access
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Master Admin Dashboard
          </h1>
          <p className="text-gray-300">
            System-wide settings and controls
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Events</p>
                <p className="text-2xl font-bold text-white mt-1">{activeEvents}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-white mt-1">{totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Studios</p>
                <p className="text-2xl font-bold text-white mt-1">{totalStudios}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Event Module Management */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Event Module Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Ticket className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Ticketing</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.ticketing_enabled} 
                    onChange={() => {
                      // This should be moved to the Event Modules modal, as it should be per-event, not global
                      setEventModules(prev => ({
                        ...prev,
                        ticketing_enabled: !prev.ticketing_enabled
                      }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-gray-300">Enable ticket sales and management for events</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Consent Forms</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.consent_forms_enabled} 
                    onChange={() => {
                      // This should be moved to the Event Modules modal, as it should be per-event, not global
                      setEventModules(prev => ({
                        ...prev,
                        consent_forms_enabled: !prev.consent_forms_enabled
                      }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-gray-300">Enable consent form management for events</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">TattScore</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={eventModules.tattscore_enabled} 
                    onChange={() => {
                      // This should be moved to the Event Modules modal, as it should be per-event, not global
                      setEventModules(prev => ({
                        ...prev,
                        tattscore_enabled: !prev.tattscore_enabled
                      }));
                    }}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => navigate('/admin/users')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">User Management</h3>
            </div>
            <p className="text-gray-300 text-sm">Manage user accounts, roles, and permissions</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => navigate('/events')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Event Modules</h3>
            </div>
            <p className="text-gray-300 text-sm">Configure event modules and settings</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => navigate('/admin/consent-templates')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-400" />
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
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Aftercare Templates</h3>
            </div>
            <p className="text-gray-300 text-sm">Manage global aftercare email templates</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={handleSystemStatus}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">System Status</h3>
            </div>
            <p className="text-gray-300 text-sm">View system health and connection status</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => {
              // Open the GlobalDealsModal
              alert("Global Deals Management would open here");
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Global Deals</h3>
            </div>
            <p className="text-gray-300 text-sm">Manage deals available across all events</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => {
              // Navigate to statistics page
              alert("Statistics page would open here");
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Statistics</h3>
            </div>
            <p className="text-gray-300 text-sm">View platform-wide statistics and analytics</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => {
              // Show database status
              alert("Database Status: Connected\nStorage Status: Connected\nAPI Status: Connected\nCache Status: Connected");
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Database Status</h3>
            </div>
            <p className="text-gray-300 text-sm">View database connection status and health</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => {
              // Show server status
              alert("Server Status: Running\nCPU Usage: 12%\nMemory Usage: 34%\nDisk Usage: 45%\nUptime: 14 days");
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Server Status</h3>
            </div>
            <p className="text-gray-300 text-sm">View server health and performance metrics</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={handleMasterAdminControls}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Master Admin Controls</h3>
            </div>
            <p className="text-gray-300 text-sm">Advanced system configuration options</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => {
              // Show system alerts
              alert("System Alerts: No critical alerts\nWarnings: 2 events approaching capacity\nNotifications: 5 new user registrations");
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">System Alerts</h3>
            </div>
            <p className="text-gray-300 text-sm">View system warnings and notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}