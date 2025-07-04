import React, { useState } from 'react';
import { User, Mail, Calendar, Eye, Check, X, ExternalLink, Clock } from 'lucide-react';

interface Application {
  id: number;
  applicantName: string;
  email: string;
  type: string;
  event: string;
  status: string;
  submittedAt: string;
  experience: string;
  portfolio: string;
  avatar: string;
}

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'artist':
        return 'bg-purple-500/20 text-purple-400';
      case 'piercer':
        return 'bg-teal-500/20 text-teal-400';
      case 'performer':
        return 'bg-orange-500/20 text-orange-400';
      case 'trader':
        return 'bg-blue-500/20 text-blue-400';
      case 'volunteer':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStatusChange = (newStatus: string) => {
    // Handle status change logic here
    console.log(`Changing status to ${newStatus} for application ${application.id}`);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={application.avatar}
              alt={application.applicantName}
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{application.applicantName}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{application.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(application.type)}`}>
              {application.type}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-gray-300 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Event: {application.event}</span>
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>Submitted: {formatDate(application.submittedAt)}</span>
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <User className="w-4 h-4 mr-2" />
            <span>Experience: {application.experience}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <h4 className="text-white font-medium mb-2">Additional Details</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>Portfolio:</strong> 
                <a 
                  href={application.portfolio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 ml-1 inline-flex items-center"
                >
                  View Portfolio <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
              <p><strong>Application Type:</strong> {application.type.charAt(0).toUpperCase() + application.type.slice(1)}</p>
              <p><strong>Event Applied For:</strong> {application.event}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>{isExpanded ? 'Show Less' : 'View Details'}</span>
          </button>

          {application.status === 'pending' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusChange('approved')}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}