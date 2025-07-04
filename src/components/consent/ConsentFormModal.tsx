import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, CheckCircle, AlertCircle, FileText, Image, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ArtistSelector } from './ArtistSelector';

interface ConsentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: number;
  eventId: number;
  clientData?: any;
  onSubmit: (formData: any) => Promise<void>;
}

export function ConsentFormModal({ 
  isOpen, 
  onClose, 
  formId, 
  eventId,
  clientData,
  onSubmit 
}: ConsentFormModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<any>({});
  const [formStructure, setFormStructure] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && formId) {
      fetchFormStructure();
    }
  }, [isOpen, formId]);

  useEffect(() => {
    if (clientData && formStructure) {
      prefillFormData();
    }
  }, [clientData, formStructure]);

  const fetchFormStructure = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, fetch from API
      // Mock data for now
      const mockFormStructure = {
        id: formId,
        title: 'Medical History & Consent Form',
        description: 'Please complete this form before your procedure',
        requires_medical_history: true,
        sections: [
          {
            id: '1',
            title: 'Your Details',
            description: 'Please provide your personal information',
            is_required: true,
            display_order: 0,
            fields: [
              {
                id: '1-1',
                field_name: 'clientName',
                field_type: 'text',
                field_label: 'Name',
                field_placeholder: 'Your full name',
                is_required: true,
                display_order: 0
              },
              {
                id: '1-2',
                field_name: 'DOB',
                field_type: 'date',
                field_label: 'Date of Birth',
                is_required: true,
                display_order: 1
              },
              {
                id: '1-3',
                field_name: 'Phone',
                field_type: 'text',
                field_label: 'Phone',
                field_placeholder: 'Your contact number',
                is_required: true,
                display_order: 2
              },
              {
                id: '1-4',
                field_name: 'clientEmail',
                field_type: 'text',
                field_label: 'Email',
                field_placeholder: 'Your email address',
                is_required: true,
                display_order: 3
              },
              {
                id: '1-5',
                field_name: 'FullAddress',
                field_type: 'textarea',
                field_label: 'Address',
                field_placeholder: 'Your full address',
                is_required: true,
                display_order: 4
              }
            ]
          },
          {
            id: '2',
            title: 'Your Artist',
            description: 'Select the artist for your procedure',
            is_required: true,
            display_order: 1,
            fields: []
          },
          {
            id: '3',
            title: 'Age & Consent',
            description: 'Please confirm the following',
            is_required: true,
            display_order: 2,
            fields: [
              {
                id: '3-1',
                field_name: 'ageConfirm',
                field_type: 'checkbox',
                field_label: 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.',
                is_required: true,
                display_order: 0
              },
              {
                id: '3-2',
                field_name: 'riskConfirm',
                field_type: 'checkbox',
                field_label: 'I fully understand that there are risks with tattooing, known and unknown, can lead to injury, including but not limited to infection, scarring, difficulties in detecting melanoma and allergic reactions to tattoo pigment, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the tattoo application and I freely accept and expressly assume any and all risks.',
                is_required: true,
                display_order: 1
              },
              {
                id: '3-3',
                field_name: 'liabilityConfirm',
                field_type: 'checkbox',
                field_label: 'I understand neither the Artist, Venue nor Event Organiser is responsible for the meaning or spelling of the symbol or text that I have provided to them or chosen from the flash (design) sheets. Variations in colour/design may exist between the art I have selected and the actual tattoo. I also understand that over time, the colours and the clarity of my tattoo will fade due to natural dispersion of pigment under the skin. A tattoo is a permanent change to my appearance and can only be removed by laser or surgical means, which can be disfiguring and/or costly and which in all likelihood will not result in the restoration of my skin.',
                is_required: true,
                display_order: 2
              },
              {
                id: '3-4',
                field_name: 'mediaRelease',
                field_type: 'radio',
                field_label: 'I release all rights to any photographs and video taken of me and the tattoo and give consent in advance to their reproduction in print or electronic form.',
                field_options: ['Yes', 'No'],
                is_required: true,
                display_order: 3
              },
              {
                id: '3-5',
                field_name: 'idPhoto',
                field_type: 'image',
                field_label: 'Upload photo ID (optional)',
                is_required: false,
                display_order: 4
              }
            ]
          },
          {
            id: '4',
            title: 'Medical History',
            description: 'Please provide your medical information',
            is_required: true,
            display_order: 3,
            fields: [
              {
                id: '4-1',
                field_name: 'noIssues',
                field_type: 'checkbox',
                field_label: 'No previous tattoo issues or relevant medical issues',
                is_required: false,
                display_order: 0
              },
              {
                id: '4-2',
                field_name: 'medicalIssues',
                field_type: 'checkbox',
                field_label: 'Medical conditions (select all that apply)',
                field_options: [
                  'Diabetes',
                  'Epilepsy',
                  'Haemophilia',
                  'Pregnant or breast feeding',
                  'Taking blood thinning medication',
                  'Skin condition',
                  'Heart condition',
                  'Recipient of an organ or bone marrow transplant',
                  'Any blood-borne pathogens',
                  'Any transmittable diseases',
                  'Any allergies',
                  'Had any adverse reaction to a previous tattoo or products used',
                  'Fainted or other issues during a previous tattoo',
                  'Issues with tattoo healing',
                  'Other'
                ],
                is_required: false,
                display_order: 1
              },
              {
                id: '4-3',
                field_name: 'medicalDetails',
                field_type: 'textarea',
                field_label: 'Medical Details',
                field_placeholder: 'Please provide details of any medical conditions selected above',
                is_required: false,
                display_order: 2
              }
            ]
          },
          {
            id: '5',
            title: 'On The Day',
            description: 'Please confirm the following for the day of your procedure',
            is_required: true,
            display_order: 4,
            fields: [
              {
                id: '5-1',
                field_name: 'aftercareAdvice',
                field_type: 'checkbox',
                field_label: 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the artist for any healing issues. I understand that should I have any concerns they will be relayed to the artist immediately for further advice.',
                is_required: true,
                display_order: 0
              },
              {
                id: '5-2',
                field_name: 'eatBefore',
                field_type: 'checkbox',
                field_label: 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.',
                is_required: true,
                display_order: 1
              },
              {
                id: '5-3',
                field_name: 'unwell',
                field_type: 'checkbox',
                field_label: 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my artist and my appointment may be cancelled.',
                is_required: true,
                display_order: 2
              },
              {
                id: '5-4',
                field_name: 'noAlcohol',
                field_type: 'checkbox',
                field_label: 'I will not get tattooed under the influence of alcohol or drugs.',
                is_required: true,
                display_order: 3
              },
              {
                id: '5-5',
                field_name: 'marketingConsent',
                field_type: 'radio',
                field_label: 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.',
                field_options: ['Yes', 'No'],
                is_required: true,
                display_order: 4
              }
            ]
          }
        ]
      };
      
      setFormStructure(mockFormStructure);
    } catch (error) {
      console.error('Error fetching form structure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const prefillFormData = () => {
    const newFormData = { ...formData };
    
    // Prefill client data if available
    if (clientData) {
      if (clientData.name) newFormData.clientName = clientData.name;
      if (clientData.email) newFormData.clientEmail = clientData.email;
      if (clientData.phone) newFormData.Phone = clientData.phone;
      if (clientData.date_of_birth) newFormData.DOB = clientData.date_of_birth;
      if (clientData.address) newFormData.FullAddress = clientData.address;
      
      // Prefill medical history if available
      if (clientData.medical_conditions) {
        newFormData.medicalDetails = clientData.medical_conditions;
        
        // If there are medical conditions, uncheck the "no issues" box
        if (clientData.medical_conditions.trim()) {
          newFormData.noIssues = false;
        }
      }
      
      if (clientData.allergies) {
        const medicalIssues = newFormData.medicalIssues || [];
        if (clientData.allergies.trim()) {
          medicalIssues.push('Any allergies');
          newFormData.medicalIssues = medicalIssues;
        }
      }
    }
    
    setFormData(newFormData);
  };

  const handleInputChange = (fieldName: string, value: any) => {
    // Special handling for checkbox arrays
    if (fieldName === 'medicalIssues') {
      const currentValues = formData.medicalIssues || [];
      let newValues;
      
      if (Array.isArray(value)) {
        // Direct array assignment
        newValues = value;
      } else if (typeof value === 'object' && value.checked !== undefined) {
        // Checkbox event
        if (value.checked) {
          newValues = [...currentValues, value.value];
        } else {
          newValues = currentValues.filter((v: string) => v !== value.value);
        }
      } else {
        // Single value toggle
        if (currentValues.includes(value)) {
          newValues = currentValues.filter((v: string) => v !== value);
        } else {
          newValues = [...currentValues, value];
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: newValues
      }));
      
      // If medical issues are selected, uncheck "no issues"
      if (newValues.length > 0) {
        setFormData(prev => ({
          ...prev,
          noIssues: false
        }));
      }
    } 
    // Special handling for "no issues" checkbox
    else if (fieldName === 'noIssues' && value === true) {
      setFormData(prev => ({
        ...prev,
        noIssues: true,
        medicalIssues: [],
        medicalDetails: ''
      }));
    }
    // Default handling for other fields
    else {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleArtistSelect = (artist: any) => {
    setSelectedArtist(artist);
    setFormData(prev => ({
      ...prev,
      artistName: artist.name,
      artistEmail: artist.email,
      artistBooth: artist.booth_number || ''
    }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const section = formStructure.sections[stepIndex];
    if (!section) return true;
    
    const newErrors: Record<string, string> = {};
    
    // Special validation for artist selection step
    if (section.title === 'Your Artist' && !selectedArtist) {
      newErrors.artist = 'Please select an artist';
      setErrors(newErrors);
      return false;
    }
    
    // Validate required fields in the current section
    section.fields.forEach((field: any) => {
      if (field.is_required) {
        const value = formData[field.field_name];
        
        if (field.field_type === 'checkbox') {
          if (!value && field.field_options) {
            // For checkbox groups, at least one option must be selected
            const checkboxGroup = formData[field.field_name] || [];
            if (checkboxGroup.length === 0) {
              newErrors[field.field_name] = `${field.field_label} is required`;
            }
          } else if (!value) {
            // For single checkboxes
            newErrors[field.field_name] = `${field.field_label} must be checked`;
          }
        } else if (field.field_type === 'radio') {
          if (!value) {
            newErrors[field.field_name] = `Please select an option for ${field.field_label}`;
          }
        } else if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.field_name] = `${field.field_label} is required`;
        }
      }
    });
    
    // Special validation for medical history
    if (section.title === 'Medical History') {
      const noIssues = formData.noIssues;
      const medicalIssues = formData.medicalIssues || [];
      const medicalDetails = formData.medicalDetails;
      
      if (!noIssues && medicalIssues.length === 0) {
        newErrors.medicalIssues = 'Please select at least one medical condition or check "No previous issues"';
      }
      
      if (medicalIssues.length > 0 && (!medicalDetails || medicalDetails.trim() === '')) {
        newErrors.medicalDetails = 'Please provide details for the selected medical conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const submissionData = {
        form_id: formId,
        event_id: eventId,
        client_id: user?.id,
        artist_id: selectedArtist?.id,
        procedure_type: 'tattoo', // or 'piercing' based on context
        submission_data: formData
      };
      
      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const { field_name, field_type, field_label, field_placeholder, field_options, is_required } = field;
    const value = formData[field_name] || '';
    const hasError = !!errors[field_name];
    
    switch (field_type) {
      case 'text':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field_label}
              {is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field_name, e.target.value)}
              placeholder={field_placeholder}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                hasError ? 'border-red-500' : 'border-white/20'
              }`}
            />
            {hasError && (
              <p className="text-red-400 text-sm mt-1">{errors[field_name]}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field_label}
              {is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field_name, e.target.value)}
              placeholder={field_placeholder}
              rows={3}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                hasError ? 'border-red-500' : 'border-white/20'
              }`}
            />
            {hasError && (
              <p className="text-red-400 text-sm mt-1">{errors[field_name]}</p>
            )}
          </div>
        );
        
      case 'date':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field_label}
              {is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(field_name, e.target.value)}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                hasError ? 'border-red-500' : 'border-white/20'
              }`}
            />
            {hasError && (
              <p className="text-red-400 text-sm mt-1">{errors[field_name]}</p>
            )}
          </div>
        );
        
      case 'checkbox':
        if (field_options && field_options.length > 0) {
          // Multiple checkboxes (checkbox group)
          const selectedOptions = formData[field_name] || [];
          
          return (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field_label}
                {is_required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <div className="space-y-2">
                {field_options.map((option: string, index: number) => (
                  <label key={index} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option)}
                      onChange={(e) => handleInputChange(field_name, { value: option, checked: e.target.checked })}
                      className="mt-1 text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <span className="text-gray-300 text-sm">{option}</span>
                  </label>
                ))}
              </div>
              {hasError && (
                <p className="text-red-400 text-sm mt-1">{errors[field_name]}</p>
              )}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div className="mb-4">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleInputChange(field_name, e.target.checked)}
                  className="mt-1 text-purple-600 focus:ring-purple-500 rounded"
                />
                <span className="text-gray-300 text-sm">
                  {field_label}
                  {is_required && <span className="text-red-400 ml-1">*</span>}
                </span>
              </label>
              {hasError && (
                <p className="text-red-400 text-sm mt-1">{errors[field_name]}</p>
              )}
            </div>
          );
        }
        
      case 'radio':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field_label}
              {is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field_options && field_options.map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field_name}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(field_name, e.target.value)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300 text-sm">{option}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p className="text-red-400 text-sm mt-1">{errors[field_name]}</p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field_label}
              {is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(field_name, e.target.value)}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                hasError ? 'border-red-500' : 'border-white/20'
              }`}
            >
              <option value="">Select an option</option>
              {field_options && field_options.map((option: string, index: number) => (
                <option key={index} value={option} className="bg-gray-800">
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="text-red-400 text-sm mt-1">{errors[field_name]}</p>
            )}
          </div>
        );
        
      case 'file':
      case 'image':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field_label}
              {is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm mb-2">
                {field_type === 'image' ? 'Upload an image' : 'Upload a file'}
              </p>
              <input
                type="file"
                accept={field_type === 'image' ? 'image/*' : undefined}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    // In a real implementation, you'd handle file upload to storage
                    // For now, just store the file name
                    handleInputChange(field_name, e.target.files[0].name);
                  }
                }}
                className="hidden"
                id={`file-${field_name}`}
              />
              <label
                htmlFor={`file-${field_name}`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
              >
                Choose File
              </label>
              {value && (
                <p className="mt-2 text-sm text-gray-300">Selected: {value}</p>
              )}
            </div>
            {hasError && (
              <p className="text-red-400 text-sm mt-1">{errors[field_name]}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-purple-500/20 rounded-xl p-6 w-full max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!formStructure) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-purple-500/20 rounded-xl p-6 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Error</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-300">Failed to load form. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSection = formStructure.sections[currentStep];
  const isLastStep = currentStep === formStructure.sections.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">{formStructure.title}</h2>
            <p className="text-gray-300 text-sm">{formStructure.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {formStructure.sections.map((section: any, index: number) => (
              <div key={section.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep 
                    ? 'bg-green-600 text-white' 
                    : index === currentStep
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < formStructure.sections.length - 1 && (
                  <div className={`w-full h-1 mx-2 ${
                    index < currentStep ? 'bg-green-600' : 'bg-white/10'
                  }`} style={{ width: '20px' }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 pb-4">
            {formStructure.sections.map((section: any, index: number) => (
              <span key={`label-${section.id}`} className={index === currentStep ? 'text-purple-400' : ''}>
                {section.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <h3 className="text-lg font-semibold text-white mb-4">{currentSection.title}</h3>
          {currentSection.description && (
            <p className="text-gray-300 mb-6">{currentSection.description}</p>
          )}
          
          {/* Artist Selection Step */}
          {currentSection.title === 'Your Artist' ? (
            <ArtistSelector 
              eventId={eventId} 
              onSelectArtist={handleArtistSelect} 
              selectedArtist={selectedArtist}
              error={errors.artist}
            />
          ) : (
            // Regular form fields
            <div>
              {currentSection.fields.map((field: any) => renderField(field))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between p-6 border-t border-white/10">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Form</span>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}