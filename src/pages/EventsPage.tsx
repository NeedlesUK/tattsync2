import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, MapPin, Users } from 'lucide-react';
import { EventCard } from '../components/events/EventCard';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { useAuth } from '../contexts/AuthContext';

export function EventsPage() {
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [events, setEvents] = useState<any[]>([]);
  const [userEvents, setUserEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to fetch events
      setEvents([]);
      setUserEvents([]);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events based on search and status
  const getFilteredEvents = (eventList: any[]) => eventList.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  // Get filtered events
  const filteredUserEvents = getFilteredEvents(userEvents);
  const filteredAllEvents = getFilteredEvents(events).filter(
    event => !userEvents.some(userEvent => userEvent.id === event.id)
  );

  const isAdmin = user?.role === 'admin';

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
            <p className="text-gray-300">Manage your tattoo conventions and events</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* User's Events Section (if they have any) */}
        {filteredUserEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Your Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUserEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onView={(id) => console.log('View event', id)}
                  onEdit={(id) => console.log('Edit event', id)}
                  onDelete={(id) => console.log('Delete event', id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Events Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            {filteredUserEvents.length > 0 ? 'All Events' : 'Events'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onView={(id) => console.log('View event', id)}
                onEdit={isAdmin ? (id) => console.log('Edit event', id) : undefined}
                onDelete={isAdmin ? (id) => console.log('Delete event', id) : undefined}
              />
          ))}
        </div>

        {filteredUserEvents.length === 0 && filteredAllEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No events found</h3>
            <p className="text-gray-400">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No events have been created yet'
              }
            </p>
          </div>
        )}
        </div>

        {isAdmin && (
          <CreateEventModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              fetchEvents(); // Refresh events after creating a new one
            }}
          />
        )}
      </div>
    </div>
  );
}