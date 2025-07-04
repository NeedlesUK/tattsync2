import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, MessageCircle, Send, MapPin, CheckCircle, Clock, AlertTriangle, XCircle, Eye, Settings, Share2, User, Mail, Phone, Calendar } from 'lucide-react';
import { ProfileRequirementsModal } from './ProfileRequirementsModal';
import { BookingPreferencesModal } from './BookingPreferencesModal';
import { SocialMediaModal } from './SocialMediaModal';
import { AttendeeProfileModal } from './AttendeeProfileModal';

interface Attendee {
  id: number;
  application_id: number;
  name: string;
  email: string;
  phone: string;
  application_type: string;
  status: 'approved' | 'registered';
  booth_number?: string;
  profile_completion: {
    total_required: number;
    completed: number;
    approved: number;
    pending: number;
    rejected: number;
    percentage: number;
    is_complete: boolean;
  };
  booking_status?: 'fully_booked' | 'advance_bookings' | 'taking_walkups';
  last_activity: string;
  registration_date: string;
  profile_photo?: string;
}

export function RegistrationManagementPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [isProfileRequirementsOpen, setIsProfileRequirementsOpen] = useState(false);
  const [isSocialMediaOpen, setIsSocialMediaOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
  const [bulkMessageText, setBulkMessageText] = useState('');
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    const mockAttendees: Attendee[] = [
      {
        id: 1,
        application_id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+44 7700 900123',
        application_type: 'artist',
        status: 'registered',
        booth_number: 'A-15',
        profile_completion: {
          total_required: 8,
          completed: 8,
          approved: 6,
          pending: 2,
          rejected: 0,
          percentage: 100,
          is_complete: true
        },
        booking_status: 'advance_bookings',
        last_activity: '2024-01-15T14:30:00Z',
        registration_date: '2024-01-10T10:00:00Z',
        profile_photo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
      },
      {
        id: 2,
        application_id: 2,
        name: 'Mike Chen',
        email: 'mike@example.com',
        phone: '+44 7700 900456',
        application_type: 'piercer',
        status: 'registered',
        booth_number: 'B-08',
        profile_completion: {
          total_required: 7,
          completed: 5,
          approved: 4,
          pending: 1,
          rejected: 0,
          percentage: 71,
          is_complete: false
        },
        booking_status: 'taking_walkups',
        last_activity: '2024-01-14T16:20:00Z',
        registration_date: '2024-01-08T14:30:00Z',
        profile_photo: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
      },
      {
        id: 3,
        application_id: 3,
        name: 'Emma Davis',
        email: 'emma@example.com',
        phone: '+44 7700 900789',
        application_type: 'trader',
        status: 'approved',
        profile_completion: {
          total_required: 6,
          completed: 2,
          approved: 1,
          pending: 1,
          rejected: 0,
          percentage: 33,
          is_complete: false
        },
        last_activity: '2024-01-12T09:15:00Z',
        registration_date: '2024-01-05T11:20:00Z'
      }
    ];

    setAttendees(mockAttendees);
    setIsLoading(false);
  }, []);

  // Filter attendees
  useEffect(() => {
    let filtered = attendees;

    if (searchTerm) {
      filtered = filtered.filter(attendee =>
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.booth_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(attendee => attendee.application_type === selectedType);
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'complete') {
        filtered = filtered.filter(attendee => attendee.profile_completion.is_complete);
      } else if (selectedStatus === 'incomplete') {
        filtered = filtered.filter(attendee => !attendee.profile_completion.is_complete);
      } else {
        filtered = filtered.filter(attendee => attendee.status === selectedStatus);
      }
    }

    setFilteredAttendees(filtered);
  }, [attendees, searchTerm, selectedType, selectedStatus]);

  const getApplicationTypeInfo = (type: string) => {
    const info = {
      artist: { title: 'Artist', icon: '🎨', color: 'purple' },
      piercer: { title: 'Piercer', icon: '💎', color: 'teal' },
      performer: { title: 'Performer', icon: '🎭', color: 'orange' },
      trader: { title: 'Trader', icon: '🛍️', color: 'blue' },
      volunteer: { title: 'Volunteer', icon: '🤝', color: 'green' },
      caterer: { title: 'Caterer', icon: '🍕', color: 'yellow' }
    };
    return info[type as keyof typeof info] || { title: type, icon: '📋', color: 'gray' };
  };

  const getProfileStatusColor = (completion: any) => {
    if (completion.is_complete && completion.approved === completion.total_required) {
      return 'bg-green-500'; // All complete and approved
    } else if (completion.percentage >= 80) {
      return 'bg-yellow-500'; // Mostly complete
    } else if (completion.percentage >= 40) {
      return 'bg-orange-500'; // Partially complete
    } else {
      return 'bg-red-500'; // Needs attention
    }
  };

  const getProfileStatusIcon = (completion: any) => {
    if (completion.is_complete && completion.approved === completion.total_required) {
      return CheckCircle;
    } else if (completion.rejected > 0) {
      return XCircle;
    } else if (completion.pending > 0) {
      return Clock;
    } else {
      return AlertTriangle;
    }
  };

  const handleSelectAttendee = (id: number) => {
    setSelectedAttendees(prev => 
      prev.includes(id) 
        ? prev.filter(attendeeId => attendeeId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAttendees.length === filteredAttendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(filteredAttendees.map(a => a.id));
    }
  };

  const handleBulkMessage = () => {
    if (selectedAttendees.length === 0) return;
    setShowBulkMessage(true);
  };

  const sendBulkMessage = () => {
    console.log('Sending bulk message to:', selectedAttendees, 'Message:', bulkMessageText);
    setShowBulkMessage(false);
    setBulkMessageText('');
    setSelectedAttendees([]);
  };

  const handleViewAttendee = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setIsAttendeeModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Registration Management</h1>
            <p className="text-gray-300">
              Manage attendee profiles, booth allocations, and communications
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setIsSocialMediaOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Social Media</span>
            </button>
            <button
              onClick={() => setIsProfileRequirementsOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>Profile Settings</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Registered</p>
                <p className="text-2xl font-bold text-white">{attendees.filter(a => a.status === 'registered').length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profile Complete</p>
                <p className="text-2xl font-bold text-white">
                  {attendees.filter(a => a.profile_completion.is_complete).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Booths Allocated</p>
                <p className="text-2xl font-bold text-white">
                  {attendees.filter(a => a.booth_number).length}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Needs Attention</p>
                <p className="text-2xl font-bold text-white">
                  {attendees.filter(a => a.profile_completion.percentage < 50 || a.profile_completion.rejected > 0).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="artist">Artists</option>
              <option value="piercer">Piercers</option>
              <option value="trader">Traders</option>
              <option value="caterer">Caterers</option>
              <option value="performer">Performers</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="registered">Registered</option>
              <option value="complete">Profile Complete</option>
              <option value="incomplete">Profile Incomplete</option>
            </select>

            {selectedAttendees.length > 0 && (
              <button
                onClick={handleBulkMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Message ({selectedAttendees.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Attendees Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                      onChange={handleSelectAll}
                      className="text-purple-600 focus:ring-purple-500 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Attendee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Profile Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Booth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Booking Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredAttendees.map((attendee) => {
                  const typeInfo = getApplicationTypeInfo(attendee.application_type);
                  const StatusIcon = getProfileStatusIcon(attendee.profile_completion);
                  
                  return (
                    <tr key={attendee.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.includes(attendee.id)}
                          onChange={() => handleSelectAttendee(attendee.id)}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={attendee.profile_photo || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2`}
                            alt={attendee.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-white font-medium">{attendee.name}</div>
                            <div className="text-gray-400 text-sm">{attendee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{typeInfo.icon}</span>
                          <span className="text-gray-300">{typeInfo.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getProfileStatusColor(attendee.profile_completion)}`}></div>
                          <div>
                            <div className="text-white text-sm">
                              {attendee.profile_completion.percentage}% Complete
                            </div>
                            <div className="text-gray-400 text-xs">
                              {attendee.profile_completion.approved}/{attendee.profile_completion.total_required} approved
                            </div>
                          </div>
                          <StatusIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendee.booth_number ? (
                          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">
                            {attendee.booth_number}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendee.booking_status && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            attendee.booking_status === 'fully_booked' 
                              ? 'bg-red-500/20 text-red-400'
                              : attendee.booking_status === 'advance_bookings'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {attendee.booking_status.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewAttendee(attendee)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No attendees found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No registered attendees yet'
              }
            </p>
          </div>
        )}

        {/* Bulk Message Modal */}
        {showBulkMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-purple-500/20 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">
                Send Message to {selectedAttendees.length} Attendees
              </h3>
              <textarea
                value={bulkMessageText}
                onChange={(e) => setBulkMessageText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your message..."
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowBulkMessage(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendBulkMessage}
                  disabled={!bulkMessageText.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <ProfileRequirementsModal
          eventId={1}
          eventName="Ink Fest 2024"
          applicationType="artist"
          isOpen={isProfileRequirementsOpen}
          onClose={() => setIsProfileRequirementsOpen(false)}
          onSave={(fields) => console.log('Saving profile requirements:', fields)}
        />

        <SocialMediaModal
          eventId={1}
          eventName="Ink Fest 2024"
          isOpen={isSocialMediaOpen}
          onClose={() => setIsSocialMediaOpen(false)}
          onSave={(data) => console.log('Saving social media data:', data)}
        />

        {selectedAttendee && (
          <AttendeeProfileModal
            attendee={selectedAttendee}
            isOpen={isAttendeeModalOpen}
            onClose={() => {
              setIsAttendeeModalOpen(false);
              setSelectedAttendee(null);
            }}
            onUpdate={(updates) => console.log('Updating attendee:', updates)}
          />
        )}
      </div>
    </div>
  );
}