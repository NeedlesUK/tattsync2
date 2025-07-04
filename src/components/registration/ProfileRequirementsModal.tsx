import React, { useState } from 'react';
import { X, Plus, Trash2, Save, FileText, Image, Link, Calendar, CheckSquare, Type, AlignLeft } from 'lucide-react';

interface ProfileField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  field_description: string;
  is_required: boolean;
  deadline_days: number;
  reminder_days: number[];
  display_order: number;
  field_options: string[];
}

interface ProfileRequirementsModalProps {
  eventId: number;
  eventName: string;
  applicationType: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: ProfileField[]) => void;
}

export function ProfileRequirementsModal({
  eventId,
  eventName,
  applicationType,
  isOpen,
  onClose,
  onSave
}: ProfileRequirementsModalProps) {
  const [fields, setFields] = useState<ProfileField[]>([
    {
      id: '1',
      field_name: 'profile_photo',
      field_type: 'image',
      field_label: 'Profile Photo',
      field_description: 'Professional headshot or photo of yourself',
      is_required: true,
      deadline_days: 30,
      reminder_days: [7, 3, 1],
      display_order: 1,
      field_options: []
    },
    {
      id: '2',
      field_name: 'portfolio_images',
      field_type: 'image',
      field_label: 'Portfolio Images',
      field_description: 'Upload 5-10 images of your best work',
      is_required: true,
      deadline_days: 30,
      reminder_days: [7, 3, 1],
      display_order: 2,
      field_options: []
    },
    {
      id: '3',
      field_name: 'bio',
      field_type: 'textarea',
      field_label: 'Artist Bio',
      field_description: 'Tell potential clients about your style and experience',
      is_required: true,
      deadline_days: 30,
      reminder_days: [7, 3, 1],
      display_order: 3,
      field_options: []
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: Type },
    { value: 'textarea', label: 'Text Area', icon: AlignLeft },
    { value: 'image', label: 'Image Upload', icon: Image },
    { value: 'file', label: 'File Upload', icon: FileText },
    { value: 'url', label: 'URL Link', icon: Link },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'select', label: 'Dropdown', icon: CheckSquare },
    { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare }
  ];

  const getApplicationTypeTitle = (type: string) => {
    switch (type) {
      case 'artist': return 'Tattoo Artist';
      case 'piercer': return 'Piercer';
      case 'performer': return 'Performer';
      case 'trader': return 'Trader';
      case 'volunteer': return 'Volunteer';
      case 'caterer': return 'Caterer';
      default: return type;
    }
  };

  const addField = () => {
    const newField: ProfileField = {
      id: Date.now().toString(),
      field_name: '',
      field_type: 'text',
      field_label: '',
      field_description: '',
      is_required: true,
      deadline_days: 30,
      reminder_days: [7, 3, 1],
      display_order: fields.length + 1,
      field_options: []
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<ProfileField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update display order
    newFields.forEach((field, i) => {
      field.display_order = i + 1;
    });
    
    setFields(newFields);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(fields);
      onClose();
    } catch (error) {
      console.error('Error saving profile requirements:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldTypeIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType ? fieldType.icon : Type;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Profile Requirements</h2>
            <p className="text-gray-300 text-sm">
              {getApplicationTypeTitle(applicationType)} • {eventName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">Profile Requirements</h3>
              <p className="text-blue-200 text-sm">
                Define what profile information and documents attendees must provide after registration approval. 
                Set deadlines and automatic reminders to ensure completion.
              </p>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-4">
            {fields.map((field, index) => {
              const FieldIcon = getFieldTypeIcon(field.field_type);
              
              return (
                <div key={field.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FieldIcon className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Field {index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveField(field.id, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveField(field.id, 'down')}
                        disabled={index === fields.length - 1}
                        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Field Name (Internal)</label>
                      <input
                        type="text"
                        value={field.field_name}
                        onChange={(e) => updateField(field.id, { field_name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., profile_photo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Field Type</label>
                      <select
                        value={field.field_type}
                        onChange={(e) => updateField(field.id, { field_type: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {fieldTypes.map(type => (
                          <option key={type.value} value={type.value} className="bg-gray-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Display Label</label>
                      <input
                        type="text"
                        value={field.field_label}
                        onChange={(e) => updateField(field.id, { field_label: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Profile Photo"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.is_required}
                          onChange={(e) => updateField(field.id, { is_required: e.target.checked })}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <span className="text-gray-300 text-sm">Required</span>
                      </label>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Deadline (days)</label>
                        <input
                          type="number"
                          value={field.deadline_days}
                          onChange={(e) => updateField(field.id, { deadline_days: parseInt(e.target.value) || 30 })}
                          min="1"
                          max="365"
                          className="w-20 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Description/Instructions</label>
                    <textarea
                      value={field.field_description}
                      onChange={(e) => updateField(field.id, { field_description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Provide instructions for this field..."
                    />
                  </div>

                  {(field.field_type === 'select' || field.field_type === 'checkbox') && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Options (one per line)</label>
                      <textarea
                        value={field.field_options.join('\n')}
                        onChange={(e) => updateField(field.id, { 
                          field_options: e.target.value.split('\n').filter(opt => opt.trim()) 
                        })}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-white/5 rounded">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Reminders sent:</span>
                      <span className="text-gray-300">
                        {field.reminder_days.join(', ')} days before deadline
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Field Button */}
          <button
            onClick={addField}
            className="w-full mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Profile Field</span>
          </button>

          {/* Info Box */}
          <div className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-300 font-medium mb-2">Profile Completion Process</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• Attendees receive profile completion instructions after registration approval</li>
              <li>• Automatic reminders are sent based on the reminder schedule</li>
              <li>• Event managers can review and approve/reject submitted content</li>
              <li>• Traffic light system shows completion status for each attendee</li>
            </ul>
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
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Requirements'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}