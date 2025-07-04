import React, { useState } from 'react';
import { Save, MapPin, Phone, Mail, Globe, Upload, Clock, Plus, Trash2 } from 'lucide-react';

interface StudioFormProps {
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export function StudioForm({
  onSubmit,
  onCancel,
  initialData
}: StudioFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    logo_url: initialData?.logo_url || '',
    business_hours: initialData?.business_hours || [
      { day_of_week: 0, is_closed: true, open_time: '10:00', close_time: '18:00' }, // Sunday
      { day_of_week: 1, is_closed: false, open_time: '10:00', close_time: '18:00' }, // Monday
      { day_of_week: 2, is_closed: false, open_time: '10:00', close_time: '18:00' }, // Tuesday
      { day_of_week: 3, is_closed: false, open_time: '10:00', close_time: '18:00' }, // Wednesday
      { day_of_week: 4, is_closed: false, open_time: '10:00', close_time: '18:00' }, // Thursday
      { day_of_week: 5, is_closed: false, open_time: '10:00', close_time: '18:00' }, // Friday
      { day_of_week: 6, is_closed: false, open_time: '10:00', close_time: '18:00' }  // Saturday
    ]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: any) => {
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

  const handleBusinessHourChange = (index: number, field: string, value: any) => {
    const updatedHours = [...formData.business_hours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    };
    
    handleInputChange('business_hours', updatedHours);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      
      // In a real implementation, you would upload this to storage
      // For now, we'll just create a temporary URL
      const tempUrl = URL.createObjectURL(e.target.files[0]);
      handleInputChange('logo_url', tempUrl);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Studio name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting studio:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save studio. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}
      
      {/* Basic Information */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Studio Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Studio Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Enter studio name"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo (Optional)
            </label>
            <div className="flex items-center space-x-4">
              {formData.logo_url ? (
                <div className="relative w-12 h-12">
                  <img
                    src={formData.logo_url}
                    alt="Studio Logo"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('logo_url', '');
                      setLogoFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 bg-white/5 border border-white/20 rounded flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="studio-logo"
                />
                <label
                  htmlFor="studio-logo"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm cursor-pointer transition-colors inline-block"
                >
                  {formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="studio@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.phone ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="+44 123 456 7890"
              />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Website (Optional)
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://www.example.com"
            />
          </div>
        </div>
      </div>
      
      {/* Address */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Studio Address</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Street Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.address ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="123 Main St"
            />
          </div>
          {errors.address && (
            <p className="text-red-400 text-sm mt-1">{errors.address}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.city ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="City"
            />
            {errors.city && (
              <p className="text-red-400 text-sm mt-1">{errors.city}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Postal Code"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Country <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.country ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Country"
            />
            {errors.country && (
              <p className="text-red-400 text-sm mt-1">{errors.country}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Business Hours */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Business Hours</h2>
        
        <div className="space-y-4">
          {formData.business_hours.map((hours, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-24">
                <span className="text-gray-300">{getDayName(hours.day_of_week)}</span>
              </div>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hours.is_closed}
                  onChange={(e) => handleBusinessHourChange(index, 'is_closed', e.target.checked)}
                  className="text-purple-600 focus:ring-purple-500 rounded"
                />
                <span className="text-gray-300 text-sm">Closed</span>
              </label>
              
              {!hours.is_closed && (
                <>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      value={hours.open_time}
                      onChange={(e) => handleBusinessHourChange(index, 'open_time', e.target.value)}
                      className="px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={hours.close_time}
                      onChange={(e) => handleBusinessHourChange(index, 'close_time', e.target.value)}
                      className="px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save Studio'}</span>
        </button>
      </div>
    </form>
  );
}