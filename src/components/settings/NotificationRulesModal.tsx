import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Bell, AlertCircle, Check, Calendar, Clock, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationRulesModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: NotificationRule[]) => Promise<void>;
}

export interface NotificationRule {
  id?: number;
  event_id: number;
  rule_type: string;
  rule_name: string;
  trigger_event: string;
  notification_type: 'email' | 'in_app' | 'both';
  is_active: boolean;
  recipients: string[];
  template_id?: number;
  custom_message?: string;
}

export function NotificationRulesModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: NotificationRulesModalProps) {
  const { supabase } = useAuth();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen, eventId]);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, fetch from API
      // For now, use mock data
      const mockRules: NotificationRule[] = [
        {
          id: 1,
          event_id: eventId,
          rule_type: 'application',
          rule_name: 'Application Received',
          trigger_event: 'application_submitted',
          notification_type: 'email',
          is_active: true,
          recipients: ['event_manager'],
          custom_message: 'A new application has been submitted for {{event_name}}.'
        },
        {
          id: 2,
          event_id: eventId,
          rule_type: 'application',
          rule_name: 'Application Approved',
          trigger_event: 'application_approved',
          notification_type: 'both',
          is_active: true,
          recipients: ['applicant'],
          template_id: 1
        },
        {
          id: 3,
          event_id: eventId,
          rule_type: 'registration',
          rule_name: 'Registration Reminder',
          trigger_event: 'registration_deadline_approaching',
          notification_type: 'email',
          is_active: true,
          recipients: ['approved_applicants'],
          custom_message: 'Reminder: Your registration deadline for {{event_name}} is approaching. Please complete your registration by {{deadline_date}}.'
        }
      ];
      
      setRules(mockRules);
      
      // Set the first rule as selected
      if (mockRules.length > 0) {
        setSelectedRuleId(mockRules[0].id?.toString() || null);
      }
    } catch (err) {
      console.error('Exception fetching notification rules:', err);
      setError('Failed to load notification rules');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedRule = () => {
    if (!selectedRuleId) return null;
    return rules.find(rule => rule.id?.toString() === selectedRuleId) || null;
  };

  const updateRule = (ruleId: number | undefined, updates: Partial<NotificationRule>) => {
    if (!ruleId) return;
    
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  };

  const addRule = () => {
    const newRule: NotificationRule = {
      event_id: eventId,
      rule_type: 'application',
      rule_name: 'New Notification Rule',
      trigger_event: 'application_submitted',
      notification_type: 'email',
      is_active: true,
      recipients: ['event_manager'],
      custom_message: ''
    };
    
    const newId = Math.max(0, ...rules.map(r => r.id || 0)) + 1;
    newRule.id = newId;
    
    setRules([...rules, newRule]);
    setSelectedRuleId(newId.toString());
  };

  const removeRule = (ruleId: number | undefined) => {
    if (!ruleId) return;
    
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    
    if (selectedRuleId === ruleId.toString()) {
      const remainingRules = rules.filter(rule => rule.id !== ruleId);
      setSelectedRuleId(remainingRules.length > 0 ? remainingRules[0].id?.toString() || null : null);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate rules
      for (const rule of rules) {
        if (!rule.rule_name.trim()) {
          setError('Rule name is required');
          setIsSaving(false);
          return;
        }
        
        if (rule.notification_type === 'email' && !rule.custom_message && !rule.template_id) {
          setError('Email notifications require either a custom message or a template');
          setIsSaving(false);
          return;
        }
        
        if (rule.recipients.length === 0) {
          setError('At least one recipient is required');
          setIsSaving(false);
          return;
        }
      }
      
      // In a real implementation, save to API
      console.log('Saving notification rules:', rules);
      
      // Call the onSave callback
      await onSave(rules);
      
      setSuccess('Notification rules saved successfully');
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving notification rules:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecipientToggle = (recipient: string) => {
    const selectedRule = getSelectedRule();
    if (!selectedRule) return;
    
    const currentRecipients = [...selectedRule.recipients];
    
    if (currentRecipients.includes(recipient)) {
      updateRule(selectedRule.id, { 
        recipients: currentRecipients.filter(r => r !== recipient) 
      });
    } else {
      updateRule(selectedRule.id, { 
        recipients: [...currentRecipients, recipient] 
      });
    }
  };

  if (!isOpen) return null;

  const selectedRule = getSelectedRule();
  
  const recipientOptions = [
    { value: 'event_manager', label: 'Event Manager' },
    { value: 'applicant', label: 'Applicant' },
    { value: 'approved_applicants', label: 'Approved Applicants' },
    { value: 'all_applicants', label: 'All Applicants' },
    { value: 'all_attendees', label: 'All Attendees' }
  ];
  
  const triggerEvents = [
    { value: 'application_submitted', label: 'Application Submitted' },
    { value: 'application_approved', label: 'Application Approved' },
    { value: 'application_rejected', label: 'Application Rejected' },
    { value: 'registration_completed', label: 'Registration Completed' },
    { value: 'registration_deadline_approaching', label: 'Registration Deadline Approaching' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'payment_failed', label: 'Payment Failed' },
    { value: 'event_reminder', label: 'Event Reminder' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Notification Rules</h2>
            <p className="text-gray-300 text-sm">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Left sidebar - Rules list */}
          <div className="w-1/3 border-r border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <button
                onClick={addRule}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule</span>
              </button>
            </div>
            
            <div className="divide-y divide-white/10">
              {rules.map((rule) => {
                const isActive = selectedRuleId === rule.id?.toString();
                
                return (
                  <div 
                    key={rule.id} 
                    className={`p-4 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-purple-600/20'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedRuleId(rule.id?.toString() || null)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-5 h-5 text-purple-400" />
                        <h4 className="text-white font-medium">{rule.rule_name}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!rule.is_active && (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span className="capitalize">{rule.rule_type}</span>
                      <span>•</span>
                      <span className="capitalize">{rule.notification_type}</span>
                    </div>
                  </div>
                );
              })}
              
              {rules.length === 0 && (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300">No notification rules yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click the button above to add your first rule</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Rule editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : selectedRule ? (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Edit Notification Rule</h3>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRule.is_active}
                        onChange={(e) => updateRule(selectedRule.id, { is_active: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300">Active</span>
                    </label>
                    <button
                      onClick={() => removeRule(selectedRule.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={selectedRule.rule_name}
                    onChange={(e) => updateRule(selectedRule.id, { rule_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter rule name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rule Type
                    </label>
                    <select
                      value={selectedRule.rule_type}
                      onChange={(e) => updateRule(selectedRule.id, { rule_type: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="application" className="bg-gray-800">Application</option>
                      <option value="registration" className="bg-gray-800">Registration</option>
                      <option value="payment" className="bg-gray-800">Payment</option>
                      <option value="event" className="bg-gray-800">Event</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trigger Event
                    </label>
                    <select
                      value={selectedRule.trigger_event}
                      onChange={(e) => updateRule(selectedRule.id, { trigger_event: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {triggerEvents.map(event => (
                        <option key={event.value} value={event.value} className="bg-gray-800">
                          {event.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notification Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={selectedRule.notification_type === 'email'}
                        onChange={() => updateRule(selectedRule.id, { notification_type: 'email' })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Email</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={selectedRule.notification_type === 'in_app'}
                        onChange={() => updateRule(selectedRule.id, { notification_type: 'in_app' })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-1">
                        <Bell className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">In-App</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={selectedRule.notification_type === 'both'}
                        onChange={() => updateRule(selectedRule.id, { notification_type: 'both' })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Both</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipients
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {recipientOptions.map(option => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRule.recipients.includes(option.value)}
                          onChange={() => handleRecipientToggle(option.value)}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <span className="text-gray-300">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {(selectedRule.notification_type === 'email' || selectedRule.notification_type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Content
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!selectedRule.template_id}
                            onChange={() => updateRule(selectedRule.id, { template_id: undefined })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-300">Custom Message</span>
                        </label>
                        
                        {!selectedRule.template_id && (
                          <textarea
                            value={selectedRule.custom_message || ''}
                            onChange={(e) => updateRule(selectedRule.id, { custom_message: e.target.value })}
                            rows={5}
                            className="w-full mt-2 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter custom message"
                          />
                        )}
                      </div>
                      
                      <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!!selectedRule.template_id}
                            onChange={() => updateRule(selectedRule.id, { template_id: 1, custom_message: undefined })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-300">Use Email Template</span>
                        </label>
                        
                        {selectedRule.template_id && (
                          <select
                            value={selectedRule.template_id}
                            onChange={(e) => updateRule(selectedRule.id, { template_id: parseInt(e.target.value) })}
                            className="w-full mt-2 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="1" className="bg-gray-800">Approval Email Template</option>
                            <option value="2" className="bg-gray-800">Rejection Email Template</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">Available Placeholders</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-blue-200 text-sm">
                      <code>{{'{{'}}applicant_name{{'}}'}}</code> - Applicant's name
                    </div>
                    <div className="text-blue-200 text-sm">
                      <code>{{'{{'}}event_name{{'}}'}}</code> - Event name
                    </div>
                    <div className="text-blue-200 text-sm">
                      <code>{{'{{'}}application_type{{'}}'}}</code> - Application type
                    </div>
                    <div className="text-blue-200 text-sm">
                      <code>{{'{{'}}deadline_date{{'}}'}}</code> - Deadline date
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a rule</h3>
                  <p className="text-gray-400">
                    Choose a notification rule from the sidebar to edit
                  </p>
                </div>
              </div>
            )}
          </div>
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
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Rules'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}