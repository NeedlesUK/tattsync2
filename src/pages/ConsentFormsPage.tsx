import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, QrCode, Eye, Edit, Trash2, Download, Calendar, User } from 'lucide-react';
import { ConsentFormBuilder } from '../components/consent/ConsentFormBuilder';
import { ConsentFormViewer } from '../components/consent/ConsentFormViewer';
import { useAuth } from '../contexts/AuthContext';

interface ConsentForm {
  id: number;
  title: string;
  description: string;
  event_id: number;
  event_name: string;
  is_active: boolean;
  requires_medical_history: boolean;
  created_at: string;
  updated_at: string;
  submissions_count: number;
  qr_code?: string;
}

interface FormSubmission {
  id: number;
  form_id: number;
  client_id: string;
  client_name: string;
  client_email: string;
  submission_data: any;
  submitted_at: string;
}

export function ConsentFormsPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState<ConsentForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<ConsentForm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedForm, setSelectedForm] = useState<ConsentForm | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forms' | 'submissions'>('forms');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState('');

  useEffect(() => {
    fetchForms();
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredForms(forms);
    } else {
      const filtered = forms.filter(form => 
        form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.event_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredForms(filtered);
    }
  }, [searchTerm, forms]);

  useEffect(() => {
    if (submissionSearchTerm.trim() === '') {
      setFilteredSubmissions(submissions);
    } else {
      const filtered = submissions.filter(submission => 
        submission.client_name.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
        submission.client_email.toLowerCase().includes(submissionSearchTerm.toLowerCase())
      );
      setFilteredSubmissions(filtered);
    }
  }, [submissionSearchTerm, submissions]);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, fetch from API
      // Mock data for now
      const mockForms: ConsentForm[] = [
        {
          id: 1,
          title: 'Tattoo Consent Form',
          description: 'Standard consent form for tattoo procedures',
          event_id: 1,
          event_name: 'Ink Fest 2024',
          is_active: true,
          requires_medical_history: true,
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z',
          submissions_count: 45,
          qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tattsync.com/consent/1'
        },
        {
          id: 2,
          title: 'Piercing Medical History',
          description: 'Comprehensive medical history for piercing clients',
          event_id: 1,
          event_name: 'Ink Fest 2024',
          is_active: true,
          requires_medical_history: true,
          created_at: '2024-01-11T14:30:00Z',
          updated_at: '2024-01-11T14:30:00Z',
          submissions_count: 23,
          qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tattsync.com/consent/2'
        },
        {
          id: 3,
          title: 'General Waiver',
          description: 'General liability waiver for all procedures',
          event_id: 2,
          event_name: 'Body Art Expo',
          is_active: false,
          requires_medical_history: false,
          created_at: '2024-01-05T09:15:00Z',
          updated_at: '2024-01-05T09:15:00Z',
          submissions_count: 67,
          qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tattsync.com/consent/3'
        }
      ];
      
      setForms(mockForms);
      setFilteredForms(mockForms);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // In a real implementation, fetch from API
      // Mock data for now
      const mockSubmissions: FormSubmission[] = [
        {
          id: 1,
          form_id: 1,
          client_id: '1',
          client_name: 'John Smith',
          client_email: 'john@example.com',
          submission_data: {
            clientName: 'John Smith',
            clientEmail: 'john@example.com',
            DOB: '1990-05-15',
            Phone: '+44 7700 900123',
            FullAddress: '123 Main St, London, UK',
            artistName: 'Sarah Johnson',
            ageConfirm: true,
            riskConfirm: true,
            liabilityConfirm: true,
            mediaRelease: 'Yes',
            noIssues: true,
            aftercareAdvice: true,
            eatBefore: true,
            unwell: true,
            noAlcohol: true,
            marketingConsent: 'No'
          },
          submitted_at: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          form_id: 2,
          client_id: '2',
          client_name: 'Emily Wilson',
          client_email: 'emily@example.com',
          submission_data: {
            clientName: 'Emily Wilson',
            clientEmail: 'emily@example.com',
            DOB: '1995-08-22',
            Phone: '+44 7700 900456',
            FullAddress: '456 High St, Manchester, UK',
            artistName: 'Mike Chen',
            ageConfirm: true,
            riskConfirm: true,
            liabilityConfirm: true,
            mediaRelease: 'No',
            noIssues: false,
            medicalIssues: ['Any allergies'],
            medicalDetails: 'Allergic to latex',
            aftercareAdvice: true,
            eatBefore: true,
            unwell: true,
            noAlcohol: true,
            marketingConsent: 'Yes'
          },
          submitted_at: '2024-01-15T12:15:00Z'
        },
        {
          id: 3,
          form_id: 1,
          client_id: '3',
          client_name: 'David Brown',
          client_email: 'david@example.com',
          submission_data: {
            clientName: 'David Brown',
            clientEmail: 'david@example.com',
            DOB: '1988-11-30',
            Phone: '+44 7700 900789',
            FullAddress: '789 Park Lane, Birmingham, UK',
            artistName: 'Emma Davis',
            ageConfirm: true,
            riskConfirm: true,
            liabilityConfirm: true,
            mediaRelease: 'Yes',
            noIssues: false,
            medicalIssues: ['Diabetes'],
            medicalDetails: 'Type 2 diabetes, well controlled with medication',
            aftercareAdvice: true,
            eatBefore: true,
            unwell: true,
            noAlcohol: true,
            marketingConsent: 'No'
          },
          submitted_at: '2024-01-14T16:20:00Z'
        }
      ];
      
      setSubmissions(mockSubmissions);
      setFilteredSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleCreateForm = async (formData: any) => {
    try {
      // In a real implementation, save to API
      console.log('Creating form:', formData);
      
      // Mock successful creation
      const newForm: ConsentForm = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        event_id: formData.event_id,
        event_name: 'Ink Fest 2024', // Mock event name
        is_active: true,
        requires_medical_history: formData.requires_medical_history,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submissions_count: 0,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tattsync.com/consent/${Date.now()}`
      };
      
      setForms([newForm, ...forms]);
      setIsBuilderOpen(false);
    } catch (error) {
      console.error('Error creating form:', error);
    }
  };

  const handleUpdateForm = async (formData: any) => {
    try {
      // In a real implementation, update via API
      console.log('Updating form:', formData);
      
      // Mock successful update
      const updatedForms = forms.map(form => 
        form.id === formData.id ? {
          ...form,
          title: formData.title,
          description: formData.description,
          requires_medical_history: formData.requires_medical_history,
          updated_at: new Date().toISOString()
        } : form
      );
      
      setForms(updatedForms);
      setIsBuilderOpen(false);
    } catch (error) {
      console.error('Error updating form:', error);
    }
  };

  const handleDeleteForm = async (formId: number) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }
    
    try {
      // In a real implementation, delete via API
      console.log('Deleting form:', formId);
      
      // Mock successful deletion
      setForms(forms.filter(form => form.id !== formId));
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const handleToggleFormStatus = async (formId: number, currentStatus: boolean) => {
    try {
      // In a real implementation, update via API
      console.log('Toggling form status:', formId, !currentStatus);
      
      // Mock successful update
      const updatedForms = forms.map(form => 
        form.id === formId ? {
          ...form,
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        } : form
      );
      
      setForms(updatedForms);
    } catch (error) {
      console.error('Error toggling form status:', error);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Consent Management</h1>
            <p className="text-gray-300">Manage consent forms and client medical history</p>
          </div>
          <button
            onClick={() => {
              setSelectedForm(null);
              setIsBuilderOpen(true);
            }}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Form</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'forms'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Forms
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Submissions
          </button>
        </div>

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <div key={form.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{form.title}</h3>
                      <p className="text-gray-300 text-sm mb-4">{form.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      form.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{form.submissions_count}</p>
                      <p className="text-gray-400 text-sm">Submissions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{form.event_name}</p>
                      <p className="text-gray-400 text-sm">Event</p>
                    </div>
                  </div>

                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-2 rounded-lg">
                      <img 
                        src={form.qr_code} 
                        alt="QR Code" 
                        className="w-24 h-24"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      onClick={() => {
                        setSelectedForm(form);
                        setIsBuilderOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
                      onClick={() => handleToggleFormStatus(form.id, form.is_active)}
                    >
                      {form.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button 
                      className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
                      onClick={() => window.open(form.qr_code, '_blank')}
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button 
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors"
                      onClick={() => handleDeleteForm(form.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredForms.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No forms found</h3>
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first consent form to get started'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={submissionSearchTerm}
                  onChange={(e) => setSubmissionSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Form</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredSubmissions.map((submission) => {
                      const form = forms.find(f => f.id === submission.form_id);
                      
                      return (
                        <tr key={submission.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-white font-medium">{submission.client_name}</div>
                              <div className="text-gray-400 text-sm">{submission.client_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {form?.title || `Form #${submission.form_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {formatDate(submission.submitted_at)}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No submissions found</h3>
                <p className="text-gray-400">
                  {submissionSearchTerm
                    ? 'Try adjusting your search'
                    : 'No consent forms have been submitted yet'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {/* Form Builder Modal */}
        {isBuilderOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <ConsentFormBuilder
                  eventId={1} // In real implementation, get from context or props
                  initialForm={selectedForm ? {
                    id: selectedForm.id,
                    title: selectedForm.title,
                    description: selectedForm.description || '',
                    requires_medical_history: selectedForm.requires_medical_history,
                    sections: [] // In real implementation, fetch sections from API
                  } : undefined}
                  onSave={selectedForm ? handleUpdateForm : handleCreateForm}
                  onCancel={() => setIsBuilderOpen(false)}
                />
              </div>
            </div>
          </div>
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
                    title: forms.find(f => f.id === selectedSubmission.form_id)?.title || 'Consent Form',
                    description: forms.find(f => f.id === selectedSubmission.form_id)?.description || '',
                    sections: [] // In real implementation, fetch sections from API
                  }}
                  clientData={{
                    name: selectedSubmission.client_name,
                    email: selectedSubmission.client_email
                  }}
                  artistData={{
                    name: selectedSubmission.submission_data.artistName,
                    email: selectedSubmission.submission_data.artistEmail,
                    booth_number: selectedSubmission.submission_data.artistBooth
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