import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, MessageCircle, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { EventCalendar } from '../components/calendar/EventCalendar';

export function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  // Show different dashboard based on user role
  const isClient = user?.role === 'client';
  const isRegularUser = ['artist', 'piercer', 'performer', 'trader', 'volunteer'].includes(user?.role || '');

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, fetch from API
        // For now, we'll just simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set loading to false without setting mock data
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-300">
            {isClient 
              ? "Here are your upcoming events and available opportunities."
              : isRegularUser
              ? "Discover new events and manage your applications."
              : "Here's what's happening with your events today."
            }
          </p>
        </div>

        {/* Show stats only for admins and event managers */}
        {!isClient && !isRegularUser && stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
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
            <div className="lg:col-span-3 text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No data available</h3>
              <p className="text-gray-400">
                Connect to the backend to see your dashboard data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}