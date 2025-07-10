import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/api';
import { StatsCard } from '../components/dashboard/StatsCard';
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
        supabase.from('events').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
        supabase.from('users').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
        supabase.from('applications').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
        supabase.from('studios').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 }))
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Master Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage all events and system-wide settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="green"
          />
          <StatsCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={FileText}
            color="purple"
          />
          <StatsCard
            title="Total Studios"
            value={stats.totalStudios}
            icon={Building2}
            color="orange"
          />
        </div>

        {/* Event Module Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Event Module Management</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Event
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticketing
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consent Forms
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TattScore
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
            onClose={() => setShowCreateModal(false)}
            onEventCreated={fetchData}
          />
        )}
      </div>
    </div>
  );
};