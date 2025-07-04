import React, { useState } from 'react';
import { Settings, Plus, Trash2, Save, Users, Mail, FileText, Edit } from 'lucide-react';

interface ApplicationType {
  type: string;
  enabled: boolean;
  maxApplications: number;
  currentApplications: number;
  requiresPayment: boolean;
  paymentAmount: number;
  agreementText: string;
}

interface EventApplicationSettingsProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

export function EventApplicationSettings({ 
  eventId, 
  eventName, 
  isOpen, 
  onClose, 
  onSave 
}: EventApplicationSettingsProps) {
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([
    { 
      type: 'artist', 
      enabled: true, 
      maxApplications: 50, 
      currentApplications: 12,
      requiresPayment: true,
      paymentAmount: 150.00,
      agreementText: `1. I have a valid tattoo registration issued by a local authority or government department or am willing to demonstrate my understanding of safe tattooing using the method(s) determined by the event.

2. I have or will have valid Public Liability Insurance for the event.

3. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

4. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

5. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

6. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

7. I understand that only the practitioner in this application may tattoo at the event in a single booth and this is not a studio application.`
    },
    { 
      type: 'piercer', 
      enabled: true, 
      maxApplications: 20, 
      currentApplications: 8,
      requiresPayment: true,
      paymentAmount: 120.00,
      agreementText: `1. I have a valid piercing registration issued by a local authority or government department or am willing to demonstrate my understanding of safe piercing using the method(s) determined by the event.

2. I have or will have valid Public Liability Insurance for the event.

3. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

4. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

5. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

6. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

7. I understand that only the practitioner in this application may pierce at the event in a single booth and this is not a studio application.`
    },
    { 
      type: 'performer', 
      enabled: false, 
      maxApplications: 10, 
      currentApplications: 0,
      requiresPayment: false,
      paymentAmount: 0.00,
      agreementText: ''
    },
    { 
      type: 'trader', 
      enabled: true, 
      maxApplications: 30, 
      currentApplications: 15,
      requiresPayment: true,
      paymentAmount: 200.00,
      agreementText: `By signing this online document I am agreeing I have read and agree to the following:

1. I have or will have valid Public Liability Insurance for trading at the event.

2. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

3. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

4. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

5. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

6. I understand that only the trader in this application may trade at the event in a single booth and this is not a joint application.`
    },
    { 
      type: 'volunteer', 
      enabled: true, 
      maxApplications: 100, 
      currentApplications: 23,
      requiresPayment: false,
      paymentAmount: 0.00,
      agreementText: ''
    },
    { 
      type: 'caterer', 
      enabled: false, 
      maxApplications: 5, 
      currentApplications: 0,
      requiresPayment: true,
      paymentAmount: 300.00,
      agreementText: `By signing this online document I am agreeing I have read and agree to the following:

1. I have or will have valid Public Liability Insurance for trading at the event.

2. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

3. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

4. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

5. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

6. I understand that only the caterer in this application may trade at the event in a single booth and this is not a joint application.`
    }
  ]);

  const [emailSettings, setEmailSettings] = useState({
    approvalSubject: 'Your application has been approved - {event_name}',
    approvalMessage: `Dear {applicant_name},

Congratulations! Your application to participate in {event_name} as a {application_type} has been approved.

You have 7 days to complete your registration. Please click the link below to proceed:
{registration_link}

If you have any questions, please don't hesitate to contact us.

Best regards,
The {event_name} Team`,
    rejectionSubject: 'Application Update - {event_name}',
    rejectionMessage: `Dear {applicant_name},

Thank you for your interest in participating in {event_name} as a {application_type}.

Unfortunately, we are unable to approve your application at this time. This may be due to limited spaces or specific requirements for this event.

We encourage you to apply for future events and wish you all the best.

Best regards,
The {event_name} Team`
  });

  const [activeTab, setActiveTab] = useState<'types' | 'agreements' | 'emails'>('types');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const getApplicationTypeInfo = (type: string) => {
    const info = {
      artist: { title: 'Tattoo Artist', icon: '🎨' },
      piercer: { title: 'Piercer', icon: '💎' },
      performer: { title: 'Performer', icon: '🎭' },
      trader: { title: 'Trader', icon: '🛍️' },
      volunteer: { title: 'Volunteer', icon: '🤝' },
      caterer: { title: 'Caterer', icon: '🍕' }
    };
    return info[type as keyof typeof info] || { title: type, icon: '📋' };
  };

  const handleTypeToggle = (index: number) => {
    setApplicationTypes(prev => prev.map((type, i) => 
      i === index ? { ...type, enabled: !type.enabled } : type
    ));
  };

  const handleTypeUpdate = (index: number, field: keyof ApplicationType, value: any) => {
    setApplicationTypes(prev => prev.map((type, i) => 
      i === index ? { ...type, [field]: value } : type
    ));
  };

  const handleEmailSettingChange = (field: string, value: string) => {
    setEmailSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settings = {
        applicationTypes: applicationTypes.filter(type => type.enabled),
        emailSettings
      };
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getProgressPercentage = (current: number, max: number) => {
    return max > 0 ? (current / max) * 100 : 0;
  };

  const requiresAgreement = (type: string) => {
    return ['artist', 'piercer', 'trader', 'caterer'].includes(type);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Application Settings</h2>
              <p className="text-gray-300 text-sm">{eventName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { key: 'types', label: 'Application Types', icon: Users },
            { key: 'agreements', label: 'Agreements', icon: FileText },
            { key: 'emails', label: 'Email Templates', icon: Mail }
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
          {/* Application Types Tab */}
          {activeTab === 'types' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Application Types & Limits
              </h3>
              <div className="space-y-4">
                {applicationTypes.map((appType, index) => {
                  const typeInfo = getApplicationTypeInfo(appType.type);
                  const progressPercentage = getProgressPercentage(appType.currentApplications, appType.maxApplications);
                  
                  return (
                    <div key={appType.type} className="bg-white/5 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <div>
                            <h4 className="text-white font-medium">{typeInfo.title}</h4>
                            <p className="text-gray-400 text-sm">
                              {appType.currentApplications} / {appType.maxApplications} applications
                            </p>
                          </div>
                        </div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appType.enabled}
                            onChange={() => handleTypeToggle(index)}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-300 text-sm">Enabled</span>
                        </label>
                      </div>
                      
                      {appType.enabled && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">
                                Maximum Applications
                              </label>
                              <input
                                type="number"
                                value={appType.maxApplications}
                                onChange={(e) => handleTypeUpdate(index, 'maxApplications', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">
                                Payment Required
                              </label>
                              <select
                                value={appType.requiresPayment ? 'yes' : 'no'}
                                onChange={(e) => handleTypeUpdate(index, 'requiresPayment', e.target.value === 'yes')}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </div>
                            
                            {appType.requiresPayment && (
                              <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                  Payment Amount (£)
                                </label>
                                <input
                                  type="number"
                                  value={appType.paymentAmount}
                                  onChange={(e) => handleTypeUpdate(index, 'paymentAmount', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                          
                          {progressPercentage >= 100 && (
                            <p className="text-red-400 text-xs mt-1">Applications limit reached</p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agreements Tab */}
          {activeTab === 'agreements' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Registration Agreements
              </h3>
              
              <div className="space-y-6">
                {applicationTypes
                  .filter(type => type.enabled && requiresAgreement(type.type))
                  .map((appType, index) => {
                    const typeInfo = getApplicationTypeInfo(appType.type);
                    const originalIndex = applicationTypes.findIndex(t => t.type === appType.type);
                    
                    return (
                      <div key={appType.type} className="bg-white/5 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <h4 className="text-white font-medium text-lg">{typeInfo.title} Agreement</h4>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">
                            Agreement Text
                          </label>
                          <textarea
                            value={appType.agreementText}
                            onChange={(e) => handleTypeUpdate(originalIndex, 'agreementText', e.target.value)}
                            rows={12}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter the agreement text that applicants must accept..."
                          />
                        </div>
                        
                        <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-sm">
                            This agreement will be shown to applicants during the registration process. 
                            They must accept these terms before proceeding with payment.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                
                {applicationTypes.filter(type => type.enabled && !requiresAgreement(type.type)).length > 0 && (
                  <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-6">
                    <h4 className="text-gray-300 font-medium mb-2">No Agreement Required</h4>
                    <p className="text-gray-400 text-sm">
                      The following application types do not require registration agreements:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {applicationTypes
                        .filter(type => type.enabled && !requiresAgreement(type.type))
                        .map(type => {
                          const typeInfo = getApplicationTypeInfo(type.type);
                          return (
                            <span key={type.type} className="bg-gray-600/20 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                              <span>{typeInfo.icon}</span>
                              <span>{typeInfo.title}</span>
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Templates
              </h3>
              
              {/* Approval Email */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <h4 className="text-white font-medium mb-3 text-green-400">Approval Email</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={emailSettings.approvalSubject}
                      onChange={(e) => handleEmailSettingChange('approvalSubject', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Message</label>
                    <textarea
                      value={emailSettings.approvalMessage}
                      onChange={(e) => handleEmailSettingChange('approvalMessage', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rejection Email */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 text-red-400">Rejection Email</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={emailSettings.rejectionSubject}
                      onChange={(e) => handleEmailSettingChange('rejectionSubject', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Message</label>
                    <textarea
                      value={emailSettings.rejectionMessage}
                      onChange={(e) => handleEmailSettingChange('rejectionMessage', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Template Variables */}
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <h5 className="text-blue-300 font-medium mb-2">Available Variables</h5>
                <div className="text-blue-200 text-sm space-y-1">
                  <p><code>{'{event_name}'}</code> - Event name</p>
                  <p><code>{'{applicant_name}'}</code> - Applicant's full name</p>
                  <p><code>{'{application_type}'}</code> - Type of application (Artist, Piercer, etc.)</p>
                  <p><code>{'{registration_link}'}</code> - Link to complete registration (approval emails only)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4 p-6 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}