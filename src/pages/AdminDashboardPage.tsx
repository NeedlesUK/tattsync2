import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Building, FileText, Settings, Gift, Shield, FileCheck, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlobalDealsModal } from '../components/settings/GlobalDealsModal';

export function AdminDashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalStudios, setTotalStudios] = useState(0);
  const [isGlobalDealsModalOpen, setIsGlobalDealsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      if (supabase) {
        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true });
          
        if (usersError) {
          console.error('Error fetching users count:', usersError);
        } else {
          setTotalUsers(usersCount || 0);
        }
        
        // Fetch events count
        const { count: eventsCount, error: eventsError } = await supabase
          .from('events')
          .select('id', { count: 'exact', head: true });
          
        if (eventsError) {
          console.error('Error fetching events count:', eventsError);
        } else {
          setTotalEvents(eventsCount || 0);
        }
        
        // Fetch studios count
        const { count: studiosCount, error: studiosError } = await supabase
          .from('studios')
          .select('id', { count: 'exact', head: true });
          
        if (studiosError) {
          console.error('Error fetching studios count:', studiosError);
        } else {
          setTotalStudios(studiosCount || 0);
        }
      } else {
        // Use mock data if Supabase is not available
        setTotalUsers(2);
        setTotalEvents(4);
        setTotalStudios(0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGlobalDeals = async (data: any) => {
    try {
      // In real implementation, save to API
      console.log('Saving global deals:', data);
    } catch (error) {
      console.error('Error saving global deals:', error);
    }
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Master Admin Dashboard</h1>
          <p className="text-gray-300">Manage all events and system-wide settings</p>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => navigate('/events')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-medium transition-colors flex flex-col items-center justify-center"
          >
            <span className="text-lg font-bold">Event Modules</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-lg font-medium transition-colors flex flex-col items-center justify-center"
          >
            <span className="text-lg font-bold">User Management</span>
          </button>
          
          <button
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-lg font-medium transition-colors flex flex-col items-center justify-center"
          >
            <span className="text-lg font-bold">Statistics</span>
          </button>
          
          <button
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-lg font-medium transition-colors flex flex-col items-center justify-center"
          >
            <span className="text-lg font-bold">System Status</span>
          </button>
          
          <button
            onClick={() => setIsGlobalDealsModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-lg font-medium transition-colors flex flex-col items-center justify-center"
          >
            <span className="text-lg font-bold">Global Deals</span>
          </button>
        </div>

        {/* Additional Admin Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <button
            onClick={() => navigate('/admin/consent-templates')}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
          >
            <Heart className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold">Consent Form Templates</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/aftercare-templates')}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
          >
            <FileCheck className="w-6 h-6 text-teal-400" />
            <span className="text-lg font-bold">Aftercare Templates</span>
          </button>
          
          <button
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
          >
            <Shield className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold">Master Admin Controls</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl text-gray-300 mb-4">Total Events</h2>
            <div className="flex items-center justify-between">
              <p className="text-5xl font-bold text-white">{totalEvents}</p>
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl text-gray-300 mb-4">Total Users</h2>
            <div className="flex items-center justify-between">
              <p className="text-5xl font-bold text-white">{totalUsers}</p>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl text-gray-300 mb-4">Total Studios</h2>
            <div className="flex items-center justify-between">
              <p className="text-5xl font-bold text-white">{totalStudios}</p>
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Deals Modal */}
        <GlobalDealsModal
          isOpen={isGlobalDealsModalOpen}
          onClose={() => setIsGlobalDealsModalOpen(false)}
          onSave={handleSaveGlobalDeals}
        />
      </div>
    </div>
  );
}