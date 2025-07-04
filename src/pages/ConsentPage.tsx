import React, { useState } from 'react';
import { FileText, QrCode, Download, Plus, Eye, Edit, Trash2 } from 'lucide-react';

export function ConsentPage() {
  const [activeTab, setActiveTab] = useState('forms');

  const consentForms = [
    {
      id: 1,
      title: 'Tattoo Consent Form',
      description: 'Standard consent form for tattoo procedures',
      fields: 8,
      submissions: 45,
      status: 'active',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tattsync.com/consent/1'
    },
    {
      id: 2,
      title: 'Piercing Medical History',
      description: 'Comprehensive medical history for piercing clients',
      fields: 12,
      submissions: 23,
      status: 'active',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tattsync.com/consent/2'
    },
    {
      id: 3,
      title: 'General Waiver',
      description: 'General liability waiver for all procedures',
      fields: 6,
      submissions: 67,
      status: 'draft',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tattsync.com/consent/3'
    }
  ];

  const recentSubmissions = [
    {
      id: 1,
      clientName: 'Sarah Johnson',
      form: 'Tattoo Consent Form',
      submittedAt: '2024-01-15 14:30',
      status: 'completed'
    },
    {
      id: 2,
      clientName: 'Mike Chen',
      form: 'Piercing Medical History',
      submittedAt: '2024-01-15 12:15',
      status: 'completed'
    },
    {
      id: 3,
      clientName: 'Emma Davis',
      form: 'General Waiver',
      submittedAt: '2024-01-15 10:45',
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Consent Management</h1>
            <p className="text-gray-300">Manage consent forms and client medical history</p>
          </div>
          <button className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2">
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

        {activeTab === 'forms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consentForms.map((form) => (
              <div key={form.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{form.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{form.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    form.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {form.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{form.fields}</p>
                    <p className="text-gray-400 text-sm">Fields</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{form.submissions}</p>
                    <p className="text-gray-400 text-sm">Submissions</p>
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="bg-white p-2 rounded-lg">
                    <img 
                      src={form.qrCode} 
                      alt="QR Code" 
                      className="w-24 h-24"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors">
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Recent Submissions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Form</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-white">{submission.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{submission.form}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{submission.submittedAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          submission.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-purple-400 hover:text-purple-300">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-300">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}