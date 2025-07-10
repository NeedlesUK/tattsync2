import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, FileText, Heart, Settings, AlertCircle, Check, QrCode, Copy } from 'lucide-react';
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
  forms: ConsentForm[];
}

export interface ConsentForm {
  id?: number;
  title: string;
  description: string;
  is_active: boolean;
  requires_medical_history: boolean;
  qr_code?: string;
  expires_at?: string | null;
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
    forms: []
  });
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCodeExpiry, setQrCodeExpiry] = useState<number>(24); // Default 24 hours

  useEffect(() => {
    if (isOpen) {
      fetchConsentForms();
    }
  }, [isOpen, eventId]);

  const fetchConsentForms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        // Fetch consent forms
        const { data, error } = await supabase
          .from('consent_forms')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching consent forms:', error);
          throw error;
        }
        
        if (data) {
          console.log('Fetched consent forms:', data);
          setSettings({
            event_id: eventId,
            forms: data
          });
          
          // Set the first form as selected if there are forms
          if (data.length > 0) {
            setSelectedFormId(data[0].id);
          }
        } else {
          // No forms found, use defaults
          console.log('No consent forms found, using defaults');
          setSettings({
            event_id: eventId,
            forms: [
              {
                title: 'Tattoo Consent Form',
                description: 'Medical history and consent form for tattoo procedures',
                is_active: true,
                requires_medical_history: true
              },
              {
                title: 'Piercing Consent Form',
                description: 'Medical history and consent form for piercing procedures',
                is_active: true,
                requires_medical_history: true
              }
            ]
          });
        }
      } else {
        // Mock data for when Supabase is not available
        console.log('Supabase not available, using default consent forms');
        setSettings({
          event_id: eventId,
          forms: [
            {
              id: 1,
              title: 'Tattoo Consent Form',
              description: 'Medical history and consent form for tattoo procedures',
              is_active: true,
              requires_medical_history: true
            },
            {
              id: 2,
              title: 'Piercing Consent Form',
              description: 'Medical history and consent form for piercing procedures',
              is_active: true,
              requires_medical_history: true
            }
          ]
        });
        
        // Set the first form as selected
        setSelectedFormId(1);
      }
    } catch (err) {
      console.error('Exception fetching consent forms:', err);
      setError('Failed to load consent forms');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedForm = () => {
    return settings.forms.find(form => form.id === selectedFormId) || null;
  };

  const updateForm = (id: number | undefined, updates: Partial<ConsentForm>) => {
    setSettings(prev => ({
      ...prev,
      forms: prev.forms.map(form => 
        form.id === id ? { ...form, ...updates } : form
      )
    }));
  };

  const addForm = () => {
    const newForm: ConsentForm = {
      title: 'New Consent Form',
      description: '',
      is_active: true,
      requires_medical_history: false
    };
    
    setSettings(prev => ({
      ...prev,
      forms: [...prev.forms, newForm]
    }));
    
    // Select the new form
    setSelectedFormId(null);
  };

  const removeForm = (id: number | undefined) => {
    if (!id) return;
    
    setSettings(prev => ({
      ...prev,
      forms: prev.forms.filter(form => form.id !== id)
    }));
    
    // If the removed form was selected, select the first form
    if (selectedFormId === id) {
      const remainingForms = settings.forms.filter(form => form.id !== id);
      setSelectedFormId(remainingForms.length > 0 ? remainingForms[0].id : null);
    }
  };

  const generateQrCode = async (formId: number | undefined) => {
    if (!formId || !supabase) return;
    
    try {
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + qrCodeExpiry);
      
      // Create QR code in database
      const { data, error } = await supabase
        .from('consent_qr_codes')
        .insert({
          event_id: eventId,
          form_id: formId,
          expires_at: expiresAt.toISOString(),
          created_by: supabase.auth.getUser().then(res => res.data.user?.id)
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error generating QR code:', error);
        throw error;
      }
      
      // Update the form with the QR code
      updateForm(formId, { 
        qr_code: `${window.location.origin}/consent/${data.code}`,
        expires_at: data.expires_at
      });
      
      setSuccess('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
    }
  };

  const copyQrCodeUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSuccess('QR code URL copied to clipboard!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate settings
      if (settings.forms.length === 0) {
        setError('At least one consent form is required');
        setIsSaving(false);
        return;
      }
      
      for (const form of settings.forms) {
        if (!form.title) {
          setError('All forms must have a title');
          setIsSaving(false);
          return;
        }
      }
      
      // Save to database if using Supabase
      if (supabase) {
        // First, handle existing forms (update or delete)
        const existingFormIds = settings.forms
          .filter(form => form.id)
          .map(form => form.id);
        
        // Delete forms that are no longer in the settings
        const { error: deleteError } = await supabase
          .from('consent_forms')
          .delete()
          .eq('event_id', eventId)
          .not('id', 'in', `(${existingFormIds.join(',')})`);
          
        if (deleteError && existingFormIds.length > 0) {
          console.error('Error deleting removed consent forms:', deleteError);
          throw deleteError;
        }
        
        // Update or insert forms
        for (const form of settings.forms) {
          const formData = {
            event_id: eventId,
            title: form.title,
            description: form.description,
            is_active: form.is_active,
            requires_medical_history: form.requires_medical_history,
            updated_at: new Date().toISOString()
          };
          
          if (form.id) {
            // Update existing form
            const { error: updateError } = await supabase
              .from('consent_forms')
              .update(formData)
              .eq('id', form.id);
              
            if (updateError) {
              console.error('Error updating consent form:', updateError);
              throw updateError;
            }
          } else {
            // Insert new form
            const { error: insertError } = await supabase
              .from('consent_forms')
              .insert({
                ...formData,
                created_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('Error inserting consent form:', insertError);
              throw insertError;
            }
          }
        }
        
        setSuccess('Consent forms saved successfully');
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

  const selectedForm = getSelectedForm();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
        <div className="flex h-[calc(90vh-200px)]">
          {/* Left sidebar - Forms list */}
          <div className="w-1/3 border-r border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <button
                onClick={addForm}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Consent Form</span>
              </button>
            </div>
            
            <div className="divide-y divide-white/10">
              {settings.forms.map((form) => (
                <div 
                  key={form.id || form.title} 
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedFormId === form.id
                      ? 'bg-purple-600/20'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedFormId(form.id || null)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium">{form.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      form.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{form.description}</p>
                </div>
              ))}
              
              {settings.forms.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300">No consent forms yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click the button above to add your first form</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Form editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : selectedForm ? (
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
                  <h3 className="text-lg font-semibold text-white">
                    Edit Consent Form
                  </h3>
                  <button
                    onClick={() => removeForm(selectedForm.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Form Title
                  </label>
                  <input
                    type="text"
                    value={selectedForm.title}
                    onChange={(e) => updateForm(selectedForm.id, { title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Tattoo Consent Form"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={selectedForm.description}
                    onChange={(e) => updateForm(selectedForm.id, { description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe the purpose of this consent form"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedForm.is_active}
                      onChange={(e) => updateForm(selectedForm.id, { is_active: e.target.checked })}
                      className="text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <span className="text-gray-300">Active</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedForm.requires_medical_history}
                      onChange={(e) => updateForm(selectedForm.id, { requires_medical_history: e.target.checked })}
                      className="text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <span className="text-gray-300">Requires Medical History</span>
                  </label>
                </div>
                
                {/* QR Code Section */}
                {selectedForm.id && (
                  <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3 mb-4">
                      <QrCode className="w-6 h-6 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">QR Code</h3>
                    </div>
                    
                    {selectedForm.qr_code ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-white p-4 rounded-lg">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedForm.qr_code)}`}
                              alt="QR Code"
                              className="w-40 h-40"
                            />
                          </div>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-sm">QR Code URL</span>
                            <button
                              onClick={() => copyQrCodeUrl(selectedForm.qr_code!)}
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-white text-sm break-all">{selectedForm.qr_code}</p>
                        </div>
                        
                        {selectedForm.expires_at && (
                          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-yellow-300 text-sm">
                              This QR code expires on {new Date(selectedForm.expires_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => generateQrCode(selectedForm.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Generate New QR Code
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-300 mb-4">
                          Generate a QR code that clients can scan to access this consent form.
                          The QR code can be printed and displayed at your event.
                        </p>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Expires After (hours)
                            </label>
                            <input
                              type="number"
                              value={qrCodeExpiry}
                              onChange={(e) => setQrCodeExpiry(parseInt(e.target.value) || 24)}
                              min="1"
                              max="720" // 30 days
                              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                            />
                          </div>
                          <button
                            onClick={() => generateQrCode(selectedForm.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors h-[42px] mt-8"
                          >
                            Generate QR Code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Form Builder Link */}
                <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <h4 className="text-blue-300 font-medium">Form Builder</h4>
                  </div>
                  <p className="text-blue-200 text-sm mb-3">
                    Use the Form Builder to create and customize the fields and sections in this consent form.
                  </p>
                  <button
                    onClick={() => {
                      // In a real implementation, this would navigate to the form builder
                      alert('This would open the Form Builder for this consent form');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Open Form Builder
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a form</h3>
                  <p className="text-gray-400">
                    Choose a consent form from the sidebar or create a new one
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
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}