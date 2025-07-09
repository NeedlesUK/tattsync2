import React from 'react';
import { Calendar, MapPin, Edit, Eye, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface EventProps {
  id: number;
  name: string;
  description: string;
  date?: string; // start_date
  start_date?: string;
  endDate: string;
  end_date?: string;
  location: string;
  venue: string;
  attendees?: number;
  maxAttendees?: number;
  status: string;
  image: string;
  event_manager_id?: string;
  event_manager_email?: string;
  event_manager_name?: string;
  event_slug?: string;
}

interface EventCardProps {
  event: EventProps;
  onView?: (eventId: number) => void;
  onEdit?: (eventId: number) => void;
  onDelete?: (eventId: number) => void;
}

export function EventCard({ event, onView, onEdit, onDelete }: EventCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
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

  // Check if user is the event manager for this event
  const isEventManager = user?.id === event.event_manager_id || 
                         user?.email === event.event_manager_email;
                          
  const handleManage = () => {
    console.log('Managing event:', event.id);
    navigate(`/event-settings?event=${event.id}`);
  };
  
  const handleView = () => {
    if (event.event_slug) {
      console.log('Viewing event with slug:', event.event_slug);
      window.open(`/events/${event.event_slug}`, '_blank').focus();
    } else if (onView) {
      console.log('Viewing event with ID:', event.id);
      onView(event.id);
    }
  };

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
            {formatDate(event.date || event.start_date || new Date().toISOString())} - {formatDate(event.endDate || event.end_date || new Date().toISOString())}
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            {event.venue}, {event.location}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-2">
          {isEventManager ? (
            <button
              onClick={() => handleManage()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Settings className="w-4 h-4" />
              <span>Manage</span>
            </button>
          ) : (
            <button 
              onClick={() => handleView()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
          )}
          
          {isEventManager && onEdit && (
            <button 
              onClick={() => onEdit(event.id)}
              className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {isEventManager && onDelete && (
            <button 
              onClick={() => onDelete(event.id)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}