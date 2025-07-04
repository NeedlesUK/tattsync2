import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, CheckCircle, Clock, AlertTriangle, XCircle, MessageCircle, Save, Eye, Download, Upload } from 'lucide-react';

interface AttendeeProfileModalProps {
  attendee: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: any) => void;
}

export function AttendeeProfileModal({
  attendee,
  isOpen,
  onClose,
  onUpdate
}: AttendeeProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'booth' | 'booking'>('profile');
  const [boothNumber, setBoothNumber] = useState(attendee?.booth_number || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !attendee) return null;

  // Mock profile data
  const profileFields = [
    {
      name: 'profile_photo',
      label: 'Profile Photo',
      type: 'image',
      status: 'approved',
      value: attendee.profile_photo,
      submitted_at: '2024-01-10T10:00:00Z'
    },
    {
      name: 'portfolio_images',
      label: 'Portfolio Images',
      type: 'image',
      status: 'pending',
      value: null,
      submitted_at: '2024-01-12T14:30:00Z'
    },
    {
      name: 'bio',
      label: 'Artist Bio',
      type: 'textarea',
      status: 'approved',
      value: 'Experienced tattoo artist specializing in traditional and neo-traditional styles with over 8 years in the industry.',
      submitted_at: '2024-01-10T10:00:00Z'
    },
    {
      name: 'specialties',
      label: 'Specialties',
      type: 'text',
      status: 'approved',
      value: 'Traditional, Neo-Traditional, Black & Grey',
      submitted_at: '2024-01-10T10:00:00Z'
    },
    {
      name: 'certifications',
      label: 'Certifications',
      type: 'file',
      status: 'pending',
      value: 'tattoo_license.pdf',
      submitted_at: '2024-01-11T16:20:00Z'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleApproveField = (fieldName: string) => {
    console.log('Approving field:', fieldName);
    // In real implementation, update field status
  };

  const handleRejectField = (fieldName: string) => {
    console.log('Rejecting field:', fieldName);
    // In real implementation, update field status
  };

  const handleUpdateBooth = async () => {
    setIsUpdating(true);
    try {
      await onUpdate({ booth_number: boothNumber });
      console.log('Updated booth number:', boothNumber);
    } catch (error) {
      console.error('Error updating booth:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getApplicationTypeInfo = (type: string) => {
    const info = {
      artist: { title: 'Tattoo Artist', icon: '🎨' },
      piercer: { title: 'Piercer', icon: '💎' },
      trader: { title: 'Trader', icon: '🛍️' },
      caterer: { title: 'Caterer', icon: '🍕' },
      performer: { title: 'Performer', icon: '🎭' }
    };
    return info[type as keyof typeof info] || { title: type, icon: '📋' };
  };

  const typeInfo = getApplicationTypeInfo(attendee.application_type);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <img
              src={attendee.profile_photo || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2`}
              alt={attendee.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{attendee.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{typeInfo.icon}</span>
                <span className="text-gray-300">{typeInfo.title}</span>
                {attendee.booth_number && (
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">
                    Booth {attendee.booth_number}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { key: 'profile', label: 'Profile Review', icon: User },
            { key: 'booth', label: 'Booth Allocation', icon: MapPin },
            { key: 'booking', label: 'Booking Status', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Profile Review Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-400 text-sm">Email</span>
                      <p className="text-white">{attendee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-400 text-sm">Phone</span>
                      <p className="text-white">{attendee.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Profile Submissions</h3>
                {profileFields.map((field) => {
                  const StatusIcon = getStatusIcon(field.status);
                  
                  return (
                    <div key={field.name} className="bg-white/5 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`w-5 h-5 ${getStatusColor(field.status)}`} />
                          <div>
                            <h4 className="text-white font-medium">{field.label}</h4>
                            <p className="text-gray-400 text-sm">
                              Submitted {formatDate(field.submitted_at)}
                            </p>
                          </div>
                        </div>
                        
                        {field.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRejectField(field.name)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveField(field.name)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="bg-white/5 rounded p-4">
                        {field.type === 'image' && field.value && (
                          <img
                            src={field.value}
                            alt={field.label}
                            className="w-32 h-32 object-cover rounded"
                          />
                        )}
                        {field.type === 'file' && field.value && (
                          <div className="flex items-center space-x-2">
                            <Download className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{field.value}</span>
                          </div>
                        )}
                        {(field.type === 'text' || field.type === 'textarea') && field.value && (
                          <p className="text-gray-300">{field.value}</p>
                        )}
                        {!field.value && (
                          <p className="text-gray-400 italic">No content submitted</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Booth Allocation Tab */}
          {activeTab === 'booth' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Booth Assignment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Booth Number
                    </label>
                    <input
                      type="text"
                      value={boothNumber}
                      onChange={(e) => setBoothNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., A-15, B-08"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={handleUpdateBooth}
                      disabled={isUpdating}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Save className="w-5 h-5" />
                      <span>{isUpdating ? 'Updating...' : 'Update Booth'}</span>
                    </button>
                  </div>
                </div>

                {attendee.booth_number && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm">
                      Currently assigned to booth <strong>{attendee.booth_number}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-white font-medium mb-3">Booth Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">Standard</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white">3x3m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">Main Hall</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Power:</span>
                    <span className="text-white">2x 13A sockets</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Status Tab */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              {['artist', 'piercer'].includes(attendee.application_type) ? (
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Booking Availability</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Current Status</h4>
                        <p className="text-gray-400 text-sm">How clients can book with this {attendee.application_type}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        attendee.booking_status === 'fully_booked' 
                          ? 'bg-red-500/20 text-red-400'
                          : attendee.booking_status === 'advance_bookings'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {attendee.booking_status?.replace('_', ' ') || 'Not set'}
                      </span>
                    </div>

                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-300 font-medium mb-2">Public Display</h4>
                      <p className="text-blue-200 text-sm">
                        This booking status will be shown on the public attendee directory, 
                        helping potential clients understand how to book appointments.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-6">
                  <h3 className="text-gray-300 font-medium mb-2">Booking Status Not Applicable</h3>
                  <p className="text-gray-400 text-sm">
                    Booking preferences are only available for artists and piercers.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4 p-6 border-t border-white/10 bg-white/5">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Send Message</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}