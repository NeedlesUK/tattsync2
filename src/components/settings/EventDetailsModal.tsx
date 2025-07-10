import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, MapPin, Users, Globe, AlertCircle, Image, Upload, Check } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';

interface EventDetailsModalProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventData) => Promise<void>;
  initialData?: EventData;
}

export interface EventData {
  id: number;
  name: string;
  description: string;
  event_slug: string;
  start_date: string;
  end_date: string;
  location: string;
  venue: string;
  max_attendees: number;
  status: 'draft' | 'published' | 'archived';
  logo_url?: string;
  banner_image_url?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export function EventDetailsModal({
  eventId,
  isOpen,
  onClose,
  onSave,
  initialData
}: EventDetailsModalProps) {
  const [formData, setFormData] = useState<EventData>({
    id: eventId,
    name: '',
    description: '',
    event_slug: '',
    start_date: '',
    end_date: '',
    location: '',
    venue: '',
    max_attendees: 500,
    status: 'draft',
    logo_url: '',
    banner_image_url: '',
    website: '',
    instagram: '',
    facebook: '',
    tiktok: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { supabase } = useAuth();
  const [isUploading, setIsUploading] = useState({
    logo: false,
    banner: false
  });

  // Setup dropzone for logo
  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0], 'logo');
    }
  }, [eventId]);
  
  const {
    getRootProps: getLogoRootProps,
    getInputProps: getLogoInputProps,
    isDragActive: isLogoDragActive
  } = useDropzone({
    onDrop: onDropLogo,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });
  
  // Setup dropzone for banner
  const onDropBanner = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0], 'banner');
    }
  }, [eventId]);
  
  const {
    getRootProps: getBannerRootProps,
    getInputProps: getBannerInputProps,
    isDragActive: isBannerDragActive
  } = useDropzone({
    onDrop: onDropBanner,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure dates are in the correct format for input fields
        start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
        end_date: initialData.end_date ? initialData.end_date.split('T')[0] : ''
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof EventData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.event_slug.trim()) {
      newErrors.event_slug = 'Event slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.event_slug)) {
      newErrors.event_slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = 'End date cannot be before start date';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving event details:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save event details. Please try again.'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    if (!supabase) {
      setErrors(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'banner_image_url']: 'Storage service not available'
      }));
      return;
    }
    
    try {
      setIsUploading(prev => ({ ...prev, [type]: true }));
      
      // Set file size limit (5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error(`File size exceeds 5MB limit`);
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${eventId}_${Date.now()}.${fileExt}`;
      const filePath = `events/${eventId}/${fileName}`;
      
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
        
      // Update form data with the new URL
      if (type === 'logo') {
        handleInputChange('logo_url', data.publicUrl);
      } else {
        handleInputChange('banner_image_url', data.publicUrl);
      }
      
    } catch (error: any) {
      console.error(`Error uploading ${type} image:`, error);
      setErrors(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'banner_image_url']: error.message || `Failed to upload ${type} image`
      }));
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };
  
  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    handleInputChange('event_slug', slug);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Event Details</h2>
            <p className="text-gray-300 text-sm">Update basic event information</p>
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
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.name ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter event name"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    This limits the number of tickets that can be sold for each day of the event.
                  </p>
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Slug (URL)
                    <span className="text-xs text-gray-400 ml-2">(Used for public event page)</span>
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.event_slug}
                        onChange={(e) => handleInputChange('event_slug', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.event_slug ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="event-url-slug"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.event_slug && (
                    <p className="text-red-400 text-sm mt-1">{errors.event_slug}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    This will be used for the public event page URL: /events/<span className="text-purple-400">{formData.event_slug}</span>
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Ticket Holders Per Day
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter event description"
                />
              </div>
            </div>

            {/* Dates and Location */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Dates and Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.start_date ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                  </div>
                  {errors.start_date && (
                    <p className="text-red-400 text-sm mt-1">{errors.start_date}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.end_date ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                  </div>
                  {errors.end_date && (
                    <p className="text-red-400 text-sm mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.location ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="City, Country"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-red-400 text-sm mt-1">{errors.location}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Venue
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.venue ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Convention center, hotel, etc."
                    />
                  </div>
                  {errors.venue && (
                    <p className="text-red-400 text-sm mt-1">{errors.venue}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Images */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Event Images</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Logo
                    <span className="text-xs text-gray-400 ml-2">(Square image recommended)</span>
                  </label>
                  <div 
                    {...getLogoRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                      isLogoDragActive 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <input {...getLogoInputProps()} />
                    {isUploading.logo ? (
                      <div className="py-4">
                        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-300 mt-2">Uploading...</p>
                      </div>
                    ) : formData.logo_url ? (
                      <div className="py-2">
                        <img 
                          src={formData.logo_url} 
                          alt="Logo preview" 
                          className="w-20 h-20 object-cover mx-auto rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Invalid+URL';
                          }}
                        />
                        <div className="flex items-center justify-center mt-2 space-x-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <p className="text-green-400 text-sm">Logo uploaded</p>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">Drag & drop or click to replace</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300">Drag & drop logo image here or click to browse</p>
                        <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                  {errors.logo_url && (
                    <p className="text-red-400 text-sm mt-1">{errors.logo_url}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Or enter URL directly:</span>
                    <input
                      type="url"
                      value={formData.logo_url || ''}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      className="flex-1 ml-2 px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Banner Image
                    <span className="text-xs text-gray-400 ml-2">(1200×400px recommended)</span>
                  </label>
                  <div 
                    {...getBannerRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                      isBannerDragActive 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <input {...getBannerInputProps()} />
                    {isUploading.banner ? (
                      <div className="py-4">
                        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-300 mt-2">Uploading...</p>
                      </div>
                    ) : formData.banner_image_url ? (
                      <div className="py-2">
                        <img 
                          src={formData.banner_image_url} 
                          alt="Banner preview" 
                          className="w-full h-32 object-cover mx-auto rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x400?text=Invalid+URL';
                          }}
                        />
                        <div className="flex items-center justify-center mt-2 space-x-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <p className="text-green-400 text-sm">Banner uploaded</p>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">Drag & drop or click to replace</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300">Drag & drop banner image here or click to browse</p>
                        <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                  {errors.banner_image_url && (
                    <p className="text-red-400 text-sm mt-1">{errors.banner_image_url}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Or enter URL directly:</span>
                    <input
                      type="url"
                      value={formData.banner_image_url || ''}
                      onChange={(e) => handleInputChange('banner_image_url', e.target.value)}
                      className="flex-1 ml-2 px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mt-2">
                <p className="text-blue-300 text-sm">
                  For best results, use a square image for the logo and a wide rectangular image for the banner.
                  You can use services like Pexels, Unsplash, or your own hosted images.
                </p>
              </div>
            </div>

            {/* Social Media and Website */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Social Media & Website</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instagram
                  </label>
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <input
                      type="text"
                      value={formData.instagram || ''}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Facebook
                  </label>
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                    <input
                      type="text"
                      value={formData.facebook || ''}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="page-name or profile URL"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    TikTok
                  </label>
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                      <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                      <path d="M15 8v8a4 4 0 0 1-4 4"></path>
                      <path d="M15 8h-4"></path>
                    </svg>
                    <input
                      type="text"
                      value={formData.tiktok || ''}
                      onChange={(e) => handleInputChange('tiktok', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mt-2">
                <p className="text-blue-300 text-sm">
                  Adding social media links will display them as buttons on the public event page, helping attendees connect with your event online.
                </p>
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Additional Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Attendees
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.max_attendees}
                      onChange={(e) => handleInputChange('max_attendees', parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="draft" className="bg-gray-800">Draft</option>
                    <option value="published" className="bg-gray-800">Published</option>
                    <option value="archived" className="bg-gray-800">Archived</option>
                  </select>
                </div>
              </div>
            </div>
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
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}