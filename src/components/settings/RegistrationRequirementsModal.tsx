import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, DollarSign, Calendar, FileText, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegistrationRequirementsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (requirements: RegistrationRequirement[]) => Promise<void>;
}

export interface RegistrationRequirement {
  id?: number;
  event_id: number;
  application_type: string;
  requires_payment: boolean;
  payment_amount: number;
  agreement_text: string;
  profile_deadline_days: number;
}

export function RegistrationRequirementsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: RegistrationRequirementsModalProps) {
  const { supabase } = useAuth();
  const [requirements, setRequirements] = useState<RegistrationRequirement[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const applicationTypes = [
    { value: 'artist', label: 'Tattoo Artists' },
    { value: 'piercer', label: 'Piercers' },
    { value: 'trader', label: 'Traders' },
    { value: 'caterer', label: 'Caterers' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchRequirements();
    }
  }, [isOpen, eventId]);

  const fetchRequirements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        const { data, error } = await supabase
          .from('registration_requirements')
          .select('*')
          .eq('event_id', eventId);
          
        if (error) {
          console.error('Error fetching registration requirements:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('Fetched registration requirements:', data);
          setRequirements(data);
          
          // Set the first type as selected
          if (data.length > 0 && !selectedType) {
            setSelectedType(data[0].application_type);
          }
        } else {
          // Create default requirements for each application type
          const defaultRequirements = applicationTypes.map(type => ({
            event_id: eventId,
            application_type: type.value,
            requires_payment: true,
            payment_amount: 100,
            agreement_text: getDefaultAgreementText(type.value),
            profile_deadline_days: 30
          }));
          
          console.log('Created default registration requirements:', defaultRequirements);
          setRequirements(defaultRequirements);
          
          // Set the first type as selected
          if (defaultRequirements.length > 0) {
            setSelectedType(defaultRequirements[0].application_type);
          }
        }
      } else {
        // Mock data for when Supabase is not available
        const mockRequirements = applicationTypes.map(type => ({
          event_id: eventId,
          application_type: type.value,
          requires_payment: true,
          payment_amount: 100,
          agreement_text: getDefaultAgreementText(type.value),
          profile_deadline_days: 30
        }));
        
        setRequirements(mockRequirements);
        
        // Set the first type as selected
        if (mockRequirements.length > 0) {
          setSelectedType(mockRequirements[0].application_type);
        }
      }
    } catch (err) {
      console.error('Exception fetching registration requirements:', err);
      setError('Failed to load registration requirements');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAgreementText = (type: string) => {
    switch (type) {
      case 'artist':
        return `I agree to the following terms and conditions for participating as a tattoo artist at ${eventName}:

1. I confirm that I hold all necessary licenses and permits required to practice tattooing.
2. I will bring all my own equipment and supplies, including chairs, lamps, and tattoo machines.
3. I will follow all health and safety regulations and maintain a clean working environment.
4. I understand that I am responsible for obtaining consent forms from all clients.
5. I agree to pay the registration fee and understand that it is non-refundable.
6. I will complete my artist profile within the specified deadline.
7. I agree to the event's code of conduct and will behave professionally at all times.`;

      case 'piercer':
        return `I agree to the following terms and conditions for participating as a piercer at ${eventName}:

1. I confirm that I hold all necessary licenses and permits required to practice piercing.
2. I will bring all my own equipment and supplies, including chairs, lamps, and piercing tools.
3. I will follow all health and safety regulations and maintain a clean working environment.
4. I understand that I am responsible for obtaining consent forms from all clients.
5. I agree to pay the registration fee and understand that it is non-refundable.
6. I will complete my piercer profile within the specified deadline.
7. I agree to the event's code of conduct and will behave professionally at all times.`;

      case 'trader':
        return `I agree to the following terms and conditions for participating as a trader at ${eventName}:

1. I confirm that all products I sell comply with relevant laws and regulations.
2. I will bring all necessary equipment for my stall, including tables, displays, and payment systems.
3. I understand that I am responsible for the security of my products and cash.
4. I agree to pay the registration fee and understand that it is non-refundable.
5. I will complete my trader profile within the specified deadline.
6. I agree to the event's code of conduct and will behave professionally at all times.`;

      case 'caterer':
        return `I agree to the following terms and conditions for participating as a caterer at ${eventName}:

1. I confirm that I hold all necessary food safety certificates and licenses.
2. I will comply with all health and hygiene regulations for food preparation and service.
3. I will bring all necessary equipment for my food stall, including serving equipment and payment systems.
4. I agree to pay the registration fee and understand that it is non-refundable.
5. I will complete my caterer profile within the specified deadline.
6. I agree to the event's code of conduct and will behave professionally at all times.`;

      default:
        return `I agree to the terms and conditions for participating at ${eventName}.`;
    }
  };

  const getSelectedRequirement = () => {
    return requirements.find(r => r.application_type === selectedType) || null;
  };

  const updateRequirement = (type: string, updates: Partial<RegistrationRequirement>) => {
    setRequirements(prev => 
      prev.map(req => 
        req.application_type === type ? { ...req, ...updates } : req
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate requirements
      for (const req of requirements) {
        if (req.requires_payment && req.payment_amount <= 0) {
          setError('Payment amount must be greater than zero');
          setIsSaving(false);
          return;
        }
        
        if (!req.agreement_text.trim()) {
          setError('Agreement text is required');
          setIsSaving(false);
          return;
        }
        
        if (req.profile_deadline_days < 0) {
          setError('Profile deadline days must be a positive number');
          setIsSaving(false);
          return;
        }
      }
      
      // Save to database if using Supabase
      if (supabase) {
        for (const req of requirements) {
          const { error } = await supabase
            .from('registration_requirements')
            .upsert({
              id: req.id,
              event_id: eventId,
              application_type: req.application_type,
              requires_payment: req.requires_payment,
              payment_amount: req.payment_amount,
              agreement_text: req.agreement_text,
              profile_deadline_days: req.profile_deadline_days,
              updated_at: new Date().toISOString()
            });
            
          if (error) {
            console.error('Error saving registration requirement:', error);
            throw error;
          }
        }
        
        setSuccess('Registration requirements saved successfully');
      }
      
      // Call the onSave callback
      await onSave(requirements);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving registration requirements:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedRequirement = getSelectedRequirement();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Registration Requirements</h2>
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
          {/* Left sidebar - Application types */}
          <div className="w-1/4 border-r border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Application Types</h3>
            </div>
            
            <div className="divide-y divide-white/10">
              {applicationTypes.map((type) => {
                const requirement = requirements.find(r => r.application_type === type.value);
                const isActive = selectedType === type.value;
                
                return (
                  <div 
                    key={type.value} 
                    className={`p-4 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-purple-600/20'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <h4 className="text-white font-medium">{type.label}</h4>
                    <p className="text-gray-400 text-xs">
                      {requirement?.requires_payment 
                        ? `Payment: £${requirement.payment_amount}`
                        : 'No payment required'
                      }
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right side - Requirements editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : selectedRequirement ? (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                )}
                
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">Registration Requirements</h4>
                  <p className="text-blue-200 text-sm">
                    Configure the requirements for {applicationTypes.find(t => t.value === selectedType)?.label} registration,
                    including payment, agreement text, and profile completion deadline.
                  </p>
                </div>
                
                {/* Payment Requirements */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Payment Requirements</h3>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRequirement.requires_payment}
                        onChange={(e) => updateRequirement(selectedType!, { requires_payment: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300">Requires Payment</span>
                    </label>
                  </div>
                  
                  {selectedRequirement.requires_payment && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payment Amount (£)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          value={selectedRequirement.payment_amount}
                          onChange={(e) => updateRequirement(selectedType!, { payment_amount: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="100.00"
                        />
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        This is the base registration fee. Actual pricing can be configured in the Payment Pricing settings.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Agreement Text */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Agreement Text</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Terms & Conditions
                    </label>
                    <textarea
                      value={selectedRequirement.agreement_text}
                      onChange={(e) => updateRequirement(selectedType!, { agreement_text: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter the terms and conditions that participants must agree to..."
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      This text will be displayed during registration and participants must agree to it.
                    </p>
                  </div>
                </div>
                
                {/* Profile Deadline */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Profile Deadline</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Days to Complete Profile
                    </label>
                    <input
                      type="number"
                      value={selectedRequirement.profile_deadline_days}
                      onChange={(e) => updateRequirement(selectedType!, { profile_deadline_days: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="30"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Number of days participants have to complete their profile after registration.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select an application type</h3>
                  <p className="text-gray-400">
                    Choose an application type from the sidebar to configure requirements
                  </p>
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
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Requirements'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}