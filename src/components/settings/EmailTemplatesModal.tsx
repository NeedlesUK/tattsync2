import React, { useState, useEffect } from 'react';
import { X, Mail, Save, AlertCircle } from 'lucide-react';

interface EmailTemplate {
  id?: number;
  template_type: string;
  subject: string;
  message: string;
}

interface EmailTemplatesModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (templates: EmailTemplate[]) => void;
}

export function EmailTemplatesModal({ eventId, eventName, isOpen, onClose, onSave }: EmailTemplatesModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      template_type: 'approval',
      subject: 'Application Approved - {{event_name}}',
      message: 'Dear {{applicant_name}},\n\nCongratulations! Your application for {{event_name}} has been approved.\n\nPlease complete your registration using the link below:\n{{registration_link}}\n\nBest regards,\nThe {{event_name}} Team'
    },
    {
      template_type: 'rejection',
      subject: 'Application Update - {{event_name}}',
      message: 'Dear {{applicant_name}},\n\nThank you for your interest in {{event_name}}. Unfortunately, we are unable to approve your application at this time.\n\nWe encourage you to apply for future events.\n\nBest regards,\nThe {{event_name}} Team'
    }
  ]);
  
  const [selectedTemplate, setSelectedTemplate] = useState('approval');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, eventId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the API
      // const response = await fetch(`/api/events/${eventId}/email-templates`);
      // const data = await response.json();
      // setTemplates(data);
    } catch (err) {
      setError('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (field: 'subject' | 'message', value: string) => {
    setTemplates(prev => prev.map(template => 
      template.template_type === selectedTemplate 
        ? { ...template, [field]: value }
        : template
    ));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate templates
      for (const template of templates) {
        if (!template.subject.trim() || !template.message.trim()) {
          throw new Error('All templates must have a subject and message');
        }
      }
      
      await onSave(templates);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save templates');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTemplate = () => {
    return templates.find(t => t.template_type === selectedTemplate) || templates[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Email Templates</h2>
              <p className="text-gray-400 text-sm">{eventName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-slate-900/50 border-r border-white/10 p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Template Types
            </h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.template_type}
                  onClick={() => setSelectedTemplate(template.template_type)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTemplate === template.template_type
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {template.template_type === 'approval' ? 'Approval Email' : 'Rejection Email'}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Available Placeholders</h4>
              <div className="space-y-2 text-xs">
                <div className="text-blue-200">
                  <code>{'{{applicant_name}}'}</code> - Applicant's name
                </div>
                <div className="text-blue-200">
                  <code>{'{{event_name}}'}</code> - Event name
                </div>
                <div className="text-blue-200">
                  <code>{'{{application_type}}'}</code> - Application type
                </div>
                <div className="text-blue-200">
                  <code>{'{{registration_link}}'}</code> - Registration link (approval only)
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-200">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={getCurrentTemplate()?.subject || ''}
                  onChange={(e) => handleTemplateChange('subject', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Message
                </label>
                <textarea
                  value={getCurrentTemplate()?.message || ''}
                  onChange={(e) => handleTemplateChange('message', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Enter email message..."
                />
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Preview</h4>
                <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-300 mb-2">
                    <strong>Subject:</strong> {getCurrentTemplate()?.subject || ''}
                  </div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">
                    {getCurrentTemplate()?.message || ''}
                  </div>
                </div>
              </div>
            </div>
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
            disabled={loading}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Templates'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}