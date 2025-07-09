import React, { useState } from 'react';
import { X, Save, Plus, Trash2, FileText, Users, Edit, Image, File, Paperclip, Ticket, CheckCircle, Tabs, Tab } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';

interface EventInformation {
  id: string;
  title: string;
  content: string;
  application_types: string[];
  ticket_holders: boolean;
  is_active: boolean;
  media_items?: MediaItem[];
  category?: string;
}

interface MediaItem {
  id: string;
  type: 'image' | 'pdf';
  url: string;
  name: string;
  size?: number;
}

interface EventInformationModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (information: EventInformation[]) => void;
}

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

// Helper function to check if file is an image
const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Helper function to check if file is a PDF
const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

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
      title: 'Welcome to the Event',
      content: 'Thank you for being part of our event! This page contains important information about the event, including setup times, venue details, and other resources.',
      application_types: [],
      ticket_holders: true,
      is_active: true,
      media_items: [],
      category: 'General'
    },
    {
      id: '2',
      title: 'Artist Setup Information',
      content: 'Artist setup begins at 8:00 AM on the first day of the event. Please bring your own equipment, including chairs, lamps, and supplies. Power will be provided at each booth.',
      application_types: ['artist'],
      ticket_holders: false,
      is_active: true,
      media_items: [],
      category: 'Setup'
    }
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingMedia, setEditingMedia] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>(['General', 'Setup', 'Schedule', 'Rules', 'FAQ', 'Travel', 'Accommodation']);
  const [newCategory, setNewCategory] = useState<string>('');
  const { supabase } = useAuth();

  // Get the currently selected item for editing
  const selectedItem = selectedItemId 
    ? informationItems.find(item => item.id === selectedItemId) 
    : informationItems[0];

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
      ticket_holders: false,
      is_active: true,
      media_items: [],
      category: 'General'
    };
    setInformationItems([...informationItems, newItem]);
    setSelectedItemId(newItem.id);
  };

  const updateInformationItem = (id: string, updates: Partial<EventInformation>) => {
    setInformationItems(informationItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeInformationItem = (id: string) => {
    setInformationItems(informationItems.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(informationItems.filter(item => item.id !== id)[0]?.id || null);
    }
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

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  // File upload handlers
  const onDrop = async (acceptedFiles: File[]) => {
    if (!selectedItemId) return;
    
    const newMediaItems: MediaItem[] = [];
    
    for (const file of acceptedFiles) {
      // Check file type
      if (!isImageFile(file) && !isPdfFile(file)) {
        alert('Only image files and PDFs are allowed');
        continue;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        continue;
      }
      
      // In a real implementation, upload to storage
      // For now, create a temporary URL
      const fileUrl = URL.createObjectURL(file);
      
      newMediaItems.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        type: isImageFile(file) ? 'image' : 'pdf',
        url: fileUrl,
        name: file.name,
        size: file.size
      });
    }
    
    // Update the selected item with new media
    if (newMediaItems.length > 0) {
      updateInformationItem(selectedItemId, {
        media_items: [
          ...(selectedItem?.media_items || []),
          ...newMediaItems
        ]
      });
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    }
  });
  
  const removeMedia = (itemId: string, mediaId: string) => {
    const item = informationItems.find(item => item.id === itemId);
    if (!item || !item.media_items) return;
    
    const updatedMedia = item.media_items.filter(media => media.id !== mediaId);
    updateInformationItem(itemId, { media_items: updatedMedia });
  };

  // Group information items by category
  const groupedItems = informationItems.reduce((acc, item) => {
    const category = item.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, EventInformation[]>);

  // Get unique categories that have items
  const activeCategories = Object.keys(groupedItems);

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
              <h3 className="text-blue-300 font-medium mb-2">Event Information Pages</h3>
              <p className="text-blue-200 text-sm">
                Create information pages that will be accessible to attendees through their profiles.
                You can target specific attendee types, ticket holders, or make information available to everyone.
                Organize information into categories for easier navigation.
              </p>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar - Information items list */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">Information Items</h3>
                <button
                  onClick={addInformationItem}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {/* Category tabs */}
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {activeCategories.map(category => (
                    <button
                      key={category}
                      className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                        selectedItemId && informationItems.find(i => i.id === selectedItemId)?.category === category
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        // Select the first item in this category
                        const firstItemInCategory = informationItems.find(i => i.category === category);
                        if (firstItemInCategory) {
                          setSelectedItemId(firstItemInCategory.id);
                        }
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Items list */}
                <div className="max-h-[calc(90vh-400px)] overflow-y-auto">
                  {selectedItemId && (
                    <div className="divide-y divide-white/10">
                      {informationItems
                        .filter(item => item.category === selectedItem?.category)
                        .map(item => (
                        <div 
                          key={item.id}
                          className={`p-3 cursor-pointer ${
                            selectedItemId === item.id ? 'bg-white/10' : 'hover:bg-white/5'
                          }`}
                          onClick={() => setSelectedItemId(item.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-purple-400" />
                              <span className="text-white font-medium truncate">{item.title || 'Untitled'}</span>
                            </div>
                            {!item.is_active && (
                              <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.application_types.length === 0 && item.ticket_holders && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                All Attendees
                              </span>
                            )}
                            {item.application_types.length === 0 && !item.ticket_holders && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                                Everyone
                              </span>
                            )}
                            {item.application_types.map(type => (
                              <span key={type} className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                                {type}
                              </span>
                            ))}
                            {item.media_items && item.media_items.length > 0 && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded flex items-center">
                                <Paperclip className="w-3 h-3 mr-1" />
                                {item.media_items.length}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add new category */}
              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-1">Add New Category</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="New category name"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right side - Edit form */}
            <div className="md:col-span-2">
              {selectedItem ? (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-medium">Edit Information Item</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItem.is_active}
                          onChange={(e) => updateInformationItem(selectedItem.id, { is_active: e.target.checked })}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <span className="text-gray-300 text-sm">Active</span>
                      </label>
                      <button
                        onClick={() => removeInformationItem(selectedItem.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={selectedItem.title}
                          onChange={(e) => updateInformationItem(selectedItem.id, { title: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., Setup Information, Venue Details, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Category</label>
                        <select
                          value={selectedItem.category || 'General'}
                          onChange={(e) => updateInformationItem(selectedItem.id, { category: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {categories.map(category => (
                            <option key={category} value={category} className="bg-gray-800">
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Content</label>
                      <textarea
                        value={selectedItem.content}
                        onChange={(e) => updateInformationItem(selectedItem.id, { content: e.target.value })}
                        rows={8}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter the information content here..."
                      />
                    </div>
                    
                    {/* Media Items */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Media Attachments</span>
                        </label>
                        <button
                          onClick={() => setEditingMedia(!editingMedia)}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          {editingMedia ? 'Done' : 'Edit'}
                        </button>
                      </div>
                      
                      {/* Media items grid */}
                      {selectedItem.media_items && selectedItem.media_items.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                          {selectedItem.media_items.map(media => (
                            <div key={media.id} className="relative group">
                              <div className="bg-white/5 border border-white/20 rounded p-2">
                                {media.type === 'image' ? (
                                  <div className="aspect-video bg-black/20 rounded overflow-hidden">
                                    <img 
                                      src={media.url} 
                                      alt={media.name} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Error';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-video bg-red-500/10 rounded flex items-center justify-center">
                                    <File className="w-8 h-8 text-red-400" />
                                  </div>
                                )}
                                <p className="text-xs text-gray-300 truncate mt-1">{media.name}</p>
                              </div>
                              {editingMedia && (
                                <button
                                  onClick={() => removeMedia(selectedItem.id, media.id)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm mb-3">No media attachments</p>
                      )}
                      
                      {/* Upload area */}
                      <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                          isDragActive 
                            ? 'border-purple-500 bg-purple-500/10' 
                            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Paperclip className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300 text-sm">Drag & drop images or PDFs here, or click to select files</p>
                        <p className="text-gray-400 text-xs mt-1">Maximum 5MB per file</p>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Visible to</span>
                      </label>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          onClick={() => {
                            updateInformationItem(selectedItem.id, { 
                              application_types: [],
                              ticket_holders: false
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                            selectedItem.application_types.length === 0 && !selectedItem.ticket_holders
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          <span>Everyone</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            updateInformationItem(selectedItem.id, { 
                              application_types: [],
                              ticket_holders: true
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                            selectedItem.application_types.length === 0 && selectedItem.ticket_holders
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <Ticket className="w-3 h-3" />
                          <span>All Ticket Holders</span>
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {applicationTypes.map(type => (
                          <button
                            key={type.value}
                            onClick={() => {
                              const types = selectedItem.application_types.includes(type.value)
                                ? selectedItem.application_types.filter(t => t !== type.value)
                                : [...selectedItem.application_types, type.value];
                              updateInformationItem(selectedItem.id, { 
                                application_types: types,
                                ticket_holders: false
                              });
                            }}
                            className={`px-3 py-1 rounded-full text-sm ${
                              selectedItem.application_types.includes(type.value)
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
              ) : (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-300">Select an information item to edit or create a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 p-6 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={addInformationItem}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Information'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}