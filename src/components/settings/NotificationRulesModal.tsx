import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Mail, Bell, Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  triggerEvent: string;
  notificationType: string;
  recipients: string[];
  customMessage?: string;
  emailTemplate?: string;
  isActive: boolean;
}

interface NotificationRulesModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: NotificationRule[]) => void;
}

export function NotificationRulesModal({ eventId, eventName, isOpen, onClose, onSave }: NotificationRulesModalProps) {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerEvents = [
    { value: 'application_submitted', label: 'Application Submitted' },
    { value: 'application_approved', label: 'Application Approved' },
    { value: 'application_rejected', label: 'Application Rejected' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'profile_deadline_reminder', label: 'Profile Deadline Reminder' },
    { value: 'event_reminder', label: 'Event Reminder' },
    { value: 'booking_confirmed', label: 'Booking Confirmed' },
    { value: 'booking_cancelled', label: 'Booking Cancelled' }
  ];

  const notificationTypes = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'in_app', label: 'In-App Notification', icon: Bell },
    { value: 'both', label: 'Email + In-App', icon: Users }
  ];

  const recipientOptions = [
    { value: 'applicant', label: 'Applicant' },
    { value: 'event_manager', label: 'Event Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'all_attendees', label: 'All Attendees' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadNotificationRules();
    }
  }, [isOpen, eventId]);

  const loadNotificationRules = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockRules: NotificationRule[] = [
        {
          id: '1',
          name: 'Application Approval',
          triggerEvent: 'application_approved',
          notificationType: 'email',
          recipients: ['applicant'],
          emailTemplate: 'approval',
          isActive: true
        },
        {
          id: '2',
          name: 'Payment Reminder',
          triggerEvent: 'profile_deadline_reminder',
          notificationType: 'both',
          recipients: ['applicant'],
          customMessage: 'Don\'t forget to complete your profile!',
          isActive: true
        }
      ];
      setRules(mockRules);
      if (mockRules.length > 0 && !selectedRuleId) {
        setSelectedRuleId(mockRules[0].id);
      }
    } catch (err) {
      setError('Failed to load notification rules');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRule = rules.find(rule => rule.id === selectedRuleId);

  const addNewRule = () => {
    const newRule: NotificationRule = {
      id: Date.now().toString(),
      name: 'New Notification Rule',
      triggerEvent: 'application_submitted',
      notificationType: 'email',
      recipients: ['applicant'],
      isActive: true
    };
    setRules([...rules, newRule]);
    setSelectedRuleId(newRule.id);
  };

  const updateRule = (updates: Partial<NotificationRule>) => {
    if (!selectedRuleId) return;
    
    setRules(rules.map(rule => 
      rule.id === selectedRuleId 
        ? { ...rule, ...updates }
        : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
    if (selectedRuleId === ruleId) {
      const remainingRules = rules.filter(rule => rule.id !== ruleId);
      setSelectedRuleId(remainingRules.length > 0 ? remainingRules[0].id : null);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(rules);
      onClose();
    } catch (err) {
      setError('Failed to save notification rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipientChange = (recipient: string, checked: boolean) => {
    if (!selectedRule) return;
    
    const newRecipients = checked
      ? [...selectedRule.recipients, recipient]
      : selectedRule.recipients.filter(r => r !== recipient);
    
    updateRule({ recipients: newRecipients });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Notification Rules</h2>
            <p className="text-gray-400 text-sm mt-1">Manage automated notifications for {eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-white/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Rules</h3>
              <button
                onClick={addNewRule}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRuleId === rule.id
                      ? 'bg-purple-600/20 border-purple-500/50'
                      : 'bg-slate-700/50 border-white/10 hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedRuleId(rule.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{rule.name}</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {triggerEvents.find(e => e.value === rule.triggerEvent)?.label}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRule(rule.id);
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedRule ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Rule Configuration</h3>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedRule.isActive}
                      onChange={(e) => updateRule({ isActive: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-300 text-sm">Active</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      value={selectedRule.name}
                      onChange={(e) => updateRule({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter rule name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trigger Event
                    </label>
                    <select
                      value={selectedRule.triggerEvent}
                      onChange={(e) => updateRule({ triggerEvent: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {triggerEvents.map((event) => (
                        <option key={event.value} value={event.value}>
                          {event.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notification Type
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {notificationTypes.map((type) => (
                        <label key={type.value} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg border border-white/10 cursor-pointer hover:bg-slate-700">
                          <input
                            type="radio"
                            name="notificationType"
                            value={type.value}
                            checked={selectedRule.notificationType === type.value}
                            onChange={(e) => updateRule({ notificationType: e.target.value })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <type.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Recipients
                    </label>
                    <div className="space-y-2">
                      {recipientOptions.map((recipient) => (
                        <label key={recipient.value} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg border border-white/10 cursor-pointer hover:bg-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedRule.recipients.includes(recipient.value)}
                            onChange={(e) => handleRecipientChange(recipient.value, e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-300 text-sm">{recipient.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message Configuration
                  </label>
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="messageType"
                          checked={!!selectedRule.emailTemplate}
                          onChange={() => updateRule({ emailTemplate: 'approval', customMessage: undefined })}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-300 text-sm">Use Email Template</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="messageType"
                          checked={!!selectedRule.customMessage}
                          onChange={() => updateRule({ customMessage: '', emailTemplate: undefined })}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-300 text-sm">Custom Message</span>
                      </label>
                    </div>

                    {selectedRule.emailTemplate && (
                      <select
                        value={selectedRule.emailTemplate}
                        onChange={(e) => updateRule({ emailTemplate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="approval">Approval Template</option>
                        <option value="rejection">Rejection Template</option>
                      </select>
                    )}

                    {selectedRule.customMessage !== undefined && (
                      <textarea
                        value={selectedRule.customMessage}
                        onChange={(e) => updateRule({ customMessage: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your custom message..."
                      />
                    )}
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Available Placeholders</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Use these placeholders in your custom messages:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-blue-200 text-sm">
                      <code>{'{{applicant_name}}'}</code> - Applicant's name
                    </div>
                    <div className="text-blue-200 text-sm">
                      <code>{'{{event_name}}'}</code> - Event name
                    </div>
                    <div className="text-blue-200 text-sm">
                      <code>{'{{application_type}}'}</code> - Application type
                    </div>
                    <div className="text-blue-200 text-sm">
                      <code>{'{{registration_link}}'}</code> - Registration link
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No Rule Selected</h3>
                  <p className="text-gray-400">Select a rule from the sidebar to configure it</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Save Rules</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}