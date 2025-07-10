import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, DollarSign, Percent, Calendar, Tag, Gift, Users } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';

interface EventDeal {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'special';
  discount_value: number | null;
  discount_code: string;
  provider: string;
  provider_logo_url: string;
  application_types: string[];
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

interface EventDealsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deals: EventDeal[]) => void;
}

export function EventDealsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: EventDealsModalProps) {
  const { supabase } = useAuth();
  const [deals, setDeals] = useState<EventDeal[]>([
    {
      id: '1',
      title: 'Exclusive Tattoo Supply Discount',
      description: '20% off all tattoo supplies from InkMasters Supply Co. Valid during the event weekend.',
      discount_type: 'percentage',
      discount_value: 20,
      discount_code: 'INKFEST20',
      provider: 'InkMasters Supply Co.',
      provider_logo_url: 'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=200',
      application_types: ['artist'],
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      id: '2',
      title: 'Hotel Discount',
      description: 'Special rate at the Riverside Hotel for all event attendees. Use code TATTCON24 when booking.',
      discount_type: 'fixed',
      discount_value: 50,
      discount_code: 'TATTCON24',
      provider: 'Riverside Hotel',
      provider_logo_url: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=200',
      application_types: ['public'],
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    }
  ]);

  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<EventDeal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // In a real implementation, fetch deals from API
      fetchDeals();
    }
  }, [isOpen, eventId]);

  useEffect(() => {
    if (selectedDealId) {
      const deal = deals.find(deal => deal.id === selectedDealId);
      if (deal) {
        setEditingDeal(deal);
      }
    } else {
      setEditingDeal(null);
    }
  }, [selectedDealId, deals]);

  const fetchDeals = async () => {
    try {
      // In a real implementation, fetch from API
      console.log('Fetching deals for event:', eventId);
      
      if (supabase) {
        // Fetch deals
        const { data, error } = await supabase
          .from('event_deals')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching deals:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Fetched deals:', data);
          setDeals(data);
        } else {
          console.log('No deals found');
        }
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const addDeal = () => {
    const newId = Date.now().toString();
    const newDeal: EventDeal = {
      id: newId,
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: null,
      discount_code: '',
      provider: '',
      provider_logo_url: '',
      application_types: [],
      valid_from: new Date().toISOString(),
      valid_until: null,
      is_active: true
    };
    
    setDeals([...deals, newDeal]);
    setSelectedDealId(newId);
  };

  const updateDeal = (id: string, updates: Partial<EventDeal>) => {
    setDeals(deals.map(deal => 
      deal.id === id ? { ...deal, ...updates } : deal
    ));
    
    if (editingDeal && editingDeal.id === id) {
      setEditingDeal({ ...editingDeal, ...updates });
    }
  };

  const removeDeal = (id: string) => {
    setDeals(deals.filter(deal => deal.id !== id));
    if (selectedDealId === id) {
      setSelectedDealId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(deals);
      onClose();
    } catch (error) {
      console.error('Error saving deals:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplicationTypeToggle = (type: string) => {
    if (!editingDeal) return;
    
    const currentTypes = [...editingDeal.application_types];
    
    if (currentTypes.includes(type)) {
      updateDeal(editingDeal.id, { 
        application_types: currentTypes.filter(t => t !== type) 
      });
    } else {
      updateDeal(editingDeal.id, { 
        application_types: [...currentTypes, type] 
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed': return DollarSign;
      default: return Gift;
    }
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // File upload handling for provider logo
  const onDrop = async (acceptedFiles: File[]) => {
    if (!editingDeal || acceptedFiles.length === 0) return;
    
    try {
      setIsUploading(true);
      
      const file = acceptedFiles[0];
      
      // In a real implementation, upload to storage
      if (supabase) {
        // Set file size limit (2MB)
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          throw new Error(`File size exceeds 2MB limit`);
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }
        
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `deal_logo_${eventId}_${Date.now()}.${fileExt}`;
        const filePath = `events/${eventId}/deals/${fileName}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);
          
        // Update deal with the new logo URL
        updateDeal(editingDeal.id, { provider_logo_url: data.publicUrl });
      } else {
        // For demo purposes, use a data URL
        const reader = new FileReader();
        reader.onload = () => {
          updateDeal(editingDeal.id, { provider_logo_url: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      alert(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  if (!isOpen) return null;

  const applicationTypes = [
    { value: 'artist', label: 'Artists' },
    { value: 'public', label: 'Public' },
    { value: 'piercer', label: 'Piercers' },
    { value: 'trader', label: 'Traders' },
    { value: 'caterer', label: 'Caterers' },
    { value: 'caterer', label: 'Caterers' },
    { value: 'performer', label: 'Performers' },
    { value: 'volunteer', label: 'Volunteers' }
  ];

  const discountTypes = [
    { value: 'percentage', label: 'Percentage Discount', icon: Percent },
    { value: 'fixed', label: 'Fixed Amount Off', icon: DollarSign },
    { value: 'special', label: 'Special Offer', icon: Gift }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Event Deals & Offers</h2>
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
          {/* Left sidebar - Deals list */}
          <div className="w-1/3 border-r border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <button
                onClick={addDeal}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Deal or Offer</span>
              </button>
            </div>
            
            <div className="divide-y divide-white/10">
              {deals.map((deal) => {
                const DiscountIcon = getDiscountTypeIcon(deal.discount_type);
                
                return (
                  <div 
                    key={deal.id} 
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedDealId === deal.id
                        ? 'bg-purple-600/20'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedDealId(deal.id)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                        {deal.provider_logo_url ? (
                          <img 
                            src={deal.provider_logo_url} 
                            alt={deal.provider} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-2xl">🏷️</span>';
                            }}
                          />
                        ) : (
                          <DiscountIcon className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{deal.title || 'Untitled Deal'}</h3>
                        <p className="text-gray-400 text-xs truncate">{deal.provider || 'No provider'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${
                        deal.discount_type === 'percentage'
                          ? 'bg-purple-500/20 text-purple-400'
                          : deal.discount_type === 'fixed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-teal-500/20 text-teal-400'
                      }`}>
                        {deal.discount_type === 'percentage'
                          ? `${deal.discount_value}% off`
                          : deal.discount_type === 'fixed'
                          ? `£${deal.discount_value} off`
                          : 'Special offer'
                        }
                      </span>
                      
                      {!deal.is_active && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {deals.length === 0 && (
                <div className="p-8 text-center">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300">No deals or offers yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click the button above to add your first deal</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {editingDeal ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Edit Deal</h3>
                  <button
                    onClick={() => removeDeal(editingDeal.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deal Title
                    </label>
                    <input
                      type="text"
                      value={editingDeal.title}
                      onChange={(e) => updateDeal(editingDeal.id, { title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 20% Off Tattoo Supplies"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Provider/Sponsor
                    </label>
                    <input
                      type="text"
                      value={editingDeal.provider}
                      onChange={(e) => updateDeal(editingDeal.id, { provider: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., InkMasters Supply Co."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingDeal.description}
                    onChange={(e) => updateDeal(editingDeal.id, { description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe the deal and any conditions..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount Type
                    </label>
                    <select
                      value={editingDeal.discount_type}
                      onChange={(e) => updateDeal(editingDeal.id, { 
                        discount_type: e.target.value as 'percentage' | 'fixed' | 'special' 
                      })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {discountTypes.map(type => (
                        <option key={type.value} value={type.value} className="bg-gray-800">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editingDeal.discount_type !== 'special' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {editingDeal.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (£)'}
                      </label>
                      <div className="relative">
                        {editingDeal.discount_type === 'percentage' ? (
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        ) : (
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">£</div>
                        )}
                        <input
                          type="number"
                          value={editingDeal.discount_value || ''}
                          onChange={(e) => updateDeal(editingDeal.id, { 
                            discount_value: e.target.value ? parseFloat(e.target.value) : null 
                          })}
                          min="0"
                          step={editingDeal.discount_type === 'percentage' ? '1' : '0.01'}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={editingDeal.discount_type === 'percentage' ? '20' : '50.00'}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount Code
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={editingDeal.discount_code}
                          onChange={(e) => updateDeal(editingDeal.id, { discount_code: e.target.value.toUpperCase() })}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., TATTCON24"
                        />
                      </div>
                      <button
                        onClick={() => updateDeal(editingDeal.id, { discount_code: generateRandomCode() })}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valid From
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formatDate(editingDeal.valid_from)}
                        onChange={(e) => updateDeal(editingDeal.id, { 
                          valid_from: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() 
                        })}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valid Until (optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formatDate(editingDeal.valid_until)}
                        onChange={(e) => updateDeal(editingDeal.id, { 
                          valid_until: e.target.value ? new Date(e.target.value).toISOString() : null 
                        })}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Provider Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Provider Logo (optional)
                  </label>
                  
                  <div className="flex items-start space-x-4">
                    <div 
                      {...getRootProps()} 
                      className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                        isDragActive 
                          ? 'border-purple-500 bg-purple-500/10' 
                          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {isUploading ? (
                        <div className="py-4">
                          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                          <p className="text-gray-300 mt-2">Uploading...</p>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Gift className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-300">Drag & drop logo image here or click to browse</p>
                          <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF up to 2MB</p>
                        </div>
                      )}
                    </div>
                    
                    {editingDeal.provider_logo_url && (
                      <div className="w-24 h-24 bg-white/5 border border-white/20 rounded-lg overflow-hidden">
                        <img 
                          src={editingDeal.provider_logo_url} 
                          alt="Provider logo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Logo+Error';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <span className="text-gray-400 text-xs">Or enter URL directly:</span>
                    <input
                      type="url"
                      value={editingDeal.provider_logo_url || ''}
                      onChange={(e) => updateDeal(editingDeal.id, { provider_logo_url: e.target.value })}
                      className="flex-1 ml-2 px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                {/* Visibility Settings */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Visibility Settings</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingDeal.is_active}
                        onChange={(e) => updateDeal(editingDeal.id, { is_active: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300">Active</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Visibility Settings
                    </label>
                                        
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Visible to Specific Attendee Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateDeal(editingDeal.id, { application_types: [] })}
                        className={`px-3 py-1 rounded-full text-sm ${
                          editingDeal.application_types.length === 0
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        All Attendees
                      </button>
                      
                      {applicationTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => handleApplicationTypeToggle(type.value)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            editingDeal.application_types.includes(type.value)
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      {editingDeal.application_types.length === 0
                        ? 'This deal is visible to everyone'
                        : `This deal is only visible to selected attendee types`
                      }
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Deal Preview</h4>
                  <div className="bg-white/5 rounded p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      {editingDeal.provider_logo_url ? (
                        <img 
                          src={editingDeal.provider_logo_url} 
                          alt={editingDeal.provider} 
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-purple-500/20 rounded flex items-center justify-center">
                          <Gift className="w-6 h-6 text-purple-400" />
                        </div>
                      )}
                      <div>
                        <h5 className="text-white font-medium">{editingDeal.title || 'Deal Title'}</h5>
                        <p className="text-gray-400 text-sm">{editingDeal.provider || 'Provider Name'}</p>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{editingDeal.description || 'Deal description will appear here'}</p>

                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full ${
                        editingDeal.discount_type === 'percentage'
                          ? 'bg-purple-500/20 text-purple-400'
                          : editingDeal.discount_type === 'fixed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-teal-500/20 text-teal-400'
                      }`}>
                        {editingDeal.discount_type === 'percentage'
                          ? `${editingDeal.discount_value || 0}% off`
                          : editingDeal.discount_type === 'fixed'
                          ? `£${(editingDeal.discount_value || 0).toFixed(2)} off`
                          : 'Special offer'
                        }
                      </span>

                      {editingDeal.discount_code && (
                        <span className="bg-white/10 px-2 py-1 rounded text-white font-mono">
                          {editingDeal.discount_code}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">                      
                      {editingDeal.application_types.map(type => (
                        <span key={type} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                          {applicationTypes.find(t => t.value === type)?.label || type}
                        </span>
                      ))}
                      
                      {editingDeal.application_types.length === 0 && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                          Everyone
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a deal to edit</h3>
                  <p className="text-gray-400">
                    Choose a deal from the list or create a new one
                  </p>
                  <button
                    onClick={addDeal}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Deal</span>
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
            <span>{isSaving ? 'Saving...' : 'Save Deals'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}