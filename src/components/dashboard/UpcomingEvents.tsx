import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

export function UpcomingEvents() {
  const events = [
    {
      id: 1,
      name: 'Ink Fest 2024',
      date: '2024-03-15',
      location: 'Los Angeles, CA',
      attendees: 247,
      status: 'upcoming'
    },
    {
      id: 2,
      name: 'Body Art Expo',
      date: '2024-03-22',
      location: 'New York, NY',
      attendees: 189,
      status: 'upcoming'
    },
    {
      id: 3,
      name: 'Tattoo Convention',
      date: '2024-04-05',
      location: 'Miami, FL',
      attendees: 156,
      status: 'draft'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-medium">{event.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                event.status === 'upcoming' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {event.status}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-gray-300 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Users className="w-4 h-4 mr-2" />
                {event.attendees} registered
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
        View all events
      </button>
    </div>
  );
}