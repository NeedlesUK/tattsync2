import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, MessageCircle, User, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/dashboard/StatsCard';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [activeEvents, setActiveEvents] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);

  useEffect(() => {
    // In a real implementation, fetch data from API
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      setIsLoading(true);
      
      if (supabase && user) {
        // Fetch active events count
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, name, status')
          .eq('status', 'published')
          .eq('event_manager_id', user.id);
          
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        } else {
          console.log('Active events:', eventsData?.length);
          setActiveEvents(eventsData?.length || 0);
          setUpcomingEvents(eventsData || []);
        }
        
        // Fetch applications count
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('id')
          .in('event_id', eventsData?.map(e => e.id) || []);
          
        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
        } else {
          console.log('Total applications:', applicationsData?.length);
          setTotalApplications(applicationsData?.length || 0);
        }
        
        // For now, set mock data for other stats
        setTotalRevenue(0);
        setTotalMessages(0);
      } else {
        // This would fetch real data from an API in production
        setStats([]);
        setRecentActivity([]);
        setUpcomingEvents([]);
        console.log('Dashboard data initialized with empty arrays');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show different dashboard based on user role
  const isClient = user?.role === 'client';
  const isRegularUser = ['artist', 'piercer', 'performer', 'trader', 'volunteer'].includes(user?.role || '');
  const isEventManager = user?.role === 'event_manager' || user?.role === 'event_admin';

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
        {isEventManager && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Active Events"
              value={activeEvents.toString()}
              change=""
              icon={Calendar}
              color="purple"
            />
            <StatsCard 
              title="Total Applications"
              value={totalApplications.toString()}
              change=""
              icon={Users}
              color="teal"
            />
            <StatsCard 
              title="Revenue"
              value={`£${totalRevenue}`}
              change=""
              icon={CreditCard}
              color="orange"
            />
            <StatsCard 
              title="Messages"
              value={totalMessages.toString()}
              change=""
              icon={MessageCircle}
              color="blue"
            />
          </div>
        )}

        {/* Main Content */}
        {isClient || isRegularUser ? (
          // Calendar view for clients and regular users
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
              <div className="text-center py-8">
                <p className="text-gray-400">No upcoming events found</p>
                <button
                  onClick={() => navigate('/events')}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Browse Events
                </button>
              </div>
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
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-all">
                        <div className="flex justify-between items-center">
                          <h3 className="text-white font-medium">{event.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            event.status === 'published' 
                              ? 'bg-green-500/20 text-green-400' 
                              : event.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => navigate(`/event-settings?event=${event.id}`)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No upcoming events</p>
                    <button
                      onClick={() => navigate('/events')}
                      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}