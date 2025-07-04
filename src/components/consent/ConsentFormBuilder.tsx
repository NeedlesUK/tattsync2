import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowUp, ArrowDown, Settings, FileText, CheckSquare, Calendar, Image, Type, AlignLeft } from 'lucide-react';

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

interface ConsentFormBuilderProps {
  eventId: number;
  initialForm?: {
    id?: number;
    title: string;
    description?: string;
    requires_medical_history: boolean;
    sections: FormSection[];
  };
  onSave: (formData: any) => Promise<void>;
  onCancel: () => void;
}

export function ConsentFormBuilder({ eventId, initialForm, onSave, onCancel }: ConsentFormBuilderProps) {
  const [formTitle, setFormTitle] = useState(initialForm?.title || 'Medical History & Consent Form');
  const [formDescription, setFormDescription] = useState(initialForm?.description || 'Please complete this form before your procedure');
  const [requiresMedicalHistory, setRequiresMedicalHistory] = useState(initialForm?.requires_medical_history || true);
  const [sections, setSections] = useState<FormSection[]>(initialForm?.sections || [
    {
      id: '1',
      title: 'Your Details',
      description: 'Please provide your personal information',
      is_required: true,
      display_order: 0,
      fields: [
        {
          id: '1-1',
          field_name: 'clientName',
          field_type: 'text',
          field_label: 'Name',
          field_placeholder: 'Your full name',
          is_required: true,
          display_order: 0
        },
        {
          id: '1-2',
          field_name: 'DOB',
          field_type: 'date',
          field_label: 'Date of Birth',
          is_required: true,
          display_order: 1
        },
        {
          id: '1-3',
          field_name: 'Phone',
          field_type: 'text',
          field_label: 'Phone',
          field_placeholder: 'Your contact number',
          is_required: true,
          display_order: 2
        },
        {
          id: '1-4',
          field_name: 'clientEmail',
          field_type: 'text',
          field_label: 'Email',
          field_placeholder: 'Your email address',
          is_required: true,
          display_order: 3
        },
        {
          id: '1-5',
          field_name: 'FullAddress',
          field_type: 'textarea',
          field_label: 'Address',
          field_placeholder: 'Your full address',
          is_required: true,
          display_order: 4
        }
      ]
    },
    {
      id: '2',
      title: 'Age & Consent',
      description: 'Please confirm the following',
      is_required: true,
      display_order: 1,
      fields: [
        {
          id: '2-1',
          field_name: 'ageConfirm',
          field_type: 'checkbox',
          field_label: 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.',
          is_required: true,
          display_order: 0
        },
        {
          id: '2-2',
          field_name: 'riskConfirm',
          field_type: 'checkbox',
          field_label: 'I fully understand that there are risks with tattooing, known and unknown, can lead to injury, including but not limited to infection, scarring, difficulties in detecting melanoma and allergic reactions to tattoo pigment, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the tattoo application and I freely accept and expressly assume any and all risks.',
          is_required: true,
          display_order: 1
        },
        {
          id: '2-3',
          field_name: 'liabilityConfirm',
          field_type: 'checkbox',
          field_label: 'I understand neither the Artist, Venue nor Event Organiser is responsible for the meaning or spelling of the symbol or text that I have provided to them or chosen from the flash (design) sheets. Variations in colour/design may exist between the art I have selected and the actual tattoo. I also understand that over time, the colours and the clarity of my tattoo will fade due to natural dispersion of pigment under the skin. A tattoo is a permanent change to my appearance and can only be removed by laser or surgical means, which can be disfiguring and/or costly and which in all likelihood will not result in the restoration of my skin.',
          is_required: true,
          display_order: 2
        },
        {
          id: '2-4',
          field_name: 'mediaRelease',
          field_type: 'radio',
          field_label: 'I release all rights to any photographs and video taken of me and the tattoo and give consent in advance to their reproduction in print or electronic form.',
          field_options: ['Yes', 'No'],
          is_required: true,
          display_order: 3
        },
        {
          id: '2-5',
          field_name: 'idPhoto',
          field_type: 'image',
          field_label: 'Upload photo ID (optional)',
          is_required: false,
          display_order: 4
        }
      ]
    },
    {
      id: '3',
      title: 'Medical History',
      description: 'Please provide your medical information',
      is_required: true,
      display_order: 2,
      fields: [
        {
          id: '3-1',
          field_name: 'noIssues',
          field_type: 'checkbox',
          field_label: 'No previous tattoo issues or relevant medical issues',
          is_required: false,
          display_order: 0
        },
        {
          id: '3-2',
          field_name: 'medicalIssues',
          field_type: 'checkbox',
          field_label: 'Medical conditions (select all that apply)',
          field_options: [
            'Diabetes',
            'Epilepsy',
            'Haemophilia',
            'Pregnant or breast feeding',
            'Taking blood thinning medication',
            'Skin condition',
            'Heart condition',
            'Recipient of an organ or bone marrow transplant',
            'Any blood-borne pathogens',
            'Any transmittable diseases',
            'Any allergies',
            'Had any adverse reaction to a previous tattoo or products used',
            'Fainted or other issues during a previous tattoo',
            'Issues with tattoo healing',
            'Other'
          ],
          is_required: false,
          display_order: 1
        },
        {
          id: '3-3',
          field_name: 'medicalDetails',
          field_type: 'textarea',
          field_label: 'Medical Details',
          field_placeholder: 'Please provide details of any medical conditions selected above',
          is_required: false,
          display_order: 2
        }
      ]
    },
    {
      id: '4',
      title: 'On The Day',
      description: 'Please confirm the following for the day of your procedure',
      is_required: true,
      display_order: 3,
      fields: [
        {
          id: '4-1',
          field_name: 'aftercareAdvice',
          field_type: 'checkbox',
          field_label: 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the artist for any healing issues. I understand that should I have any concerns they will be relayed to the artist immediately for further advice.',
          is_required: true,
          display_order: 0
        },
        {
          id: '4-2',
          field_name: 'eatBefore',
          field_type: 'checkbox',
          field_label: 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.',
          is_required: true,
          display_order: 1
        },
        {
          id: '4-3',
          field_name: 'unwell',
          field_type: 'checkbox',
          field_label: 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my artist and my appointment may be cancelled.',
          is_required: true,
          display_order: 2
        },
        {
          id: '4-4',
          field_name: 'noAlcohol',
          field_type: 'checkbox',
          field_label: 'I will not get tattooed under the influence of alcohol or drugs.',
          is_required: true,
          display_order: 3
        },
        {
          id: '4-5',
          field_name: 'marketingConsent',
          field_type: 'radio',
          field_label: 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.',
          field_options: ['Yes', 'No'],
          is_required: true,
          display_order: 4
        }
      ]
    }
  ]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);

  const addSection = () => {
    const newId = Date.now().toString();
    const newSection: FormSection = {
      id: newId,
      title: 'New Section',
      description: '',
      is_required: true,
      display_order: sections.length,
      fields: []
    };
    
    setSections([...sections, newSection]);
    setActiveSection(newId);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
    if (activeSection === sectionId) {
      setActiveSection(null);
    }
  };

  const moveSectionUp = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex <= 0) return;
    
    const newSections = [...sections];
    [newSections[sectionIndex - 1], newSections[sectionIndex]] = 
      [newSections[sectionIndex], newSections[sectionIndex - 1]];
    
    // Update display order
    newSections.forEach((section, index) => {
      section.display_order = index;
    });
    
    setSections(newSections);
  };

  const moveSectionDown = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex >= sections.length - 1) return;
    
    const newSections = [...sections];
    [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
      [newSections[sectionIndex + 1], newSections[sectionIndex]];
    
    // Update display order
    newSections.forEach((section, index) => {
      section.display_order = index;
    });
    
    setSections(newSections);
  };

  const addField = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
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
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const updatedFields = section.fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    updateSection(sectionId, { fields: updatedFields });
  };

  const removeField = (sectionId: string, fieldId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const updatedFields = section.fields.filter(field => field.id !== fieldId);
    updateSection(sectionId, { fields: updatedFields });
    
    if (activeField === fieldId) {
      setActiveField(null);
    }
  };

  const moveFieldUp = (sectionId: string, fieldId: string) => {
    const section = sections.find(s => s.id === sectionId);
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
    const section = sections.find(s => s.id === sectionId);
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
    try {
      const formData = {
        id: initialForm?.id,
        event_id: eventId,
        title: formTitle,
        description: formDescription,
        requires_medical_history: requiresMedicalHistory,
        sections: sections.map(section => ({
          ...section,
          fields: section.fields.map(field => ({
            ...field,
            field_options: field.field_options || []
          }))
        }))
      };
      
      await onSave(formData);
    } catch (error) {
      console.error('Error saving form:', error);
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
        <h2 className="text-xl font-bold text-white mb-4">Consent Form Builder</h2>
        
        {/* Form Title and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Form Title
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Form Description
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter form description"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresMedicalHistory}
              onChange={(e) => setRequiresMedicalHistory(e.target.checked)}
              className="text-purple-600 focus:ring-purple-500 rounded"
            />
            <span className="text-gray-300">Requires Medical History</span>
          </label>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 mb-6">
        {sections.map((section) => (
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
                    disabled={section.display_order === sections.length - 1}
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
                className="w-full mt-2 border border-dashed border-white/20 rounded p-2 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-1"
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
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !formTitle || sections.length === 0}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Form'}</span>
        </button>
      </div>
    </div>
  );
}