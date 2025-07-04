import React, { useState } from 'react';
import { Save, X, Upload, Plus, Trash2, FileText } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface EntryFormProps {
  eventId: number;
  categories: Category[];
  entryTypes: { value: string; label: string }[];
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export function EntryForm({
  eventId,
  categories,
  entryTypes,
  onSubmit,
  onCancel,
  initialData
}: EntryFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    entry_type: initialData?.entry_type || entryTypes[0]?.value || 'tattoo',
    category_ids: initialData?.category_ids || [],
    images: initialData?.images || []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCategoryToggle = (categoryId: number) => {
    const currentCategories = [...formData.category_ids];
    
    if (currentCategories.includes(categoryId)) {
      handleInputChange('category_ids', currentCategories.filter(id => id !== categoryId));
    } else {
      handleInputChange('category_ids', [...currentCategories, categoryId]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }
    
    // In a real implementation, you would upload these files to storage
    // For now, we'll just store the File objects
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.entry_type) {
      newErrors.entry_type = 'Entry type is required';
    }
    
    if (formData.category_ids.length === 0) {
      newErrors.category_ids = 'Please select at least one category';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'Please upload at least one image';
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
      await onSubmit({
        ...formData,
        event_id: eventId
      });
    } catch (error) {
      console.error('Error submitting entry:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit entry. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
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
        <h2 className="text-xl font-bold text-white mb-4">Entry Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Entry Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.title ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Enter a title for your entry"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Entry Type <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.entry_type}
              onChange={(e) => handleInputChange('entry_type', e.target.value)}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.entry_type ? 'border-red-500' : 'border-white/20'
              }`}
            >
              {entryTypes.map(type => (
                <option key={type.value} value={type.value} className="bg-gray-800">
                  {type.label}
                </option>
              ))}
            </select>
            {errors.entry_type && (
              <p className="text-red-400 text-sm mt-1">{errors.entry_type}</p>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Describe your entry (technique, inspiration, etc.)"
          />
        </div>
      </div>
      
      {/* Categories */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
        <p className="text-gray-300 mb-4">Select the categories you want to enter</p>
        
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.category_ids.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="text-purple-600 focus:ring-purple-500 rounded"
              />
              <span className="text-gray-300">{category.name}</span>
            </label>
          ))}
        </div>
        
        {errors.category_ids && (
          <p className="text-red-400 text-sm mt-2">{errors.category_ids}</p>
        )}
      </div>
      
      {/* Images */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Images</h2>
        <p className="text-gray-300 mb-4">Upload images of your entry (maximum 5)</p>
        
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center mb-4">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">Drag and drop images here or click to browse</p>
          <p className="text-gray-400 text-sm mb-4">Supported formats: JPG, PNG, WebP (max 5MB each)</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="entry-images"
          />
          <label
            htmlFor="entry-images"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
          >
            Choose Images
          </label>
        </div>
        
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image: any, index: number) => (
              <div key={index} className="relative group">
                <div className="bg-white/5 rounded-lg p-3 text-center h-32 flex flex-col items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-gray-300 text-sm truncate">{image.name || `Image ${index + 1}`}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {errors.images && (
          <p className="text-red-400 text-sm mt-2">{errors.images}</p>
        )}
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
          <span>{isSubmitting ? 'Submitting...' : 'Submit Entry'}</span>
        </button>
      </div>
    </form>
  );
}