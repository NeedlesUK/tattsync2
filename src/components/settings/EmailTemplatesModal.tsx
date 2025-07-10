import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Mail, Edit, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface EmailTemplatesModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (templates: EmailTemplate[]) => Promise<void>;
}

export interface EmailTemplate {
  id?: number;
  event_id: number;
  template_type: 'approval' | 'rejection';
  subject: string;
  message: string;
}

export function EmailTemplatesModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: EmailTemplatesModalProps) {
  const { supabase } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, eventId]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('event_id', eventId);
          
        if (error) {
          console.error('Error fetching email templates:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('Fetched email templates:', data);
          setTemplates(data);
          
          // Set the first type as selected
          if (data.length > 0 && !selectedType) {
            setSelectedType(data[0].template_type);
          }
        } else {
          // Create default templates
          const defaultTemplates = [
            {
              event_id: eventId,
              template_type: 'approval',
              subject: 'Your application has been approved!',
              message: `Dear {{applicant_name}},

We are pleased to inform you that your application to participate in {{event_name}} as a {{application_type}} has been approved!

Please complete your registration by clicking the link below:
{{registration_link}}

This link will expire in 7 days. After completing your registration, you will be able to access your profile and update your information.

If you have any questions, please don't hesitate to contact us.

Best regards,
The {{event_name}} Team`
            },
            {
              event_id: eventId,
              template_type: 'rejection',
              subject: 'Regarding your application',
              message: `Dear {{applicant_name}},

Thank you for your interest in participating in {{event_name}} as a {{application_type}}.

After careful consideration, we regret to inform you that we are unable to accept your application at this time. Due to the high volume of applications we receive, we unfortunately cannot accommodate everyone.

We appreciate your interest and encourage you to apply for future events.

Best regards,
The {{event_name}} Team`
            }
          ];
          
          console.log('Created default email templates:', defaultTemplates);
          setTemplates(defaultTemplates);
          
          // Set the first type as selected
          setSelectedType('approval');
        }
      } else {
        // Mock data for when Supabase is not available
        const mockTemplates = [
          {
            event_id: eventId,
            template_type: 'approval',
            subject: 'Your application has been approved!',
            message: `Dear {{applicant_name}},

We are pleased to inform you that your application to participate in {{event_name}} as a {{application_type}} has been approved!

Please complete your registration by clicking the link below:
{{registration_link}}

This link will expire in 7 days. After completing your registration, you will be able to access your profile and update your information.

If you have any questions, please don't hesitate to contact us.

Best regards,
The {{event_name}} Team`
          },
          {
            event_id: eventId,
            template_type: 'rejection',
            subject: 'Regarding your application',
            message: `Dear {{applicant_name}},

Thank you for your interest in participating in {{event_name}} as a {{application_type}}.

After careful consideration, we regret to inform you that we are unable to accept your application at this time. Due to the high volume of applications we receive, we unfortunately cannot accommodate everyone.

We appreciate your interest and encourage you to apply for future events.

Best regards,
The {{event_name}} Team`
          }
        ];
        
        setTemplates(mockTemplates);
        setSelectedType('approval');
      }
    } catch (err) {
      console.error('Exception fetching email templates:', err);
      setError('Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t.template_type === selectedType) || null;
  };

  const updateTemplate = (type: string, updates: Partial<EmailTemplate>) => {
    setTemplates(prev => 
      prev.map(template => 
        template.template_type === type ? { ...template, ...updates } : template
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate templates
      for (const template of templates) {
        if (!template.subject.trim()) {
          setError('Email subject is required');
          setIsSaving(false);
          return;
        }
        
        if (!template.message.trim()) {
          setError('Email message is required');
          setIsSaving(false);
          return;
        }
      }
      
      // Save to database if using Supabase
      if (supabase) {
        for (const template of templates) {
          const { error } = await supabase
            .from('email_templates')
            .upsert({
              id: template.id,
              event_id: eventId,
              template_type: template.template_type,
              subject: template.subject,
              message: template.message,
              updated_at: new Date().toISOString()
            });
            
          if (error) {
            console.error('Error saving email template:', error);
            throw error;
          }
        }
        
        setSuccess('Email templates saved successfully');
      }
      
      // Call the onSave callback
      await onSave(templates);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving email templates:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedTemplate = getSelectedTemplate();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Email Templates</h2>
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
          {/* Left sidebar - Template types */}
          <div className="w-1/3 border-r border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Template Types</h3>
            </div>
            
            <div className="divide-y divide-white/10">
              {templates.map((template) => {
                const isActive = selectedType === template.template_type;
                
                return (
                  <div 
                    key={template.template_type} 
                    className={`p-4 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-purple-600/20'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedType(template.template_type)}
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-white font-medium capitalize">
                          {template.template_type === 'approval' ? 'Approval Email' : 'Rejection Email'}
                        </h4>
                        <p className="text-gray-400 text-xs truncate">{template.subject}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right side - Template editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : selectedTemplate ? (
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.subject}
                    onChange={(e) => updateTemplate(selectedType!, { subject: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Message
                  </label>
                  <textarea
                    value={selectedTemplate.message}
                    onChange={(e) => updateTemplate(selectedType!, { message: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="Enter email message"
                  />
                </div>
                
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
                      <code>{{'{{'}}registration_link{{'}}'}}</code> - Registration link
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a template</h3>
                  <p className="text-gray-400">
                    Choose a template type from the sidebar to edit
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
            <span>{isSaving ? 'Saving...' : 'Save Templates'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}