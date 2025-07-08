import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, MessageCircle, User, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/dashboard/StatsCard';
import { EventCalendar } from '../components/calendar/EventCalendar';

export function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Remove all dummy data to avoid reference errors
  const stats = [];
  const recentEvents = [];

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
              ? "Here are your upcoming events and available opportunities."
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
              value="12" 
              change="+3 from last month" 
              icon={Calendar} 
              color="purple" 
            />
            <StatsCard 
              title="Total Applications" 
              value="247" 
              change="+18% from last week" 
              icon={Users} 
              color="teal" 
            />
            <StatsCard 
              title="Revenue" 
              value="£24,580" 
              change="+12% from last month" 
              icon={CreditCard} 
              color="orange" 
            />
            <StatsCard 
              title="Messages" 
              value="86" 
              change="12 unread" 
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
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">New artist application received</p>
                      <p className="text-gray-300 text-sm">Sarah Johnson applied for Ink Fest 2024</p>
                      <p className="text-gray-400 text-xs mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">Event published</p>
                      <p className="text-gray-300 text-sm">Body Art Expo 2024 is now live</p>
                      <p className="text-gray-400 text-xs mt-1">4 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                  <div className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
                    <h3 className="text-white font-medium mb-2">Ink Fest 2024</h3>
                    <div className="space-y-1">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Mar 15, 2024
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        Los Angeles, CA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}