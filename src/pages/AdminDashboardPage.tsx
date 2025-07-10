import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { Users, Calendar, FileText, Building2, Plus } from 'lucide-react';

interface EventModule {
  id: number;
  event_id: number;
  ticketing_enabled: boolean;
  applications_enabled: boolean;
  consent_forms_enabled: boolean;
  deals_enabled: boolean;
  messaging_enabled: boolean;
  booking_enabled: boolean;
  tattscore_enabled: boolean;
}

interface Event {
  id: number;
  name: string;
  status: string;
  event_modules?: EventModule;
}

interface Stats {
  totalEvents: number;
  totalUsers: number;
  totalApplications: number;
  totalStudios: number;
}

export const AdminDashboardPage: React.FC = () => {
  const { supabase } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalStudios: 0
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats with error handling for each table
      const [eventsResult, usersResult, applicationsResult, studiosResult] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).then(result => result).catch(() => ({ count: 0 })),
        supabase.from('users').select('*', { count: 'exact', head: true }).then(result => result).catch(() => ({ count: 0 })),
        supabase.from('applications').select('*', { count: 'exact', head: true }).then(result => result).catch(() => ({ count: 0 })),
        supabase.from('studios').select('*', { count: 'exact', head: true }).then(result => result).catch(() => ({ count: 0 }))
      ]);

      setStats({
        totalEvents: eventsResult?.count || 0,
        totalUsers: usersResult?.count || 0,
        totalApplications: applicationsResult?.count || 0,
        totalStudios: studiosResult?.count || 0
      });

      // Fetch events with modules
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_modules (
            id,
            event_id,
            ticketing_enabled,
            applications_enabled,
            consent_forms_enabled,
            deals_enabled,
            messaging_enabled,
            booking_enabled,
            tattscore_enabled
          )
        `)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set fallback stats if everything fails
      setStats({
        totalEvents: 0,
        totalUsers: 0,
        totalApplications: 0,
        totalStudios: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEventModule = async (eventId: number, moduleField: string, enabled: boolean) => {
    try {
      console.log(`Updating ${moduleField} to ${enabled} for event ${eventId}`);
      
      // Get current modules for this event
      const { data: currentModules } = await supabase
        .from('event_modules')
        .select('*')
        .eq('event_id', eventId)
        .single();

      const updateData = {
        ...currentModules,
        [moduleField]: enabled
      };

      console.log('Update data:', updateData);

      const { error } = await supabase
        .from('event_modules')
        .upsert(updateData, { onConflict: 'event_id' });

      if (error) throw error;

      // Refresh events data
      await fetchData();
    } catch (error) {
      console.error('Error updating event module:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Master Admin Dashboard</h1>
          <p className="mt-2 text-gray-300">Manage all events and system-wide settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Studios</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalStudios}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Event Module Management */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl mb-8">
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Event Module Management</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Event
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ticketing
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Consent Forms
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    TattScore
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{event.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'published' 
                          ? 'bg-green-500/20 text-green-400' 
                          : event.status === 'draft'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={event.event_modules?.ticketing_enabled || false}
                          onChange={(e) => updateEventModule(event.id, 'ticketing_enabled', e.target.checked)}
                         />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={event.event_modules?.consent_forms_enabled || false}
                          onChange={(e) => updateEventModule(event.id, 'consent_forms_enabled', e.target.checked)}
                         />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={event.event_modules?.tattscore_enabled || false}
                          onChange={(e) => updateEventModule(event.id, 'tattscore_enabled', e.target.checked)}
                         />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <CreateEventModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  );
};