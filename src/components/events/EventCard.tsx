import React from 'react';
import { Calendar, MapPin, Users, Edit, Eye, Trash2 } from 'lucide-react';

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  venue: string;
  attendees: number;
  maxAttendees: number;
  status: string;
  image: string;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-purple-500/20 text-purple-400';
    }
  };

  const attendancePercentage = (event.attendees / event.maxAttendees) * 100;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all group">
      <div className="relative">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-300 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.date)} - {formatDate(event.endDate)}
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            {event.venue}, {event.location}
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <Users className="w-4 h-4 mr-2" />
            {event.attendees} / {event.maxAttendees} attendees
          </div>
        </div>

        {/* Attendance Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Attendance</span>
            <span>{Math.round(attendancePercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full transition-all"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}