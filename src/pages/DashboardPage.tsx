import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, MessageCircle, User, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/dashboard/StatsCard';
import { EventCalendar } from '../components/calendar/EventCalendar';

export function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    // In a real implementation, fetch data from API
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, fetch from API
      // For now, we'll just set empty arrays
      setStats([]);
      setRecentActivity([]);
      setUpcomingEvents([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show different dashboard based on user role
  const isClient = user?.role === 'client';
  const isRegularUser = ['artist', 'piercer', 'performer', 'trader', 'volunteer'].includes(user?.role || '');

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
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-300">
            {isClient 
              ? "Here's your upcoming events and available opportunities."
              : isRegularUser
              ? "Discover new events and manage your applications."
              : "Here's what's happening with your events today."
            }
          </p>
        </div>

        {/* Show stats only for admins and event managers */}
        {!isClient && !isRegularUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Active Events" 
              value="0" 
              change="No change" 
              icon={Calendar} 
              color="purple" 
            />
            <StatsCard 
              title="Total Applications" 
              value="0" 
              change="No change" 
              icon={Users} 
              color="teal" 
            />
            <StatsCard 
              title="Revenue" 
              value="£0" 
              change="No change" 
              icon={CreditCard} 
              color="orange" 
            />
            <StatsCard 
              title="Messages" 
              value="0" 
              change="No unread" 
              icon={MessageCircle} 
              color="blue" 
            />
          </div>
        )}

        {/* Main Content */}
        {isClient || isRegularUser ? (
          // Calendar view for clients and regular users
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">TattSync Events Calendar</h2>
              <EventCalendar />
            </div>
          </div>
        ) : (
          // Dashboard view for admins and event managers
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div className="text-center py-8">
                  <p className="text-gray-400">No recent activity</p>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Upcoming Events</h2>
                <div className="text-center py-8">
                  <p className="text-gray-400">No upcoming events</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}