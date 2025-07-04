import React, { useState } from 'react';
import { X, Save, DollarSign, Clock, FileText } from 'lucide-react';

interface StudioServiceModalProps {
  studioId: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: ServiceData) => Promise<void>;
  initialData?: ServiceData;
}

export interface ServiceData {
  id?: string;
  name: string;
  description: string;
  price_from: number | null;
  price_to: number | null;
  duration_minutes: number | null;
  service_type: 'tattoo' | 'piercing' | 'other';
  is_active: boolean;
}

export function StudioServiceModal({
  studioId,
  isOpen,
  onClose,
  onSave,
  initialData
}: StudioServiceModalProps) {
  const [formData, setFormData] = useState<ServiceData>(
    initialData || {
      name: '',
      description: '',
      price_from: null,
      price_to: null,
      duration_minutes: 60,
      service_type: 'tattoo',
      is_active: true
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ServiceData, value: any) => {
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
      newErrors.name = 'Service name is required';
    }
    
    if (formData.price_from !== null && formData.price_to !== null && formData.price_from > formData.price_to) {
      newErrors.price_to = 'Maximum price cannot be less than minimum price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save service. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Edit Service' : 'Add Service'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="e.g., Small Tattoo, Ear Piercing"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Type
            </label>
            <select
              value={formData.service_type}
              onChange={(e) => handleInputChange('service_type', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="tattoo" className="bg-gray-800">Tattoo</option>
              <option value="piercing" className="bg-gray-800">Piercing</option>
              <option value="other" className="bg-gray-800">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe the service"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price From (£)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.price_from === null ? '' : formData.price_from}
                  onChange={(e) => handleInputChange('price_from', e.target.value ? parseFloat(e.target.value) : null)}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Min price"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price To (£)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.price_to === null ? '' : formData.price_to}
                  onChange={(e) => handleInputChange('price_to', e.target.value ? parseFloat(e.target.value) : null)}
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.price_to ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Max price"
                />
              </div>
              {errors.price_to && (
                <p className="text-red-400 text-sm mt-1">{errors.price_to}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={formData.duration_minutes === null ? '' : formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', e.target.value ? parseInt(e.target.value) : null)}
                min="15"
                step="15"
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Duration in minutes"
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="text-purple-600 focus:ring-purple-500 rounded"
              />
              <span className="text-gray-300">Active Service</span>
            </label>
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
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Saving...' : 'Save Service'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}