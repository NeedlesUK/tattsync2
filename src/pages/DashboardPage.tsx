import React from 'react';
import { Calendar, Users, CreditCard, MessageCircle, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { UpcomingEvents } from '../components/dashboard/UpcomingEvents';
import { EventCalendar } from '../components/calendar/EventCalendar';

export function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Events',
      value: '12',
      change: '+3 from last month',
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'Total Applications',
      value: '247',
      change: '+18% from last week',
      icon: Users,
      color: 'teal'
    },
    {
      title: 'Revenue',
      value: '£24,580',
      change: '+12% from last month',
      icon: CreditCard,
      color: 'orange'
    },
    {
      title: 'Messages',
      value: '86',
      change: '12 unread',
      icon: MessageCircle,
      color: 'blue'
    }
  ];

  // Show different dashboard based on user role
  const isClient = user?.role === 'client';
  const isRegularUser = ['artist', 'piercer', 'performer', 'trader', 'volunteer'].includes(user?.role || '');

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
        {!isClient && !isRegularUser && (
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
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
            <div>
              <UpcomingEvents />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}