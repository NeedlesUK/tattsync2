import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowUp, ArrowDown, Settings, FileText, CheckSquare, Calendar, Image, Type, AlignLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface FormField {
  id: string;
  field_name: string;
  field_type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'file' | 'image';
  field_label: string;
  field_placeholder?: string;
  field_options?: string[];
  is_required: boolean;
  display_order: number;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  is_required: boolean;
  display_order: number;
  fields: FormField[];
}

interface ConsentFormTemplate {
  id?: number;
  title: string;
  description?: string;
  requires_medical_history: boolean;
  sections: FormSection[];
}

interface ConsentFormTemplateEditorProps {
  initialTemplate?: ConsentFormTemplate;
  onSave: (template: ConsentFormTemplate) => Promise<void>;
  onCancel: () => void;
}

export function ConsentFormTemplateEditor({ 
  initialTemplate, 
  onSave, 
  onCancel 
}: ConsentFormTemplateEditorProps) {
  const { supabase } = useAuth();
  const [template, setTemplate] = useState<ConsentFormTemplate>(
    initialTemplate || {
      title: 'New Consent Form Template',
      description: '',
      requires_medical_history: true,
      sections: []
    }
  );
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // If there are sections but no active section, set the first one as active
    if (template.sections.length > 0 && !activeSection) {
      setActiveSection(template.sections[0].id);
    }
  }, [template.sections, activeSection]);

  const addSection = () => {
    const newId = Date.now().toString();
    const newSection: FormSection = {
      id: newId,
      title: 'New Section',
      description: '',
      is_required: true,
      display_order: template.sections.length,
      fields: []
    };
    
    setTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSection(newId);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const removeSection = (sectionId: string) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
    
    if (activeSection === sectionId) {
      setActiveSection(template.sections.length > 1 ? template.sections[0].id : null);
    }
  };

  const moveSectionUp = (sectionId: string) => {
    const sectionIndex = template.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex <= 0) return;
    
    const newSections = [...template.sections];
    [newSections[sectionIndex - 1], newSections[sectionIndex]] = 
      [newSections[sectionIndex], newSections[sectionIndex - 1]];
    
    // Update display order
    newSections.forEach((section, index) => {
      section.display_order = index;
    });
    
    setTemplate(prev => ({
      ...prev,
      sections: newSections
    }));
  };

  const moveSectionDown = (sectionId: string) => {
    const sectionIndex = template.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex >= template.sections.length - 1) return;
    
    const newSections = [...template.sections];
    [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
      [newSections[sectionIndex + 1], newSections[sectionIndex]];
    
    // Update display order
    newSections.forEach((section, index) => {
      section.display_order = index;
    });
    
    setTemplate(prev => ({
      ...prev,
      sections: newSections
    }));
  };

  const addField = (sectionId: string) => {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newId = `${sectionId}-${Date.now()}`;
    const newField: FormField = {
      id: newId,
      field_name: `field_${Date.now()}`,
      field_type: 'text',
      field_label: 'New Field',
      field_placeholder: '',
      is_required: true,
      display_order: section.fields.length
    };
    
    updateSection(sectionId, {
      fields: [...section.fields, newField]
    });
    
    setActiveField(newId);
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const updatedFields = section.fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    updateSection(sectionId, { fields: updatedFields });
  };

  const removeField = (sectionId: string, fieldId: string) => {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const updatedFields = section.fields.filter(field => field.id !== fieldId);
    updateSection(sectionId, { fields: updatedFields });
    
    if (activeField === fieldId) {
      setActiveField(null);
    }
  };

  const moveFieldUp = (sectionId: string, fieldId: string) => {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex <= 0) return;
    
    const newFields = [...section.fields];
    [newFields[fieldIndex - 1], newFields[fieldIndex]] = 
      [newFields[fieldIndex], newFields[fieldIndex - 1]];
    
    // Update display order
    newFields.forEach((field, index) => {
      field.display_order = index;
    });
    
    updateSection(sectionId, { fields: newFields });
  };

  const moveFieldDown = (sectionId: string, fieldId: string) => {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex >= section.fields.length - 1) return;
    
    const newFields = [...section.fields];
    [newFields[fieldIndex], newFields[fieldIndex + 1]] = 
      [newFields[fieldIndex + 1], newFields[fieldIndex]];
    
    // Update display order
    newFields.forEach((field, index) => {
      field.display_order = index;
    });
    
    updateSection(sectionId, { fields: newFields });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate template
      if (!template.title.trim()) {
        throw new Error('Template title is required');
      }
      
      if (template.sections.length === 0) {
        throw new Error('At least one section is required');
      }
      
      for (const section of template.sections) {
        if (!section.title.trim()) {
          throw new Error('All sections must have a title');
        }
      }
      
      await onSave(template);
      setSuccess('Template saved successfully');
      
      // Reset form after successful save
      setTimeout(() => {
        onCancel();
      }, 1500);
    } catch (error: any) {
      console.error('Error saving template:', error);
      setError(error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return Type;
      case 'textarea': return AlignLeft;
      case 'checkbox': return CheckSquare;
      case 'radio': return CheckSquare;
      case 'select': return CheckSquare;
      case 'date': return Calendar;
      case 'file': return FileText;
      case 'image': return Image;
      default: return Type;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Consent Form Template Editor</h2>
        
        {/* Template Title and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Title
            </label>
            <input
              type="text"
              value={template.title}
              onChange={(e) => setTemplate(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter template title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Description
            </label>
            <input
              type="text"
              value={template.description || ''}
              onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter template description"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={template.requires_medical_history}
              onChange={(e) => setTemplate(prev => ({ ...prev, requires_medical_history: e.target.checked }))}
              className="text-purple-600 focus:ring-purple-500 rounded"
            />
            <span className="text-gray-300">Requires Medical History</span>
          </label>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 mb-6">
        {template.sections.map((section) => (
          <div 
            key={section.id} 
            className={`border rounded-lg transition-all ${
              activeSection === section.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 bg-white/5'
            }`}
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="bg-transparent text-white font-medium text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                    placeholder="Section Title"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveSectionUp(section.id)}
                    disabled={section.display_order === 0}
                    className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveSectionDown(section.id)}
                    disabled={section.display_order === template.sections.length - 1}
                    className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <input
                type="text"
                value={section.description || ''}
                onChange={(e) => updateSection(section.id, { description: e.target.value })}
                className="w-full bg-transparent text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                placeholder="Section Description (optional)"
              />
              
              <div className="mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.is_required}
                    onChange={(e) => updateSection(section.id, { is_required: e.target.checked })}
                    className="text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span className="text-gray-300 text-sm">Required Section</span>
                </label>
              </div>
            </div>
            
            {/* Fields */}
            <div className="p-4">
              {section.fields.map((field) => {
                const FieldIcon = getFieldTypeIcon(field.field_type);
                return (
                  <div 
                    key={field.id} 
                    className={`mb-3 p-3 border rounded transition-all ${
                      activeField === field.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FieldIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-white text-sm">{field.field_label}</span>
                        {field.is_required && (
                          <span className="text-red-400 text-xs">*</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveFieldUp(section.id, field.id)}
                          disabled={field.display_order === 0}
                          className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveFieldDown(section.id, field.id)}
                          disabled={field.display_order === section.fields.length - 1}
                          className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setActiveField(activeField === field.id ? null : field.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeField(section.id, field.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {activeField === field.id && (
                      <div className="mt-3 p-3 bg-white/5 rounded space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Field Label</label>
                          <input
                            type="text"
                            value={field.field_label}
                            onChange={(e) => updateField(section.id, field.id, { field_label: e.target.value })}
                            className="w-full px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Field Name (for database)</label>
                          <input
                            type="text"
                            value={field.field_name}
                            onChange={(e) => updateField(section.id, field.id, { field_name: e.target.value })}
                            className="w-full px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Field Type</label>
                          <select
                            value={field.field_type}
                            onChange={(e) => updateField(section.id, field.id, { 
                              field_type: e.target.value as FormField['field_type'] 
                            })}
                            className="w-full px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="text">Text Input</option>
                            <option value="textarea">Text Area</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="radio">Radio Buttons</option>
                            <option value="select">Dropdown</option>
                            <option value="date">Date</option>
                            <option value="file">File Upload</option>
                            <option value="image">Image Upload</option>
                          </select>
                        </div>
                        
                        {(field.field_type === 'text' || field.field_type === 'textarea') && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Placeholder</label>
                            <input
                              type="text"
                              value={field.field_placeholder || ''}
                              onChange={(e) => updateField(section.id, field.id, { field_placeholder: e.target.value })}
                              className="w-full px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        )}
                        
                        {(field.field_type === 'radio' || field.field_type === 'select' || field.field_type === 'checkbox') && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Options (one per line)</label>
                            <textarea
                              value={(field.field_options || []).join('\n')}
                              onChange={(e) => updateField(section.id, field.id, { 
                                field_options: e.target.value.split('\n').filter(opt => opt.trim()) 
                              })}
                              rows={3}
                              className="w-full px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        )}
                        
                        <div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.is_required}
                              onChange={(e) => updateField(section.id, field.id, { is_required: e.target.checked })}
                              className="text-purple-600 focus:ring-purple-500 rounded"
                            />
                            <span className="text-gray-300 text-xs">Required Field</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <button
                onClick={() => addField(section.id)}
                className="w-full mt-2 border border-dashed border-white/20 rounded-lg p-2 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Field</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={addSection}
        className="w-full mb-6 border-2 border-dashed border-white/20 rounded-lg p-4 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Section</span>
      </button>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !template.title || template.sections.length === 0}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
        </button>
      </div>
    </div>
  );
}