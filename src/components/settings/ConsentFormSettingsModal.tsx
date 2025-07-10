import React, { useState, useEffect } from 'react';
import { X, Save, Heart, AlertCircle, Check, ToggleLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ConsentFormSettingsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ConsentFormSettings) => Promise<void>;
}

export interface ConsentFormSettings {
  id?: number;
  event_id: number;
  consent_forms_enabled: boolean;
}

export function ConsentFormSettingsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: ConsentFormSettingsModalProps) {
  const { supabase } = useAuth();
  const [settings, setSettings] = useState<ConsentFormSettings>({
    event_id: eventId,
    consent_forms_enabled: false
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
              consent_forms_enabled: false
            });
          } else {
            throw error;
          }
        }
        
        if (data) {
          console.log('Fetched event modules:', data);
          setSettings({
            event_id: eventId,
            consent_forms_enabled: data.consent_forms_enabled || false
          });
        }
      } else {
        // Mock data when Supabase is not available
        console.log('Supabase not available, using default settings');
        setSettings({
          event_id: eventId,
          consent_forms_enabled: false
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
            consent_forms_enabled: settings.consent_forms_enabled,
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error updating event modules:', error);
          throw error;
        }
        
        setSuccess('Consent form settings saved successfully');
      }
      
      // Call the onSave callback
      await onSave(settings);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving consent forms:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Consent Form Settings</h2>
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
                      <Heart className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Consent Forms</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.consent_forms_enabled} 
                      onChange={(e) => setSettings(prev => ({ ...prev, consent_forms_enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-300">
                    {settings.consent_forms_enabled 
                      ? 'Consent forms are enabled for this event. Artists and clients can use the consent form system.'
                      : 'Consent forms are disabled for this event.'}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  When enabled, the consent form system allows artists to create and manage consent forms for their clients.
                  Clients can fill out forms digitally, and both parties receive a copy via email.
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