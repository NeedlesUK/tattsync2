import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, CreditCard, MessageCircle, Gift, Heart, Award, Building, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/dashboard/StatsCard';

export function DashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const [stats, setStats] = useState({
    upcomingEvents: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalRevenue: 0
  });

  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Starting to fetch dashboard data...');
      
      if (supabase) {
        console.log('🔍 Supabase client available, fetching events...');
        // Fetch events managed by the user
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('event_manager_id', user?.id)
          .order('start_date', { ascending: true });
          
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          console.log('⚠️ Error fetching events, continuing with other data...');
        } else if (eventsData) {
          console.log(`✅ Successfully fetched ${eventsData.length} events`);
          setEvents(eventsData);
          setStats(prev => ({ ...prev, upcomingEvents: eventsData.length }));
        }
        
        // Fetch applications for the user
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
          
        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
          console.log('⚠️ Error fetching applications, continuing...');
        } else if (applicationsData) {
          console.log(`✅ Successfully fetched ${applicationsData.length} applications`);
          setApplications(applicationsData);
          
          // Count pending and approved applications
          const pendingCount = applicationsData.filter(app => app.status === 'pending').length;
          const approvedCount = applicationsData.filter(app => app.status === 'approved').length;
          
          setStats(prev => ({
            ...prev,
            pendingApplications: pendingCount,
            approvedApplications: approvedCount
          }));
        }
      } else {
        // Mock data for when Supabase is not available
        setEvents([
          {
            id: 1,
            name: 'Ink Fest 2024',
            description: 'The premier tattoo convention on the West Coast',
            event_slug: 'ink-fest-2024',
            start_date: '2024-03-15',
            end_date: '2024-03-17',
            location: 'Los Angeles, CA',
            venue: 'LA Convention Center',
            status: 'published',
            event_manager_id: user?.id
          }
        ]);
        
        setApplications([
          {
            id: 1,
            event_id: 1,
            event_name: 'Ink Fest 2024',
            application_type: 'artist',
            status: 'approved',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            event_id: 2,
            event_name: 'Body Art Expo',
            application_type: 'artist',
            status: 'pending',
            created_at: '2024-01-20T14:15:00Z'
          }
        ]);
        
        setStats({
          upcomingEvents: 1,
          pendingApplications: 1,
          approvedApplications: 1,
          totalRevenue: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.log('❌ Error in fetchDashboardData, setting empty data');
    } finally {
      console.log('✅ Dashboard data fetch complete, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleManageEvent = (eventId: number) => {
    navigate(`/event-settings?event=${eventId}`);
  };

  const handlePreviewEvent = (eventSlug: string) => {
    // Open in new tab
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/events/${eventSlug}`;
    window.open(url, '_blank')?.focus();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user is event manager
  const isEventManager = user?.role === 'event_manager' || user?.role === 'event_admin';

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Upcoming Events"
            value={stats.upcomingEvents.toString()}
            icon={Calendar}
            color="purple"
          />
          <StatsCard
            title="Pending Applications"
            value={stats.pendingApplications.toString()}
            icon={Users}
            color="teal"
          />
          <StatsCard
            title="Approved Applications"
            value={stats.approvedApplications.toString()}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Total Revenue"
            value={`£${stats.totalRevenue.toFixed(2)}`}
            icon={CreditCard}
            color="blue"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Events</h2>
              
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-3 md:mb-0">
                          <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {formatDate(event.start_date)} - {formatDate(event.end_date)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {event.venue}, {event.location}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            event.status === 'published' 
                              ? 'bg-green-500/20 text-green-400' 
                              : event.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                          <button
                            onClick={() => handlePreviewEvent(event.event_slug)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => handleManageEvent(event.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Manage</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">You don't have any events yet</p>
                  <Link
                    to="/events"
                    className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all inline-block"
                  >
                    Browse Events
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Applications</h2>
              
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 3).map((application) => (
                    <div key={application.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{application.event_name || 'Event'}</h3>
                          <p className="text-gray-400 text-sm capitalize">
                            {application.application_type} Application
                          </p>
                          <p className="text-gray-400 text-sm">
                            Submitted: {formatDate(application.created_at)}
                          </p>
                        </div>
                        <div className="mt-3 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            application.status === 'approved' 
                              ? 'bg-green-500/20 text-green-400' 
                              : application.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : application.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {applications.length > 3 && (
                    <div className="text-center mt-4">
                      <Link
                        to="/applications"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View all applications
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">You haven't applied to any events yet</p>
                  <Link
                    to="/events"
                    className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all inline-block"
                  >
                    Browse Events
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Links */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
              
              <div className="space-y-3">
                <Link
                  to="/events"
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Events</h3>
                    <p className="text-gray-400 text-sm">Browse upcoming events</p>
                  </div>
                </Link>
                
                <Link
                  to="/messages"
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Messages</h3>
                    <p className="text-gray-400 text-sm">View your conversations</p>
                  </div>
                </Link>
                
                <Link
                  to="/deals"
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Deals & Offers</h3>
                    <p className="text-gray-400 text-sm">Exclusive discounts</p>
                  </div>
                </Link>
                
                {isEventManager && (
                  <Link
                    to="/ticket-management"
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Ticket Management</h3>
                      <p className="text-gray-400 text-sm">Manage event tickets</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Additional Modules */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Additional Modules</h2>
              
              <div className="space-y-3">
                <Link
                  to="/tattscore/admin"
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">TattScore</h3>
                    <p className="text-gray-400 text-sm">Competition judging system</p>
                  </div>
                </Link>
                
                <Link
                  to="/studio/dashboard"
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Studio Management</h3>
                    <p className="text-gray-400 text-sm">Manage your tattoo studio</p>
                  </div>
                </Link>
                
                <Link
                  to="/consent-forms"
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Consent Forms</h3>
                    <p className="text-gray-400 text-sm">Manage client consent forms</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing CheckCircle component
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// Add missing Settings component
function Settings({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Add missing Ticket component
function Ticket({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

// Add missing FileText component
function FileText({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}