import React from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface BookingCardProps {
  booking: {
    id: string;
    start: string; // ISO string
    end: string; // ISO string
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    notes?: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    consentCompleted?: boolean;
  };
  onCancel?: (bookingId: string) => void;
  onComplete?: (bookingId: string) => void;
  onViewConsent?: (bookingId: string) => void;
  isArtistView?: boolean;
}

export function BookingCard({ 
  booking, 
  onCancel, 
  onComplete, 
  onViewConsent,
  isArtistView = false 
}: BookingCardProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const isUpcoming = booking.status === 'upcoming';
  const canCancel = isUpcoming && onCancel;
  const canComplete = isUpcoming && onComplete && isArtistView;
  const canViewConsent = booking.consentCompleted && onViewConsent;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            {booking.consentCompleted && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Consent Form Completed</span>
              </span>
            )}
            {isUpcoming && !booking.consentCompleted && (
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Consent Form Needed</span>
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {isArtistView ? booking.clientName : 'Your Booking'}
          </h3>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-300 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(booking.start)}
        </div>
        <div className="flex items-center text-gray-300 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          {formatTime(booking.start)} - {formatTime(booking.end)}
        </div>
        
        {isArtistView && (
          <>
            <div className="flex items-center text-gray-300 text-sm">
              <User className="w-4 h-4 mr-2" />
              {booking.clientName}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Mail className="w-4 h-4 mr-2" />
              {booking.clientEmail}
            </div>
            {booking.clientPhone && (
              <div className="flex items-center text-gray-300 text-sm">
                <Phone className="w-4 h-4 mr-2" />
                {booking.clientPhone}
              </div>
            )}
          </>
        )}
        
        {booking.notes && (
          <div className="flex items-start text-gray-300 text-sm">
            <FileText className="w-4 h-4 mr-2 mt-1" />
            <span>{booking.notes}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {canCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
        
        {canComplete && (
          <button
            onClick={() => onComplete(booking.id)}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Complete</span>
          </button>
        )}
        
        {canViewConsent && (
          <button
            onClick={() => onViewConsent(booking.id)}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>View Consent Form</span>
          </button>
        )}
      </div>
    </div>
  );
}