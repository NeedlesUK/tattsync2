import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Calendar, User, Mail, Phone, MapPin, Heart, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ConsentFormModal } from '../components/consent/ConsentFormModal';
import { ConsentFormViewer } from '../components/consent/ConsentFormViewer';

interface ConsentForm {
  id: number;
  title: string;
  description: string;
  event_id: number;
  event_name: string;
  is_active: boolean;
  requires_medical_history: boolean;
}

interface FormSubmission {
  id: number;
  form_id: number;
  client_id: string;
  submission_data: any;
  submitted_at: string;
  artist_name: string;
  artist_email: string;
  artist_booth?: string;
  procedure_type: string;
}

export function ClientConsentPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tattoo' | 'piercing' | 'history'>('tattoo');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    fetchClientData();
    fetchSubmissions();
  }, []);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch client data
      setClientData(null);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // TODO: Implement API call to fetch submissions
      setSubmissions([]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleGetTattoo = () => {
    // In a real implementation, fetch the appropriate form ID for tattoos
    setSelectedFormId(1);
    setSelectedEventId(1);
    setIsFormModalOpen(true);
  };

  const handleGetPiercing = () => {
    // In a real implementation, fetch the appropriate form ID for piercings
    setSelectedFormId(2);
    setSelectedEventId(1);
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
        client_id: user?.id || '',
        submission_data: formData.submission_data,
        submitted_at: new Date().toISOString(),
        artist_name: formData.artist_id ? 'Selected Artist' : '',
        artist_email: '',
        procedure_type: formData.form_id === 1 ? 'tattoo' : 'piercing'
      };
      
      setSubmissions([newSubmission, ...submissions]);
      setIsFormModalOpen(false);
      
      // Show success message
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleViewSubmission = (submission: FormSubmission) => {
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

  const filteredSubmissions = submissions.filter(submission => {
    if (activeTab === 'tattoo') return submission.procedure_type === 'tattoo';
    if (activeTab === 'piercing') return submission.procedure_type === 'piercing';
    return true;
  });

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
          <h1 className="text-3xl font-bold text-white mb-2">My Consent Forms</h1>
          <p className="text-gray-300">Manage your consent forms and medical history</p>
        </div>

        {/* Client Profile Card */}
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{clientData?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>DOB: {clientData?.date_of_birth ? formatDate(clientData.date_of_birth) : 'Not provided'}</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  <span>Medical Info Saved</span>
                </div>
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>ID Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get a Tattoo</h3>
              <p className="text-gray-300 mb-6">Complete a consent form for a tattoo procedure</p>
            </div>
            <button
              onClick={handleGetTattoo}
              className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Start Tattoo Consent Form
            </button>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get a Piercing</h3>
              <p className="text-gray-300 mb-6">Complete a consent form for a piercing procedure</p>
            </div>
            <button
              onClick={handleGetPiercing}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Start Piercing Consent Form
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('tattoo')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tattoo'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Tattoo Forms
          </button>
          <button
            onClick={() => setActiveTab('piercing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'piercing'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Piercing Forms
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Medical History
          </button>
        </div>

        {/* Submissions List */}
        {(activeTab === 'tattoo' || activeTab === 'piercing') && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">
                {activeTab === 'tattoo' ? 'My Tattoo Consent Forms' : 'My Piercing Consent Forms'}
              </h2>
            </div>
            
            {filteredSubmissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-white">{submission.artist_name}</td>
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
                  You haven't completed any {activeTab === 'tattoo' ? 'tattoo' : 'piercing'} consent forms yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Medical History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Medical History</h2>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Update History</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Medical Conditions</h3>
                  <p className="text-gray-300">
                    {clientData?.medical_conditions || 'No medical conditions reported'}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Allergies</h3>
                  <p className="text-gray-300">
                    {clientData?.allergies || 'No allergies reported'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Medications</h3>
                  <p className="text-gray-300">
                    {clientData?.medications || 'No medications reported'}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Emergency Contact</h3>
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      <span className="text-gray-400">Name:</span> {clientData?.emergency_contact_name || 'Not provided'}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">Phone:</span> {clientData?.emergency_contact_phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-300 font-medium">Privacy Notice</h3>
                </div>
                <p className="text-blue-200 text-sm">
                  Your medical information is kept private and only shared with artists when you complete a consent form. 
                  You can update your medical history at any time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Consent Form Modal */}
        {isFormModalOpen && selectedFormId && selectedEventId && (
          <ConsentFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            formId={selectedFormId}
            eventId={selectedEventId}
            clientData={clientData}
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
                    name: user?.name || '',
                    email: user?.email || ''
                  }}
                  artistData={{
                    name: selectedSubmission.artist_name,
                    email: selectedSubmission.artist_email,
                    booth_number: selectedSubmission.artist_booth
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