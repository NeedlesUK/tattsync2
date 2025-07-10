import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, FileText, Users, Settings, AlertCircle, Check, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ApplicationSettingsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ApplicationSettings) => Promise<void>;
}

export interface ApplicationType {
  type: string;
  label: string;
  description: string;
  enabled: boolean;
  max_applications: number;
  form_fields: FormField[];
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ApplicationSettings {
  id?: number;
  event_id: number;
  application_types: ApplicationType[];
}

export function ApplicationSettingsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: ApplicationSettingsModalProps) {
  const { supabase } = useAuth();
  const [settings, setSettings] = useState<ApplicationSettings>({
    event_id: eventId,
    application_types: []
  });
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingField, setIsEditingField] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const defaultApplicationTypes = [
    {
      type: 'artist',
      label: 'Tattoo Artist',
      description: 'Tattoo artists who will be working at the event',
      enabled: true,
      max_applications: 100,
      form_fields: [
        {
          id: 'artist_1',
          name: 'studio_name',
          label: 'Studio Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your studio name'
        },
        {
          id: 'artist_2',
          name: 'experience_years',
          label: 'Years of Experience',
          type: 'select',
          required: true,
          options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'More than 10 years']
        },
        {
          id: 'artist_3',
          name: 'portfolio_url',
          label: 'Portfolio URL',
          type: 'text',
          required: true,
          placeholder: 'https://your-portfolio.com'
        },
        {
          id: 'artist_4',
          name: 'styles',
          label: 'Tattoo Styles',
          type: 'checkbox',
          required: true,
          options: ['Traditional', 'Neo-Traditional', 'Japanese', 'Realism', 'Black & Grey', 'Watercolor', 'Tribal', 'Blackwork', 'Other']
        },
        {
          id: 'artist_5',
          name: 'additional_info',
          label: 'Additional Information',
          type: 'textarea',
          required: false,
          placeholder: 'Any additional information you would like to provide'
        }
      ]
    },
    {
      type: 'piercer',
      label: 'Piercer',
      description: 'Piercers who will be working at the event',
      enabled: true,
      max_applications: 50,
      form_fields: [
        {
          id: 'piercer_1',
          name: 'studio_name',
          label: 'Studio Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your studio name'
        },
        {
          id: 'piercer_2',
          name: 'experience_years',
          label: 'Years of Experience',
          type: 'select',
          required: true,
          options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'More than 10 years']
        },
        {
          id: 'piercer_3',
          name: 'certifications',
          label: 'Certifications',
          type: 'text',
          required: false,
          placeholder: 'List any relevant certifications'
        },
        {
          id: 'piercer_4',
          name: 'piercing_types',
          label: 'Piercing Types',
          type: 'checkbox',
          required: true,
          options: ['Ear', 'Nose', 'Lip', 'Eyebrow', 'Tongue', 'Navel', 'Dermal', 'Genital', 'Other']
        },
        {
          id: 'piercer_5',
          name: 'additional_info',
          label: 'Additional Information',
          type: 'textarea',
          required: false,
          placeholder: 'Any additional information you would like to provide'
        }
      ]
    },
    {
      type: 'trader',
      label: 'Trader',
      description: 'Vendors selling merchandise at the event',
      enabled: true,
      max_applications: 30,
      form_fields: [
        {
          id: 'trader_1',
          name: 'business_name',
          label: 'Business Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your business name'
        },
        {
          id: 'trader_2',
          name: 'product_description',
          label: 'Product Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the products you will be selling'
        },
        {
          id: 'trader_3',
          name: 'website',
          label: 'Website',
          type: 'text',
          required: false,
          placeholder: 'https://your-website.com'
        },
        {
          id: 'trader_4',
          name: 'additional_info',
          label: 'Additional Information',
          type: 'textarea',
          required: false,
          placeholder: 'Any additional information you would like to provide'
        }
      ]
    },
    {
      type: 'volunteer',
      label: 'Volunteer',
      description: 'Volunteers helping at the event',
      enabled: true,
      max_applications: 20,
      form_fields: [
        {
          id: 'volunteer_1',
          name: 'availability',
          label: 'Availability',
          type: 'checkbox',
          required: true,
          options: ['Friday', 'Saturday', 'Sunday']
        },
        {
          id: 'volunteer_2',
          name: 'experience',
          label: 'Previous Experience',
          type: 'textarea',
          required: false,
          placeholder: 'Describe any previous volunteer experience'
        },
        {
          id: 'volunteer_3',
          name: 'preferred_role',
          label: 'Preferred Role',
          type: 'select',
          required: true,
          options: ['Registration', 'Information Desk', 'Security', 'Setup/Teardown', 'General Helper']
        },
        {
          id: 'volunteer_4',
          name: 'additional_info',
          label: 'Additional Information',
          type: 'textarea',
          required: false,
          placeholder: 'Any additional information you would like to provide'
        }
      ]
    }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchApplicationSettings();
    }
  }, [isOpen, eventId]);

  const fetchApplicationSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        // Fetch application settings
        const { data, error } = await supabase
          .from('application_settings')
          .select('*')
          .eq('event_id', eventId)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching application settings:', error);
          throw error;
        }
        
        if (data) {
          console.log('Fetched application settings:', data);
          setSettings(data);
          
          // Set the first type as selected if there are application types
          if (data.application_types && data.application_types.length > 0) {
            setSelectedType(data.application_types[0].type);
          }
        } else {
          // No settings found, use defaults
          console.log('No application settings found, using defaults');
          setSettings({
            event_id: eventId,
            application_types: defaultApplicationTypes
          });
          
          // Set the first type as selected
          setSelectedType(defaultApplicationTypes[0].type);
        }
      } else {
        // Mock data for when Supabase is not available
        console.log('Supabase not available, using default application settings');
        setSettings({
          event_id: eventId,
          application_types: defaultApplicationTypes
        });
        
        // Set the first type as selected
        setSelectedType(defaultApplicationTypes[0].type);
      }
    } catch (err) {
      console.error('Exception fetching application settings:', err);
      setError('Failed to load application settings');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedApplicationType = () => {
    return settings.application_types.find(t => t.type === selectedType) || null;
  };

  const updateApplicationType = (type: string, updates: Partial<ApplicationType>) => {
    setSettings(prev => ({
      ...prev,
      application_types: prev.application_types.map(t => 
        t.type === type ? { ...t, ...updates } : t
      )
    }));
  };

  const addFormField = (type: string) => {
    const appType = settings.application_types.find(t => t.type === type);
    if (!appType) return;
    
    const newField: FormField = {
      id: `${type}_${Date.now()}`,
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: ''
    };
    
    updateApplicationType(type, {
      form_fields: [...appType.form_fields, newField]
    });
    
    // Start editing the new field
    setIsEditingField(newField.id);
    setEditingField(newField);
  };

  const updateFormField = (typeId: string, fieldId: string, updates: Partial<FormField>) => {
    const appType = settings.application_types.find(t => t.type === typeId);
    if (!appType) return;
    
    updateApplicationType(typeId, {
      form_fields: appType.form_fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
    
    // Update the editing field if it's the one being edited
    if (isEditingField === fieldId) {
      setEditingField(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const removeFormField = (typeId: string, fieldId: string) => {
    const appType = settings.application_types.find(t => t.type === typeId);
    if (!appType) return;
    
    updateApplicationType(typeId, {
      form_fields: appType.form_fields.filter(field => field.id !== fieldId)
    });
    
    // Close the editing panel if this field was being edited
    if (isEditingField === fieldId) {
      setIsEditingField(null);
      setEditingField(null);
    }
  };

  const startEditingField = (field: FormField) => {
    setIsEditingField(field.id);
    setEditingField({ ...field });
  };

  const stopEditingField = () => {
    setIsEditingField(null);
    setEditingField(null);
  };

  const saveEditingField = () => {
    if (!editingField || !isEditingField || !selectedType) return;
    
    updateFormField(selectedType, isEditingField, editingField);
    stopEditingField();
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate settings
      if (settings.application_types.length === 0) {
        setError('At least one application type is required');
        setIsSaving(false);
        return;
      }
      
      for (const appType of settings.application_types) {
        if (appType.enabled && appType.max_applications <= 0) {
          setError(`Maximum applications for ${appType.label} must be greater than zero`);
          setIsSaving(false);
          return;
        }
        
        // Check for duplicate field names
        const fieldNames = appType.form_fields.map(f => f.name);
        const uniqueFieldNames = new Set(fieldNames);
        if (fieldNames.length !== uniqueFieldNames.size) {
          setError(`Duplicate field names found in ${appType.label} form`);
          setIsSaving(false);
          return;
        }
      }
      
      // Save to database if using Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('application_settings')
          .upsert({
            id: settings.id,
            event_id: eventId,
            application_types: settings.application_types,
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (error) {
          console.error('Error saving application settings:', error);
          throw error;
        }
        
        console.log('Application settings saved:', data);
        setSuccess('Application settings saved successfully');
      }
      
      // Call the onSave callback
      await onSave(settings);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving application settings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedApplicationType = getSelectedApplicationType();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Application Settings</h2>
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
          {/* Left sidebar - Application types */}
          <div className="w-1/4 border-r border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Application Types</h3>
            </div>
            
            <div className="divide-y divide-white/10">
              {settings.application_types.map((type) => {
                const isActive = selectedType === type.type;
                
                return (
                  <div 
                    key={type.type} 
                    className={`p-4 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-purple-600/20'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedType(type.type)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium">{type.label}</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={type.enabled} 
                          onChange={(e) => {
                            e.stopPropagation();
                            updateApplicationType(type.type, { enabled: e.target.checked });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <p className="text-gray-400 text-xs">
                      {type.enabled 
                        ? `${type.form_fields.length} form fields`
                        : 'Disabled'
                      }
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Middle - Form fields */}
          <div className="w-2/5 border-r border-white/10 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : selectedApplicationType ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedApplicationType.label} Form
                  </h3>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedApplicationType.enabled}
                        onChange={(e) => updateApplicationType(selectedType!, { enabled: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300">Enabled</span>
                    </label>
                  </div>
                </div>
                
                {selectedApplicationType.enabled ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Maximum Applications
                      </label>
                      <input
                        type="number"
                        value={selectedApplicationType.max_applications}
                        onChange={(e) => updateApplicationType(selectedType!, { max_applications: parseInt(e.target.value) || 0 })}
                        min="0"
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="100"
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        Maximum number of applications allowed for this type (0 = unlimited)
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={selectedApplicationType.description}
                        onChange={(e) => updateApplicationType(selectedType!, { description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Describe this application type"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">Form Fields</h4>
                        <button
                          onClick={() => addFormField(selectedType!)}
                          className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Field</span>
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {selectedApplicationType.form_fields.map((field) => (
                          <div 
                            key={field.id} 
                            className={`border rounded-lg p-3 transition-all cursor-pointer ${
                              isEditingField === field.id
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/20 bg-white/5 hover:bg-white/10'
                            }`}
                            onClick={() => startEditingField(field)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-white font-medium">{field.label}</h5>
                                <p className="text-gray-400 text-xs">
                                  {field.type} {field.required && '(required)'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingField(field);
                                  }}
                                  className="text-gray-400 hover:text-white transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFormField(selectedType!, field.id);
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {selectedApplicationType.form_fields.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-gray-400">No form fields yet</p>
                            <button
                              onClick={() => addFormField(selectedType!)}
                              className="mt-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                            >
                              Add your first field
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <h4 className="text-yellow-300 font-medium mb-2">Application Type Disabled</h4>
                    <p className="text-yellow-200 text-sm">
                      This application type is currently disabled. Enable it using the toggle above to configure form fields.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select an application type</h3>
                  <p className="text-gray-400">
                    Choose an application type from the sidebar to configure form fields
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Field editor */}
          <div className="w-1/3 overflow-y-auto">
            {isEditingField && editingField ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Edit Field</h3>
                  <button
                    onClick={stopEditingField}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Field Label
                    </label>
                    <input
                      type="text"
                      value={editingField.label}
                      onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter field label"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={editingField.name}
                      onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter field name (for database)"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      This is the field name used in the database. Use lowercase letters, numbers, and underscores only.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Field Type
                    </label>
                    <select
                      value={editingField.type}
                      onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="text" className="bg-gray-800">Text</option>
                      <option value="textarea" className="bg-gray-800">Text Area</option>
                      <option value="select" className="bg-gray-800">Dropdown</option>
                      <option value="checkbox" className="bg-gray-800">Checkboxes</option>
                      <option value="radio" className="bg-gray-800">Radio Buttons</option>
                      <option value="file" className="bg-gray-800">File Upload</option>
                      <option value="date" className="bg-gray-800">Date</option>
                    </select>
                  </div>
                  
                  {(editingField.type === 'text' || editingField.type === 'textarea') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={editingField.placeholder || ''}
                        onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter placeholder text"
                      />
                    </div>
                  )}
                  
                  {(editingField.type === 'select' || editingField.type === 'checkbox' || editingField.type === 'radio') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Options (one per line)
                      </label>
                      <textarea
                        value={(editingField.options || []).join('\n')}
                        onChange={(e) => setEditingField({ 
                          ...editingField, 
                          options: e.target.value.split('\n').filter(opt => opt.trim()) 
                        })}
                        rows={4}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter options, one per line"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingField.required}
                        onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300">Required Field</span>
                    </label>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={saveEditingField}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Field</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Field Editor</h3>
                  <p className="text-gray-400">
                    Select a field to edit its properties
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