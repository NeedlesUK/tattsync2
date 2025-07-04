import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, CheckCircle, Clock, XCircle, Eye, Settings, Mail, Calendar, CreditCard } from 'lucide-react';
import { ApplicationReviewModal } from '../components/applications/ApplicationReviewModal';
import { EventApplicationSettings } from '../components/events/EventApplicationSettings';
import { PaymentSettingsModal } from '../components/events/PaymentSettingsModal';
import { useAuth } from '../contexts/AuthContext';

interface Application {
  id: number;
  applicant_name: string;
  applicant_email: string;
  date_of_birth: string;
  telephone: string;
  application_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  form_data: any;
  event_name: string;
  event_id: number;
  used_existing_account?: boolean;
}

export function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has access to applications
  const hasApplicationAccess = user?.role === 'event_manager' || user?.role === 'event_admin';

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    const fetchApplications = async () => {
      if (!hasApplicationAccess) {
        setIsLoading(false);
        return;
      }
      
      try {
        // In a real implementation, fetch from API
        // For now, we'll just simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set empty applications array
        setApplications([]);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
      
      setIsLoading(false);
    };
    
    fetchApplications();
    setIsLoading(false);
  }, [hasApplicationAccess]);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.event_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(app => app.application_type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    if (selectedEvent !== 'all') {
      filtered = filtered.filter(app => app.event_id.toString() === selectedEvent);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, selectedType, selectedStatus, selectedEvent]);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsReviewModalOpen(true);
  };

  const handleApproveApplication = async (id: number) => {
    try {
      // In real implementation, call API to approve application with payment requirement
      console.log('Approving application with payment requirement:', id);
      
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status: 'approved' as const } : app
      ));
      
      // Send approval email with 7-day registration link
      console.log('Sending approval email with registration link');
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleApproveComplimentary = async (id: number) => {
    try {
      // In real implementation, call API to approve application without payment requirement
      console.log('Approving application as complimentary (no payment required):', id);
      
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status: 'approved' as const } : app
      ));
      
      // Send complimentary approval email with registration link that bypasses payment
      console.log('Sending complimentary approval email with payment-free registration link');
    } catch (error) {
      console.error('Error approving application as complimentary:', error);
    }
  };

  const handleRejectApplication = async (id: number) => {
    try {
      // In real implementation, call API to reject application
      console.log('Rejecting application:', id);
      
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status: 'rejected' as const } : app
      ));
      
      // Send rejection email
      console.log('Sending rejection email');
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleSaveSettings = async (settings: any) => {
    try {
      // In real implementation, save settings to API
      console.log('Saving application settings:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSavePaymentSettings = async (settings: any) => {
    try {
      // In real implementation, save payment settings to API
      console.log('Saving payment settings:', settings);
    } catch (error) {
      console.error('Error saving payment settings:', error);
    }
  };

  const getApplicationTypeInfo = (type: string) => {
    const info = {
      artist: { title: 'Tattoo Artist', icon: '🎨', color: 'purple' },
      piercer: { title: 'Piercer', icon: '💎', color: 'teal' },
      performer: { title: 'Performer', icon: '🎭', color: 'orange' },
      trader: { title: 'Trader', icon: '🛍️', color: 'blue' },
      volunteer: { title: 'Volunteer', icon: '🤝', color: 'green' },
      caterer: { title: 'Caterer', icon: '🍕', color: 'yellow' }
    };
    return info[type as keyof typeof info] || { title: type, icon: '📋', color: 'gray' };
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  const uniqueEvents = Array.from(new Set(applications.map(app => ({ id: app.event_id, name: app.event_name }))))
    .map(event => ({ id: event.id.toString(), name: event.name }));

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show access denied for users without permission
  if (!hasApplicationAccess) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
            <p className="text-gray-300 mb-6">
              Applications are managed by Event Managers and Event Admins only. 
              {user?.role === 'admin' && ' As a Master Admin, you can create events and assign Event Managers to handle applications.'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Applications</h1>
            <p className="text-gray-300">
              Review and manage applications for your events
            </p>
          </div>
          
          {user?.role === 'event_manager' && (
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setIsPaymentSettingsOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Payment Settings</span>
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Application Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-white">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-white">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Events</option>
              {uniqueEvents.map(event => (
                <option key={event.id} value={event.id} className="bg-gray-800">
                  {event.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="artist">Artist</option>
              <option value="piercer">Piercer</option>
              <option value="performer">Performer</option>
              <option value="trader">Trader</option>
              <option value="volunteer">Volunteer</option>
              <option value="caterer">Caterer</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredApplications.map((application) => {
                  const typeInfo = getApplicationTypeInfo(application.application_type);
                  
                  return (
                    <tr key={application.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-white font-medium">{application.applicant_name}</div>
                          <div className="text-gray-400 text-sm">{application.applicant_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{typeInfo.icon}</span>
                          <span className="text-gray-300">{typeInfo.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {application.event_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.used_existing_account 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {application.used_existing_account ? 'TattSync Account' : 'Manual Entry'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {formatDate(application.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No applications found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedEvent !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No applications have been submitted yet'
              }
            </p>
          </div>
        )}

        {/* Review Modal */}
        <ApplicationReviewModal
          application={selectedApplication}
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedApplication(null);
          }}
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
          onApproveComplimentary={handleApproveComplimentary}
        />

        {/* Settings Modal */}
        <EventApplicationSettings
          eventId={1} // In real implementation, get from selected event
          eventName="Ink Fest 2024" // In real implementation, get from selected event
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSaveSettings}
        />

        {/* Payment Settings Modal */}
        <PaymentSettingsModal
          eventId={1} // In real implementation, get from selected event
          eventName="Ink Fest 2024" // In real implementation, get from selected event
          isOpen={isPaymentSettingsOpen}
          onClose={() => setIsPaymentSettingsOpen(false)}
          onSave={handleSavePaymentSettings}
        />
      </div>
    </div>
  );
}