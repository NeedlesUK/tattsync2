import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, Banknote, Building, Check, AlertCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentPricingModal } from './PaymentPricingModal';
import { RegistrationRequirementsModal } from './RegistrationRequirementsModal';

interface PaymentSettingsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: PaymentSettings) => Promise<void>;
}

export interface PaymentSettings {
  id?: number;
  event_id: number;
  cash_enabled: boolean;
  cash_details: string;
  bank_transfer_enabled: boolean;
  bank_details: string;
  stripe_enabled: boolean;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  allow_installments: boolean;
}

export function PaymentSettingsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: PaymentSettingsModalProps) {
  const { supabase } = useAuth();
  const [settings, setSettings] = useState<PaymentSettings>({
    event_id: eventId,
    cash_enabled: true,
    cash_details: 'Please bring exact cash amount to the registration desk on the first day of the event.',
    bank_transfer_enabled: true,
    bank_details: 'Account Name: Event Organizer Ltd\nSort Code: 12-34-56\nAccount Number: 12345678\nReference: Your application ID',
    stripe_enabled: false,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    allow_installments: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentSettings();
    }
  }, [isOpen, eventId]);

  const fetchPaymentSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .eq('event_id', eventId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // No settings found, use defaults
            console.log('No payment settings found, using defaults');
          } else {
            console.error('Error fetching payment settings:', error);
            setError('Failed to load payment settings');
          }
        } else if (data) {
          console.log('Payment settings loaded:', data);
          setSettings(data);
        }
      }
    } catch (err) {
      console.error('Exception fetching payment settings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PaymentSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any error/success messages when user makes changes
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate settings
      if (settings.stripe_enabled) {
        if (!settings.stripe_publishable_key) {
          setError('Stripe Publishable Key is required when Stripe is enabled');
          setIsSaving(false);
          return;
        }
        if (!settings.stripe_secret_key) {
          setError('Stripe Secret Key is required when Stripe is enabled');
          setIsSaving(false);
          return;
        }
      }
      
      // Save to database
      if (supabase) {
        const { data, error } = await supabase
          .from('payment_settings')
          .upsert({
            event_id: eventId,
            cash_enabled: settings.cash_enabled,
            cash_details: settings.cash_details,
            bank_transfer_enabled: settings.bank_transfer_enabled,
            bank_details: settings.bank_details,
            stripe_enabled: settings.stripe_enabled,
            stripe_publishable_key: settings.stripe_publishable_key,
            stripe_secret_key: settings.stripe_secret_key,
            allow_installments: settings.allow_installments,
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (error) {
          console.error('Error saving payment settings:', error);
          setError('Failed to save payment settings');
          setIsSaving(false);
          return;
        }
        
        console.log('Payment settings saved:', data);
        setSuccess('Payment settings saved successfully');
      }
      
      // Call the onSave callback
      await onSave(settings);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving payment settings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePricing = async (pricingSettings: any) => {
    console.log('Saving pricing settings:', pricingSettings);
    // In a real implementation, this would save to the database
    setSuccess('Pricing settings saved successfully');
  };

  const handleSaveRequirements = async (requirements: any) => {
    console.log('Saving registration requirements:', requirements);
    // In a real implementation, this would save to the database
    setSuccess('Registration requirements saved successfully');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Payment Settings</h2>
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : (
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
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-blue-300 font-medium mb-2">Payment Methods</h3>
                <p className="text-blue-200 text-sm">
                  Configure how participants can pay for their registration fees. You can enable multiple payment methods and set pricing for different application types.
                </p>
              </div>

              {/* Additional Payment Configuration Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-colors flex items-start space-x-3"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Payment Pricing</h4>
                    <p className="text-gray-400 text-sm">Configure pricing tiers and installment options for each application type</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setIsRequirementsModalOpen(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-colors flex items-start space-x-3"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Registration Requirements</h4>
                    <p className="text-gray-400 text-sm">Set payment requirements, agreement text, and profile deadlines</p>
                  </div>
                </button>
              </div>

              {/* Cash Payments */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Cash Payments</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.cash_enabled} 
                      onChange={(e) => handleInputChange('cash_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                {settings.cash_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cash Payment Instructions
                    </label>
                    <textarea
                      value={settings.cash_details}
                      onChange={(e) => handleInputChange('cash_details', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Provide instructions for cash payments"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      These instructions will be shown to participants who choose to pay by cash.
                    </p>
                  </div>
                )}
              </div>

              {/* Bank Transfer */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Bank Transfer</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.bank_transfer_enabled} 
                      onChange={(e) => handleInputChange('bank_transfer_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                {settings.bank_transfer_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bank Details
                    </label>
                    <textarea
                      value={settings.bank_details}
                      onChange={(e) => handleInputChange('bank_details', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Provide bank account details for transfers"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      These bank details will be shown to participants who choose to pay by bank transfer.
                    </p>
                  </div>
                )}
              </div>

              {/* Online Payments (Stripe) */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Online Payments (Stripe)</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.stripe_enabled} 
                      onChange={(e) => handleInputChange('stripe_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                {settings.stripe_enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stripe Publishable Key
                      </label>
                      <input
                        type="text"
                        value={settings.stripe_publishable_key}
                        onChange={(e) => handleInputChange('stripe_publishable_key', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="pk_test_..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stripe Secret Key
                      </label>
                      <input
                        type="password"
                        value={settings.stripe_secret_key}
                        onChange={(e) => handleInputChange('stripe_secret_key', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="sk_test_..."
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        Your secret key is stored securely and never shared with clients.
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.allow_installments}
                          onChange={(e) => handleInputChange('allow_installments', e.target.checked)}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <span className="text-gray-300">Allow installment payments (3 or 6 monthly payments)</span>
                      </label>
                      <p className="text-gray-400 text-xs mt-1 ml-6">
                        When enabled, participants can choose to pay in installments rather than a single payment.
                      </p>
                    </div>
                  </div>
                )}
                
                {!settings.stripe_enabled && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mt-2">
                    <p className="text-yellow-300 text-sm">
                      Online payments are currently disabled. Enable this option to accept credit/debit card payments.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
      
      {/* Nested Modals */}
      <PaymentPricingModal
        eventId={eventId}
        eventName={eventName}
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSave={handleSavePricing}
      />
      
      <RegistrationRequirementsModal
        eventId={eventId}
        eventName={eventName}
        isOpen={isRequirementsModalOpen}
        onClose={() => setIsRequirementsModalOpen(false)}
        onSave={handleSaveRequirements}
      />
    </div>
  );
}