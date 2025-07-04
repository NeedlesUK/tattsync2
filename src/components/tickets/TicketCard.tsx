import React from 'react';
import { Calendar, MapPin, QrCode, Download, Share2, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TicketCardProps {
  ticket: {
    id: number;
    eventName: string;
    eventLocation: string;
    eventVenue: string;
    ticketType: string;
    purchaseDate: string;
    eventDate: string;
    qrCode: string;
    status: 'active' | 'used' | 'cancelled' | 'expired';
  };
  onDownload: (ticketId: number) => void;
  onShare: (ticketId: number) => void;
}

export function TicketCard({ ticket, onDownload, onShare }: TicketCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'used':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'expired':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-purple-500/20 text-purple-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">{ticket.eventName}</h3>
            <p className="text-gray-300 text-sm">{ticket.ticketType}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-300 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(ticket.eventDate)}
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            {ticket.eventVenue}, {ticket.eventLocation}
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Purchased: {new Date(ticket.purchaseDate).toLocaleDateString('en-GB')}
          </div>
        </div>
        
        {ticket.status === 'active' && (
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-lg flex items-center justify-center">
              <QRCodeSVG 
                value={ticket.qrCode} 
                size={128} 
                bgColor={"#ffffff"} 
                fgColor={"#000000"} 
                level={"L"} 
                includeMargin={false}
              />
            </div>
          </div>
        )}
        
        {ticket.status === 'active' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onDownload(ticket.id)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={() => onShare(ticket.id)}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        )}
        
        {ticket.status !== 'active' && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            {ticket.status === 'used' && (
              <p className="text-blue-400">This ticket has been used.</p>
            )}
            {ticket.status === 'cancelled' && (
              <p className="text-red-400">This ticket has been cancelled.</p>
            )}
            {ticket.status === 'expired' && (
              <p className="text-gray-400">This ticket has expired.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}