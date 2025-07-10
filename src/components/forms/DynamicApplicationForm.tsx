import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, FileText, Upload, MapPin, Clock, Award, DollarSign, Building, ExternalLink, Image, Instagram, Facebook, Coffee, Utensils } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'file' | 'number' | 'url' | 'radio' | 'portfolio' | 'checkbox' | 'price-range';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface ApplicationFormData {
  // Base fields (required for all)
  applicant_name: string;
  applicant_email: string;
  date_of_birth: string;
  telephone: string;
  
  // Performer-specific fields
  performance_price_from?: number;
  performance_price_to?: number;
  performance_requirements?: string;
  
  // Dynamic fields stored in form_data
  [key: string]: any;
}

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface DynamicApplicationFormProps {
  applicationType: 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer' | 'caterer';
  eventId: number;
  eventName: string;
  useExistingAccount?: boolean;
  existingProfile?: ProfileData | null;
  onSubmit: (data: ApplicationFormData) => void;
  onCancel: () => void;
}

export function DynamicApplicationForm({ 
  applicationType, 
  eventId, 
  eventName, 
  useExistingAccount = false,
  existingProfile = null,
  onSubmit, 
  onCancel 
}: DynamicApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    applicant_name: '',
    applicant_email: '',
    date_of_birth: '',
    telephone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [portfolioType, setPortfolioType] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  // Pre-fill form data if using existing account
  useEffect(() => {
    if (useExistingAccount && existingProfile) {
      setFormData(prev => ({
        ...prev,
        applicant_name: existingProfile.name || '',
        applicant_email: existingProfile.email || '',
        telephone: existingProfile.phone || '',
        // Note: date_of_birth would need to be fetched from user profile in real implementation
      }));
    }
  }, [useExistingAccount, existingProfile]);

  // Base fields that all application types require
  const baseFields: FormField[] = [
    {
      id: 'applicant_name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      id: 'applicant_email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email address'
    },
    {
      id: 'date_of_birth',
      label: 'Date of Birth',
      type: 'date',
      required: true
    },
    {
      id: 'telephone',
      label: 'Telephone Number',
      type: 'tel',
      required: true,
      placeholder: 'Enter your phone number'
    }
  ];

  // Dynamic fields based on application type
  const getDynamicFields = (type: string): FormField[] => {
    switch (type) {
      case 'artist':
        return [
          {
            id: 'studio_name',
            label: 'Studio Name',
            type: 'text',
            required: true,
            placeholder: 'Enter your studio name'
          },
          {
            id: 'studio_address',
            label: 'Studio Address',
            type: 'textarea',
            required: true,
            placeholder: 'Enter your studio\'s full address'
          },
          {
            id: 'uk_licence',
            label: 'Do you have a current UK local authority tattoo licence?',
            type: 'radio',
            required: true,
            options: ['Yes', 'No']
          },
          {
            id: 'other_licence_details',
            label: 'What relevant licence or other documents do you hold?',
            type: 'textarea',
            required: false,
            placeholder: 'Please describe any relevant licences or documents you hold'
          },
          {
            id: 'portfolio_link',
            label: 'Link to Portfolio',
            type: 'portfolio',
            required: true
          }
        ];
      
      case 'piercer':
        return [
          {
            id: 'studio_name',
            label: 'Studio Name',
            type: 'text',
            required: true,
            placeholder: 'Enter your studio name'
          },
          {
            id: 'studio_address',
            label: 'Studio Address',
            type: 'textarea',
            required: true,
            placeholder: 'Enter your studio\'s full address'
          },
          {
            id: 'uk_licence',
            label: 'Do you have a current UK local authority piercing licence?',
            type: 'radio',
            required: true,
            options: ['Yes', 'No']
          },
          {
            id: 'other_licence_details',
            label: 'What relevant licence or other documents do you hold?',
            type: 'textarea',
            required: false,
            placeholder: 'Please describe any relevant licences or documents you hold'
          },
          {
            id: 'portfolio_link',
            label: 'Link to Portfolio',
            type: 'portfolio',
            required: true
          }
        ];
      
      case 'trader':
        return [
          {
            id: 'business_name',
            label: 'Business Name',
            type: 'text',
            required: true,
            placeholder: 'Your business/brand name'
          },
          {
            id: 'product_description',
            label: 'Description of Product or Service',
            type: 'textarea',
            required: true,
            placeholder: 'Describe what you sell or services you offer'
          },
          {
            id: 'portfolio_link',
            label: 'Online Presence',
            type: 'portfolio',
            required: true
          }
        ];
      
      case 'caterer':
        return [
          {
            id: 'business_name',
            label: 'Business Name',
            type: 'text',
            required: true,
            placeholder: 'Your catering business name'
          },
          {
            id: 'menu_description',
            label: 'Menu Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe your menu offerings in detail'
          },
          {
            id: 'service_types',
            label: 'What would you like to serve?',
            type: 'checkbox',
            required: true,
            options: ['Food (menu in description)', 'Hot drinks', 'Soft drinks', 'Sweets', 'Alcohol']
          },
          {
            id: 'portfolio_link',
            label: 'Online Presence',
            type: 'portfolio',
            required: true
          }
        ];
      
      case 'performer':
        return [
          {
            id: 'portfolio_link',
            label: 'Audition Material',
            type: 'portfolio',
            required: true
          },
          {
            id: 'performance_description',
            label: 'Performance Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe your performance, style, and what makes you unique'
          },
          {
            id: 'performance_price',
            label: 'Performance Fee Range (£)',
            type: 'price-range',
            required: true
          },
          {
            id: 'performance_requirements',
            label: 'Performance Requirements',
            type: 'textarea',
            required: false,
            placeholder: 'Any specific requirements for your performance (equipment, space, etc.)'
          }
        ];
      
      case 'caterer':
        return [
          {
            id: 'business_name',
            label: 'Business Name',
            type: 'text',
            required: true,
            placeholder: 'Your catering business name'
          },
          {
            id: 'menu_description',
            label: 'Menu Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe your menu offerings in detail'
          },
          {
            id: 'service_types',
            label: 'What would you like to serve?',
            type: 'checkbox',
            required: true,
            options: ['Food (menu in description)', 'Hot drinks', 'Soft drinks', 'Sweets', 'Alcohol']
          },
          {
            id: 'portfolio_link',
            label: 'Online Presence',
            type: 'portfolio',
            required: true
          }
        ];
      
      case 'volunteer':
        return [
          {
            id: 'skills_experience',
            label: 'Relevant Skills, Experience or Qualifications',
            type: 'textarea',
            required: true,
            placeholder: 'Describe any relevant skills, experience, or qualifications you have'
          }
        ];
      
      default:
        return [];
    }
  };

  const allFields = [...baseFields, ...getDynamicFields(applicationType)];

  const handleInputChange = (fieldId: string, value: string | string[] | number) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = formData[fieldId] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter((value: string) => value !== option);
    }
    
    handleInputChange(fieldId, newValues);
  };

  const handlePortfolioTypeChange = (type: string) => {
    setPortfolioType(type);
    setFormData(prev => ({
      ...prev,
      portfolio_type: type,
      portfolio_url: '',
      portfolio_username: ''
    }));
    setUploadedImages([]);
  };

  const handlePortfolioUrlChange = (username: string) => {
    let fullUrl = '';
    
    switch (portfolioType) {
      case 'instagram':
        fullUrl = username ? `https://instagram.com/${username.replace('@', '')}` : '';
        break;
      case 'facebook':
        fullUrl = username ? `https://facebook.com/${username}` : '';
        break;
      case 'tiktok':
        fullUrl = username ? `https://tiktok.com/@${username.replace('@', '')}` : '';
        break;
      case 'website':
        fullUrl = username;
        break;
      default:
        fullUrl = username;
    }
    
    setFormData(prev => ({
      ...prev,
      portfolio_username: username,
      portfolio_url: fullUrl
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedImages.length + files.length > 5) {
      setErrors(prev => ({
        ...prev,
        portfolio_images: 'Maximum 5 images allowed'
      }));
      return;
    }
    
    setUploadedImages(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      portfolio_images: [...uploadedImages, ...files]
    }));
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData(prev => ({
      ...prev,
      portfolio_images: newImages
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    allFields.forEach(field => {
      const value = formData[field.id];
      
      if (field.required && field.type !== 'checkbox' && field.type !== 'price-range') {
        if (!value || value.toString().trim() === '') {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
      
      if (field.type === 'checkbox' && field.required) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `Please select at least one option for ${field.label}`;
        }
      }
      
      if (field.type === 'price-range' && field.required) {
        if (!formData.performance_price_from || !formData.performance_price_to) {
          newErrors[field.id] = 'Please provide both minimum and maximum performance fees';
        } else if (formData.performance_price_from > formData.performance_price_to) {
          newErrors[field.id] = 'Minimum fee cannot be greater than maximum fee';
        }
      }
      
      if (field.validation && value) {
        if (field.validation.min !== undefined && Number(value) < field.validation.min) {
          newErrors[field.id] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation.max !== undefined && Number(value) > field.validation.max) {
          newErrors[field.id] = `${field.label} must be no more than ${field.validation.max}`;
        }
      }
    });

    // Special validation for conditional fields
    if ((applicationType === 'artist' || applicationType === 'piercer') && formData.uk_licence === 'No' && !formData.other_licence_details?.trim()) {
      newErrors.other_licence_details = 'Please describe what relevant licence or documents you hold';
    }
    
    // Validate portfolio
    if (getDynamicFields(applicationType).some(field => field.type === 'portfolio')) {
      if (!portfolioType) {
        newErrors.portfolio_link = 'Please select a portfolio type';
      } else if (portfolioType === 'upload' && uploadedImages.length === 0) {
        newErrors.portfolio_link = 'Please upload at least one image';
      } else if (portfolioType !== 'upload' && !formData.portfolio_url) {
        newErrors.portfolio_link = 'Please provide your portfolio link';
      }
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
      // Separate base fields from dynamic fields
      const { 
        applicant_name, 
        applicant_email, 
        date_of_birth, 
        telephone, 
        performance_price_from,
        performance_price_to,
        performance_requirements,
        ...dynamicData 
      } = formData;
      
      const applicationData: ApplicationFormData = {
        applicant_name,
        applicant_email,
        date_of_birth,
        telephone,
        form_data: dynamicData
      };

      // Add performer-specific fields if applicable
      if (applicationType === 'performer') {
        applicationData.performance_price_from = performance_price_from;
        applicationData.performance_price_to = performance_price_to;
        applicationData.performance_requirements = performance_requirements;
      }
      
      await onSubmit(applicationData);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return User;
      case 'email': return Mail;
      case 'tel': return Phone;
      case 'date': return Calendar;
      case 'textarea': return FileText;
      case 'file': return Upload;
      case 'url': return MapPin;
      case 'number': return Clock;
      case 'select': return Award;
      case 'portfolio': return Image;
      case 'checkbox': return FileText;
      case 'price-range': return DollarSign;
      default: return FileText;
    }
  };

  const renderPriceRangeField = () => {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Performance Fee Range (£)
          <span className="text-red-400 ml-1">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Minimum Fee</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={formData.performance_price_from || ''}
                onChange={(e) => handleInputChange('performance_price_from', Number(e.target.value))}
                placeholder="0"
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.performance_price ? 'border-red-500' : 'border-white/20'
                }`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Maximum Fee</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={formData.performance_price_to || ''}
                onChange={(e) => handleInputChange('performance_price_to', Number(e.target.value))}
                placeholder="0"
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.performance_price ? 'border-red-500' : 'border-white/20'
                }`}
              />
            </div>
          </div>
        </div>
        {errors.performance_price && (
          <p className="text-red-400 text-sm">{errors.performance_price}</p>
        )}
      </div>
    );
  };

  const renderPortfolioField = () => {
    const portfolioOptions = [
      { value: 'instagram', label: 'Instagram', icon: Instagram, prefix: 'https://instagram.com/', placeholder: 'username' },
      { value: 'facebook', label: 'Facebook', icon: Facebook, prefix: 'https://facebook.com/', placeholder: 'page-name' },
      { value: 'tiktok', label: 'TikTok', icon: ExternalLink, prefix: 'https://tiktok.com/@', placeholder: 'username' },
      { value: 'website', label: 'Website', icon: ExternalLink, prefix: '', placeholder: 'https://yourwebsite.com' },
      { value: 'upload', label: 'Upload Images', icon: Upload, prefix: '', placeholder: '' }
    ];

    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          {applicationType === 'performer' ? 'Audition Material' : 
           applicationType === 'trader' || applicationType === 'caterer' ? 'Online Presence' : 
           'Link to Portfolio'}
          <span className="text-red-400 ml-1">*</span>
        </label>
        
        {/* Portfolio Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {portfolioOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePortfolioTypeChange(option.value)}
                className={`p-3 border rounded-lg transition-all flex items-center space-x-2 ${
                  portfolioType === option.value
                    ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Portfolio Input Based on Type */}
        {portfolioType && portfolioType !== 'upload' && (
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">
              {portfolioType === 'website' ? 'Website URL' : `${portfolioOptions.find(o => o.value === portfolioType)?.label} Username`}
            </label>
            <div className="flex items-center space-x-2">
              {portfolioType !== 'website' && (
                <span className="text-gray-400 text-sm bg-white/5 px-3 py-2 rounded-l-lg border border-r-0 border-white/20">
                  {portfolioOptions.find(o => o.value === portfolioType)?.prefix}
                </span>
              )}
              <input
                type={portfolioType === 'website' ? 'url' : 'text'}
                value={formData.portfolio_username || ''}
                onChange={(e) => handlePortfolioUrlChange(e.target.value)}
                placeholder={portfolioOptions.find(o => o.value === portfolioType)?.placeholder}
                className={`flex-1 px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  portfolioType !== 'website' ? 'rounded-l-none' : ''
                } ${errors.portfolio_link ? 'border-red-500' : 'border-white/20'}`}
              />
            </div>
            {formData.portfolio_url && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <ExternalLink className="w-4 h-4" />
                <span>Preview: {formData.portfolio_url}</span>
              </div>
            )}
          </div>
        )}

        {/* Image Upload */}
        {portfolioType === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Upload up to 5 images of your work</p>
              <p className="text-gray-400 text-sm mb-4">Supported formats: JPG, PNG, WebP (max 5MB each)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="portfolio-upload"
              />
              <label
                htmlFor="portfolio-upload"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
              >
                Choose Images
              </label>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <p className="text-xs text-gray-400 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {errors.portfolio_link && (
          <p className="text-red-400 text-sm">{errors.portfolio_link}</p>
        )}
      </div>
    );
  };

  const renderField = (field: FormField) => {
    const Icon = getFieldIcon(field.type);
    const value = formData[field.id] || '';
    const hasError = !!errors[field.id];

    if (field.type === 'portfolio') {
      return (
        <div key={field.id}>
          {renderPortfolioField()}
        </div>
      );
    }

    if (field.type === 'price-range') {
      return (
        <div key={field.id}>
          {renderPriceRangeField()}
        </div>
      );
    }

    if (field.type === 'radio') {
      return (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          <div className="flex space-x-4">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
          {hasError && (
            <p className="text-red-400 text-sm">{errors[field.id]}</p>
          )}
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                  className="text-purple-600 focus:ring-purple-500 rounded"
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
          {hasError && (
            <p className="text-red-400 text-sm">{errors[field.id]}</p>
          )}
        </div>
      );
    }

    // Show conditional field for "other licence details" only when UK licence is "No"
    if (field.id === 'other_licence_details' && formData.uk_licence !== 'No') {
      return null;
    }

    // Show performance requirements field for performers
    if (field.id === 'performance_requirements') {
      return (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              value={formData.performance_requirements || ''}
              onChange={(e) => handleInputChange('performance_requirements', e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                hasError ? 'border-red-500' : 'border-white/20'
              }`}
            />
          </div>
          
          {hasError && (
            <p className="text-red-400 text-sm">{errors[field.id]}</p>
          )}
        </div>
      );
    }

    return (
      <div key={field.id} className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
          {field.id === 'other_licence_details' && (
            <span className="text-gray-400 text-sm ml-2">(Required if no UK licence)</span>
          )}
        </label>
        
        <div className="relative">
          {field.type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={field.id === 'studio_address' ? 2 : 3}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                hasError ? 'border-red-500' : 'border-white/20'
              }`}
            />
          ) : field.type === 'select' ? (
            <select
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                hasError ? 'border-red-500' : 'border-white/20'
              }`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option} value={option} className="bg-gray-800">
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <>
              <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={field.type}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                min={field.validation?.min}
                max={field.validation?.max}
                disabled={useExistingAccount && ['applicant_name', 'applicant_email', 'telephone'].includes(field.id)}
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasError ? 'border-red-500' : 'border-white/20'
                }`}
              />
            </>
          )}
        </div>
        
        {hasError && (
          <p className="text-red-400 text-sm">{errors[field.id]}</p>
        )}
      </div>
    );
  };

  const getApplicationTypeTitle = (type: string) => {
    switch (type) {
      case 'artist': return 'Tattoo Artist Application';
      case 'piercer': return 'Piercer Application';
      case 'performer': return 'Performer Application';
      case 'trader': return 'Trader Application';
      case 'volunteer': return 'Volunteer Application';
      case 'caterer': return 'Caterer Application';
      default: return 'Application';
    }
  };

  const getSectionTitle = (type: string) => {
    switch (type) {
      case 'artist': return 'Studio & Portfolio Information';
      case 'piercer': return 'Studio & Portfolio Information';
      case 'trader': return 'Business & Online Presence';
      case 'caterer': return 'Business & Menu Information';
      case 'caterer': return 'Business & Menu Information';
      case 'performer': return 'Performance Information';
      case 'volunteer': return 'Skills & Experience';
      default: return 'Additional Information';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {getApplicationTypeTitle(applicationType)}
          </h2>
          <p className="text-gray-300">
            Apply to participate in <span className="text-purple-400 font-medium">{eventName}</span>
          </p>
          {useExistingAccount && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">
                Using your TattSync account - some fields are pre-filled from your profile
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base Information Section */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baseFields.map(field => renderField(field))}
            </div>
          </div>

          {/* Dynamic Fields Section */}
          {getDynamicFields(applicationType).length > 0 && (
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {getSectionTitle(applicationType)}
              </h3>
              <div className="space-y-4">
                {getDynamicFields(applicationType).map(field => renderField(field))}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              By submitting this application, you agree to the event terms and conditions. 
              You will be notified via email about the status of your application.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Application</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}