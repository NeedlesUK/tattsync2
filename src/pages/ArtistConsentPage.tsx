import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Calendar, User, Mail, Phone, MapPin, Search, Filter, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ConsentFormModal } from '../components/consent/ConsentFormModal';
import { ConsentFormViewer } from '../components/consent/ConsentFormViewer';

interface FormSubmission {
  id: number;
  form_id: number;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  submission_data: any;
  submitted_at: string;
  procedure_type: string;
  is_new: boolean;
}

export function ArtistConsentPage() {
  const { user } = useAuth();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState<any>(null);

  useEffect(() => {
    fetchArtistData();
    fetchSubmissions();
  }, []);

  useEffect(() => {
    let filtered = submissions;
    
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.client_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(submission => submission.procedure_type === filterType);
    }
    
    setFilteredSubmissions(filtered);
  }, [searchTerm, filterType, submissions]);

  const fetchArtistData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch artist data
      setArtistData(null);
    } catch (error) {
      console.error('Error fetching artist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // TODO: Implement API call to fetch submissions
      setSubmissions([]);
      setFilteredSubmissions([]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleNewConsentForm = () => {
    // In a real implementation, fetch the appropriate form ID based on artist type
    setSelectedFormId(artistData?.application_type === 'piercer' ? 2 : 1);
    setSelectedEventId(artistData?.event_id || 1);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (formData: any) => {
    try {
      // In a real implementation, submit to API
      console.log('Submitting form:', formData);
      
      // Mock successful submission
      const newSubmission: FormSubmission = {
        id: Date.now(),
        form_id: formData.form_id,
        client_id: formData.client_id || 'new-client',
        client_name: formData.submission_data.clientName,
        client_email: formData.submission_data.clientEmail,
        client_phone: formData.submission_data.Phone,
        submission_data: formData.submission_data,
        submitted_at: new Date().toISOString(),
        procedure_type: artistData?.application_type === 'piercer' ? 'piercing' : 'tattoo',
        is_new: true
      };
      
      setSubmissions([newSubmission, ...submissions]);
      setIsFormModalOpen(false);
      
      // Show success message
      alert('Form submitted successfully! A copy has been emailed to the client.');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleViewSubmission = (submission: FormSubmission) => {
    // Mark as read if it's new
    if (submission.is_new) {
      const updatedSubmissions = submissions.map(s => 
        s.id === submission.id ? { ...s, is_new: false } : s
      );
      setSubmissions(updatedSubmissions);
    }
    
    setSelectedSubmission(submission);
    setIsViewerOpen(true);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Client Consent Forms</h1>
          <p className="text-gray-300">Manage consent forms for your clients</p>
        </div>

        {/* Artist Profile Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <img
              src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&dpr=2"
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
            />
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm capitalize">
                    {artistData?.application_type || 'Artist'}
                  </span>
                  <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-sm">
                    Booth {artistData?.booth_number || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{artistData?.event_name || 'No event'}</span>
                </div>
                {artistData?.specialties && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{artistData.specialties.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button
            onClick={handleNewConsentForm}
            className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Client Consent Form</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="tattoo">Tattoo</option>
              <option value="piercing">Piercing</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Client Consent Forms</h2>
          </div>
          
          {filteredSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className={`hover:bg-white/5 ${submission.is_new ? 'bg-purple-500/5' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-white font-medium">{submission.client_name}</div>
                          <div className="text-gray-400 text-sm">{submission.client_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatDate(submission.submitted_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          submission.procedure_type === 'tattoo'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-teal-500/20 text-teal-400'
                        }`}>
                          {submission.procedure_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.is_new ? (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                            New
                          </span>
                        ) : (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Reviewed</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded text-sm transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No forms found</h3>
              <p className="text-gray-400">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t received any consent forms yet'
                }
              </p>
            </div>
          )}
        </div>

        {/* Consent Form Modal */}
        {isFormModalOpen && selectedFormId && selectedEventId && (
          <ConsentFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            formId={selectedFormId}
            eventId={selectedEventId}
            onSubmit={handleSubmitForm}
          />
        )}

        {/* Form Viewer Modal */}
        {isViewerOpen && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <ConsentFormViewer
                  submission={selectedSubmission}
                  formStructure={{
                    id: selectedSubmission.form_id,
                    title: selectedSubmission.procedure_type === 'tattoo' ? 'Tattoo Consent Form' : 'Piercing Consent Form',
                    description: 'Medical history and consent',
                    sections: [] // In real implementation, fetch sections from API
                  }}
                  clientData={{
                    name: selectedSubmission.client_name,
                    email: selectedSubmission.client_email,
                    phone: selectedSubmission.client_phone
                  }}
                  artistData={{
                    name: user?.name || '',
                    email: user?.email || '',
                    booth_number: artistData?.booth_number
                  }}
                  onClose={() => setIsViewerOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}