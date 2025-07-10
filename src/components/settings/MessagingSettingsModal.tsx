import React, { useState, useEffect } from 'react';
import { X, Save, MessageCircle, Bell, Mail, Check, AlertCircle, Users, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MessagingSettingsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: MessagingSettings) => Promise<void>;
}

export interface MessagingSettings {
  id?: number;
  event_id: number;
  messaging_enabled: boolean;
  allow_client_messaging: boolean;
  allow_participant_messaging: boolean;
  allow_group_messaging: boolean;
  moderation_enabled: boolean;
  notification_emails_enabled: boolean;
  auto_response_enabled: boolean;
  auto_response_text: string;
}

export function MessagingSettingsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: MessagingSettingsModalProps) {
  const { supabase } = useAuth();
  const [settings, setSettings] = useState<MessagingSettings>({
    event_id: eventId,
    messaging_enabled: true,
    allow_client_messaging: false, // Clients can never message each other
    allow_participant_messaging: true, // Artists, piercers, etc. can message each other
    allow_group_messaging: true, // Event managers can message groups
    moderation_enabled: false,
    notification_emails_enabled: true,
    auto_response_enabled: false,
    auto_response_text: 'Thank you for your message. We will get back to you as soon as possible.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, eventId]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        // Fetch event modules
        const { data, error } = await supabase
          .from('event_modules')
          .select('*')
          .eq('event_id', eventId)
          .single();
          
        if (error) {
          console.error('Error fetching event modules:', error);
          // If no record exists, we'll create one
          if (error.code === 'PGRST116') {
            setSettings({
              event_id: eventId,
              messaging_enabled: true,
              allow_attendee_messaging: true,
              allow_artist_messaging: true,
              moderation_enabled: false,
              notification_emails_enabled: true,
              auto_response_enabled: false,
              auto_response_text: 'Thank you for your message. We will get back to you as soon as possible.'
            });
          } else {
            throw error;
          }
        }
        
        if (data) {
          console.log('Fetched event modules:', data);
          setSettings({
            event_id: eventId,
            messaging_enabled: data.messaging_enabled !== undefined ? data.messaging_enabled : true,
            allow_client_messaging: false, // Clients can never message each other
            allow_participant_messaging: data.allow_participant_messaging !== undefined ? data.allow_participant_messaging : true,
            allow_group_messaging: data.allow_group_messaging !== undefined ? data.allow_group_messaging : true,
            moderation_enabled: data.moderation_enabled !== undefined ? data.moderation_enabled : false,
            notification_emails_enabled: data.notification_emails_enabled !== undefined ? data.notification_emails_enabled : true,
            auto_response_enabled: data.auto_response_enabled !== undefined ? data.auto_response_enabled : false,
            auto_response_text: data.auto_response_text || 'Thank you for your message. We will get back to you as soon as possible.'
          });
        }
      } else {
        // Mock data when Supabase is not available
        console.log('Supabase not available, using default settings');
        setSettings({
          event_id: eventId,
          messaging_enabled: true,
          allow_client_messaging: false, // Clients can never message each other
          allow_participant_messaging: true, // Artists, piercers, etc. can message each other
          allow_group_messaging: true, // Event managers can message groups
          moderation_enabled: false,
          notification_emails_enabled: true,
          auto_response_enabled: false,
          auto_response_text: 'Thank you for your message. We will get back to you as soon as possible.'
        });
      }
    } catch (err) {
      console.error('Exception fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Save to database if using Supabase
      if (supabase) {
        // Update event modules
        const { error } = await supabase
          .from('event_modules')
          .upsert({
            event_id: eventId,
            messaging_enabled: settings.messaging_enabled,
            allow_client_messaging: false, // Always false, clients can never message each other
            allow_participant_messaging: settings.allow_participant_messaging,
            allow_group_messaging: settings.allow_group_messaging,
            moderation_enabled: settings.moderation_enabled,
            notification_emails_enabled: settings.notification_emails_enabled,
            auto_response_enabled: settings.auto_response_enabled,
            auto_response_text: settings.auto_response_text,
            updated_at: new Date().toISOString()
          }, { onConflict: 'event_id' });
          
        if (error) {
          console.error('Error updating messaging settings:', error);
          throw error;
        }
        
        setSuccess('Messaging settings saved successfully');
      }
      
      // Call the onSave callback
      await onSave(settings);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving messaging settings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Messaging Settings</h2>
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
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
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
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Messaging</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.messaging_enabled} 
                      onChange={(e) => setSettings(prev => ({ ...prev, messaging_enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-300">
                    {settings.messaging_enabled 
                      ? 'Messaging is enabled for this event. Participants can communicate with each other and event staff.'
                      : 'Messaging is disabled for this event.'}
                  </p>
                </div>
              </div>
              
              {settings.messaging_enabled && (
                <>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Messaging Permissions</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-red-400" />
                          <span className="text-gray-300">Allow Client-to-Client Messaging</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                          <input 
                            type="checkbox" 
                            checked={false}
                            disabled={true}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <p className="text-red-300 text-sm">
                          Client-to-client messaging is permanently disabled to prevent potential abuse.
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">Allow Participant-to-Participant Messaging</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.allow_participant_messaging} 
                            onChange={(e) => setSettings(prev => ({ ...prev, allow_participant_messaging: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">Allow Group Messaging</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.allow_group_messaging} 
                            onChange={(e) => setSettings(prev => ({ ...prev, allow_group_messaging: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Settings className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">Enable Message Moderation</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.moderation_enabled} 
                            onChange={(e) => setSettings(prev => ({ ...prev, moderation_enabled: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                    <h4 className="text-blue-300 font-medium mb-2">Messaging Permissions Explained</h4>
                    <ul className="text-blue-200 text-sm space-y-2">
                      <li>• <strong>Client-to-Client Messaging:</strong> Always disabled to prevent potential abuse.</li>
                      <li>• <strong>Participant-to-Participant Messaging:</strong> Allows artists, piercers, and other event participants to message each other.</li>
                      <li>• <strong>Group Messaging:</strong> Allows event managers to send messages to groups (e.g., all artists, all piercers).</li>
                      <li>• <strong>Message Moderation:</strong> When enabled, messages are reviewed before being delivered.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">Send Email Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notification_emails_enabled} 
                            onChange={(e) => setSettings(prev => ({ ...prev, notification_emails_enabled: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">Enable Auto-Response</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.auto_response_enabled} 
                            onChange={(e) => setSettings(prev => ({ ...prev, auto_response_enabled: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      
                      {settings.auto_response_enabled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Auto-Response Message
                          </label>
                          <textarea
                            value={settings.auto_response_text}
                            onChange={(e) => setSettings(prev => ({ ...prev, auto_response_text: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter auto-response message"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  The messaging system allows participants to communicate with each other and event staff.
                  You can control who can message whom, enable moderation, and configure notification settings.
                </p>
              </div>
            </>
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
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
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