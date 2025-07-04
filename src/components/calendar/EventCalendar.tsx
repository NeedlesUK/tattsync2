import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, ExternalLink, Heart, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CalendarEvent {
  id: number;
  name: string;
  description: string;
  event_slug: string;
  start_date: string;
  end_date: string;
  location: string;
  venue: string;
  status: string;
  relationship?: 'applied' | 'attending' | 'interested' | 'managing';
  applications_enabled?: boolean;
  ticketing_enabled?: boolean;
}

export function EventCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'my-events' | 'available'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would fetch from API
      // For now, we'll just set an empty array
      setEvents([]);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (eventId: number) => {
    // Handle application logic
    console.log('Applying to event:', eventId);
  };

  const handleBuyTickets = (eventSlug: string) => {
    // Handle ticket purchase logic
    window.open(`https://tattsync.com/${eventSlug}/tickets`, '_blank');
  };

  const handleAddToInterested = (eventId: number) => {
    // Handle adding to interested events
    console.log('Adding to interested:', eventId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRelationshipBadge = (relationship?: string) => {
    if (!relationship) return null;

    const badges = {
      applied: { label: 'Applied', color: 'bg-yellow-500/20 text-yellow-400' },
      attending: { label: 'Attending', color: 'bg-green-500/20 text-green-400' },
      interested: { label: 'Interested', color: 'bg-blue-500/20 text-blue-400' },
      managing: { label: 'Managing', color: 'bg-purple-500/20 text-purple-400' }
    };

    const badge = badges[relationship as keyof typeof badges];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'my-events') {
      return event.relationship;
    }
    if (filter === 'available') {
      return !event.relationship && event.status === 'published';
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1">
        {[
          { key: 'all', label: 'All Events' },
          { key: 'my-events', label: 'My Events' },
          { key: 'available', label: 'Available' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.key
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{event.description}</p>
              </div>
              {getRelationshipBadge(event.relationship)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-300 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(event.start_date)} - {formatDate(event.end_date)}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                {event.venue}, {event.location}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {event.relationship !== 'managing' && (
                <>
                  {event.applications_enabled && !event.relationship && (
                    <button
                      onClick={() => handleApply(event.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Apply</span>
                    </button>
                  )}
                  
                  {event.ticketing_enabled && (
                    <button
                      onClick={() => handleBuyTickets(event.event_slug)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buy Tickets</span>
                    </button>
                  )}
                  
                  {!event.relationship && (
                    <button
                      onClick={() => handleAddToInterested(event.id)}
                      className="w-full bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Add to Interested</span>
                    </button>
                  )}
                </>
              )}
              
              {event.relationship === 'managing' && (
                <button
                  onClick={() => window.location.href = `/events/${event.id}`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Manage Event</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No events found</h3>
          <p className="text-gray-400">
            {filter === 'my-events' 
              ? 'You haven\'t applied to or attended any events yet'
              : 'No events available at the moment'
            }
          </p>
        </div>
      )}
    </div>
  );
}