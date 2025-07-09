import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, FileText, Users, Edit, Image, File, Paperclip, Ticket, CheckCircle, Table as Tabs } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';

interface EventInformation {
  id: string;
  title: string;
  content: string;
  application_types: string[];
  is_active: boolean;
  category: string;
  ticket_holders: boolean;
  media_items?: MediaItem[];
}

interface MediaItem {
  id?: string;
  type: 'image' | 'pdf';
  file?: File;
  url?: string;
  name: string;
  size?: number;
  isNew?: boolean;
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
  const { supabase } = useAuth();
  const [informationItems, setInformationItems] = useState<EventInformation[]>([
    {
      id: '1',
      title: 'Welcome to Ink Fest 2024',
      content: 'Thank you for being part of our event! This page contains important information about the event, including setup times, venue details, and other resources.',
      application_types: [],
      is_active: true,
      category: 'General',
      ticket_holders: false
    },
    {
      id: '2',
      title: 'Artist Setup Information',
      content: 'Artist setup begins at 8:00 AM on the first day of the event. Please bring your own equipment, including chairs, lamps, and supplies. Power will be provided at each booth.',
      application_types: ['artist'],
      is_active: true,
      category: 'Setup',
      ticket_holders: false
    }
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EventInformation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>(['General', 'Setup', 'Schedule', 'FAQ', 'Travel', 'Accommodation']);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // In a real implementation, fetch information items from API
      fetchInformationItems();
    }
  }, [isOpen, eventId]);

  useEffect(() => {
    if (selectedItemId) {
      const item = informationItems.find(item => item.id === selectedItemId);
      if (item) {
        setEditingItem(item);
      }
    } else {
      setEditingItem(null);
    }
  }, [selectedItemId, informationItems]);

  const fetchInformationItems = async () => {
    try {
      // In a real implementation, fetch from API
      console.log('Fetching information items for event:', eventId);
      
      if (supabase) {
        // Fetch information items
        const { data, error } = await supabase
          .from('event_information')
          .select(`
            id, 
            title, 
            content, 
            application_types, 
            is_active, 
            category,
            ticket_holders,
            created_at, 
            updated_at
          `)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching information items:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Fetched information items:', data);
          
          // Fetch media items for each information item
          const itemsWithMedia = await Promise.all(data.map(async (item) => {
            const { data: mediaData, error: mediaError } = await supabase
              .from('event_information_media')
              .select('*')
              .eq('information_id', item.id);
              
            if (mediaError) {
              console.error('Error fetching media for item:', item.id, mediaError);
              return item;
            }
            
            return {
              ...item,
              media_items: mediaData || []
            };
          }));
          
          setInformationItems(itemsWithMedia);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(data.map(item => item.category || 'General'))];
          setCategories(['General', ...uniqueCategories.filter(cat => cat !== 'General')]);
        } else {
          console.log('No information items found');
          setInformationItems([]);
        }
      }
    } catch (error) {
      console.error('Error fetching information items:', error);
    }
  };

  const addInformationItem = () => {
    const newId = Date.now().toString();
    const newItem: EventInformation = {
      id: newId,
      title: '',
      content: '',
      application_types: [],
      is_active: true,
      category: 'General',
      ticket_holders: false
    };
    
    setInformationItems([...informationItems, newItem]);
    setSelectedItemId(newId);
  };

  const updateInformationItem = (id: string, updates: Partial<EventInformation>) => {
    setInformationItems(informationItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    
    if (editingItem && editingItem.id === id) {
      setEditingItem({ ...editingItem, ...updates });
    }
  };

  const removeInformationItem = (id: string) => {
    setInformationItems(informationItems.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(informationItems);
      onClose();
    } catch (error) {
      console.error('Error saving information items:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleApplicationTypeToggle = (type: string) => {
    if (!editingItem) return;
    
    const currentTypes = [...editingItem.application_types];
    
    if (currentTypes.includes(type)) {
      updateInformationItem(editingItem.id, { 
        application_types: currentTypes.filter(t => t !== type) 
      });
    } else {
      updateInformationItem(editingItem.id, { 
        application_types: [...currentTypes, type] 
      });
    }
  };

  // File upload handling
  const onDrop = (acceptedFiles: File[]) => {
    if (!editingItem) return;
    
    const newMediaItems: MediaItem[] = acceptedFiles.map(file => ({
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      file,
      name: file.name,
      size: file.size,
      isNew: true
    }));
    
    const currentMediaItems = editingItem.media_items || [];
    
    updateInformationItem(editingItem.id, {
      media_items: [...currentMediaItems, ...newMediaItems]
    });
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    }
  });

  const removeMediaItem = (index: number) => {
    if (!editingItem || !editingItem.media_items) return;
    
    const newMediaItems = [...editingItem.media_items];
    newMediaItems.splice(index, 1);
    
    updateInformationItem(editingItem.id, {
      media_items: newMediaItems
    });
  };

  if (!isOpen) return null;

  const applicationTypes = [
    { value: 'artist', label: 'Artists' },
    { value: 'piercer', label: 'Piercers' },
    { value: 'public', label: 'Public' },
    { value: 'trader', label: 'Traders' },
    { value: 'caterer', label: 'Caterers' },
    { value: 'performer', label: 'Performers' },
    { value: 'volunteer', label: 'Volunteers' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
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
        <div className="flex h-[calc(90vh-200px)]">
          {/* Left sidebar - Information items list */}
          <div className="w-1/3 border-r border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <button
                onClick={addInformationItem}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Information Item</span>
              </button>
            </div>
            
            <div className="divide-y divide-white/10">
              {informationItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedItemId === item.id
                      ? 'bg-purple-600/20'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium truncate">{item.title || 'Untitled'}</h3>
                    <div className="flex items-center space-x-1">
                      {!item.is_active && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">
                          Draft
                        </span>
                      )}
                      {item.media_items && item.media_items.length > 0 && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs flex items-center">
                          <Paperclip className="w-3 h-3 mr-1" />
                          {item.media_items.length}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                      {item.category || 'General'}
                    </span>
                    
                    {item.application_types.length > 0 ? (
                      <span className="bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {item.application_types.length}
                      </span>
                    ) : item.ticket_holders ? (
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center">
                        <Ticket className="w-3 h-3 mr-1" />
                        Ticket Holders
                      </span>
                    ) : (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                        Everyone
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {informationItems.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300">No information items yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click the button above to add your first item</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {editingItem ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Edit Information Item</h3>
                  <button
                    onClick={() => removeInformationItem(editingItem.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => updateInformationItem(editingItem.id, { title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={editingItem.category}
                      onChange={(e) => updateInformationItem(editingItem.id, { category: e.target.value })}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-gray-800">
                          {category}
                        </option>
                      ))}
                      <option value="__new__" className="bg-gray-800">+ Add New Category</option>
                    </select>
                    
                    {showNewCategoryInput && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="New category name"
                        />
                        <button
                          onClick={handleAddCategory}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={editingItem.content}
                    onChange={(e) => updateInformationItem(editingItem.id, { content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter content"
                  />
                </div>
                
                {/* Media Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Media Attachments
                  </label>
                  
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                      isDragActive 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300">Drag & drop files here or click to browse</p>
                    <p className="text-gray-400 text-xs mt-1">Images (JPG, PNG, GIF) and PDFs up to 5MB</p>
                  </div>
                  
                  {editingItem.media_items && editingItem.media_items.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {editingItem.media_items.map((media, index) => (
                        <div key={index} className="bg-white/5 border border-white/20 rounded p-2 relative group">
                          {media.type === 'image' ? (
                            <>
                              <div className="aspect-video bg-black/20 rounded overflow-hidden">
                                {media.url ? (
                                  <img 
                                    src={media.url} 
                                    alt={media.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Error';
                                    }}
                                  />
                                ) : media.file ? (
                                  <img 
                                    src={URL.createObjectURL(media.file)} 
                                    alt={media.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Image className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-300 truncate mt-1">{media.name}</p>
                            </>
                          ) : (
                            <>
                              <div className="aspect-video bg-red-500/10 rounded flex items-center justify-center">
                                <File className="w-8 h-8 text-red-400" />
                              </div>
                              <p className="text-xs text-gray-300 truncate mt-1">{media.name}</p>
                            </>
                          )}
                          
                          <button
                            onClick={() => removeMediaItem(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Visibility Settings */}
                <div>
                  <h4 className="text-white font-medium mb-3">Visibility Settings</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.is_active}
                          onChange={(e) => updateInformationItem(editingItem.id, { is_active: e.target.checked })}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <span className="text-gray-300">Active</span>
                      </label>
                      <p className="text-gray-400 text-xs ml-6 mt-1">
                        When disabled, this information will not be visible to anyone
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                         type="checkbox"
                         checked={editingItem.is_active}
                         onChange={(e) => updateInformationItem(editingItem.id, { is_active: e.target.checked })}
                         className="text-purple-600 focus:ring-purple-500 rounded"
                       />
                       <span className="text-gray-300">Active</span>
                     </label>
                     <p className="text-gray-400 text-xs ml-6 mt-1">
                       When disabled, this information will not be visible to anyone
                     </p>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                       Visible to Specific Attendee Types
                     </label>
                     <div className="flex flex-wrap gap-2">
                       <button
                         onClick={() => updateInformationItem(editingItem.id, { application_types: [] })}
                         className={`px-3 py-1 rounded-full text-sm ${
                           editingItem.application_types.length === 0
                             ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                             : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                         }`}
                       >
                         Everyone
                       </button>
                       
                       {applicationTypes.map(type => (
                         <button
                           key={type.value}
                           onClick={() => handleApplicationTypeToggle(type.value)}
                           className={`px-3 py-1 rounded-full text-sm ${
                             editingItem.application_types.includes(type.value)
                               ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                               : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                           }`}
                         >
                           {type.label}
                         </button>
                       ))}
                     </div>
                     <p className="text-gray-400 text-xs mt-2">
                       {editingItem.application_types.length === 0
                         ? 'This information is visible to everyone'
                         : `This information is only visible to selected attendee types`
                       }
                     </p>
                   </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select an item to edit</h3>
                  <p className="text-gray-400">
                    Choose an information item from the list or create a new one
                  </p>
                  <button
                    onClick={addInformationItem}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Item</span>
                  </button>
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