import React, { useState } from 'react';
import { X, Save, Plus, Trash2, FileText, Users, Edit, Image, File, Paperclip, Ticket, CheckCircle, Table as Tabs, Table as Tab } from 'lucide-react'tring;
  content: string;
  application_types: string[];
  is_active: boolean;
}

interface EventInformationModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (information: EventInformation[]) => void;
}

export function EventInformationModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: EventInformationModalProps) {
  const [informationItems, setInformationItems] = useState<EventInformation[]>([
    {
      id: '1',
      title: 'Welcome to Ink Fest 2024',
      content: 'Thank you for being part of our event! This page contains important information about the event, including setup times, venue details, and other resources.',
      application_types: [],
      is_active: true
    },
    {
      id: '2',
      title: 'Artist Setup Information',
      content: 'Artist setup begins at 8:00 AM on the first day of the event. Please bring your own equipment, including chairs, lamps, and supplies. Power will be provided at each booth.',
      application_types: ['artist'],
      is_active: true
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const applicationTypes = [
    { value: 'artist', label: 'Artists' },
    { value: 'piercer', label: 'Piercers' },
    { value: 'trader', label: 'Traders' },
    { value: 'caterer', label: 'Caterers' },
    { value: 'performer', label: 'Performers' },
    { value: 'volunteer', label: 'Volunteers' }
  ];

  const addInformationItem = () => {
    const newItem: EventInformation = {
      id: Date.now().toString(),
      title: '',
      content: '',
      application_types: [],
      is_active: true
    };
    setInformationItems([...informationItems, newItem]);
  };

  const updateInformationItem = (id: string, updates: Partial<EventInformation>) => {
    setInformationItems(informationItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeInformationItem = (id: string) => {
    setInformationItems(informationItems.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(informationItems);
      onClose();
    } catch (error) {
      console.error('Error saving event information:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Event Information</h2>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">Event Information</h3>
              <p className="text-blue-200 text-sm">
                Create information pages that will be accessible to attendees through their profiles.
                You can target specific attendee types or make information available to everyone.
              </p>
            </div>
          </div>

          {/* Information Items */}
          <div className="space-y-6">
            {informationItems.map((item) => (
              <div key={item.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-medium">Information Item</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.is_active}
                        onChange={(e) => updateInformationItem(item.id, { is_active: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300 text-sm">Active</span>
                    </label>
                    <button
                      onClick={() => removeInformationItem(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateInformationItem(item.id, { title: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Setup Information, Venue Details, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Content</label>
                    <textarea
                      value={item.content}
                      onChange={(e) => updateInformationItem(item.id, { content: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter the information content here..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Visible to</span>
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateInformationItem(item.id, { application_types: [] })}
                        className={`px-3 py-1 rounded-full text-sm ${
                          item.application_types.length === 0
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        All Attendees
                      </button>
                      
                      {applicationTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => {
                            const types = item.application_types.includes(type.value)
                              ? item.application_types.filter(t => t !== type.value)
                              : [...item.application_types, type.value];
                            updateInformationItem(item.id, { application_types: types });
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.application_types.includes(type.value)
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Information Button */}
          <button
            onClick={addInformationItem}
            className="w-full mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Information Item</span>
          </button>
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
            <span>{isSaving ? 'Saving...' : 'Save Information'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}