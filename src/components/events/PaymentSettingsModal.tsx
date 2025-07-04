import React, { useState } from 'react';
import { X, CreditCard, Banknote, Building, Save, Eye, EyeOff, AlertCircle, CheckCircle, Settings, DollarSign } from 'lucide-react';
import { PaymentPricingModal } from './PaymentPricingModal';

interface PaymentSettings {
  cash_enabled: boolean;
  cash_details: string;
  bank_transfer_enabled: boolean;
  bank_details: string;
  stripe_enabled: boolean;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  allow_installments: boolean;
}

interface PaymentSettingsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: PaymentSettings) => void;
}

export function PaymentSettingsModal({ 
  eventId, 
  eventName, 
  isOpen, 
  onClose, 
  onSave 
}: PaymentSettingsModalProps) {
  const [settings, setSettings] = useState<PaymentSettings>({
    cash_enabled: true,
    cash_details: 'Cash payments can be made at the event registration desk. Please bring exact change when possible.',
    bank_transfer_enabled: true,
    bank_details: 'Bank transfers should be made to:\n\nAccount Name: Event Organizer\nSort Code: 12-34-56\nAccount Number: 12345678\n\nPlease use your application reference as the payment reference.',
    stripe_enabled: false,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    allow_installments: true
  });

  const [showStripeKeys, setShowStripeKeys] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<'success' | 'error' | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSettingChange = (field: keyof PaymentSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear stripe test result when keys change
    if (field === 'stripe_publishable_key' || field === 'stripe_secret_key') {
      setStripeTestResult(null);
    }
  };

  const testStripeConnection = async () => {
    if (!settings.stripe_publishable_key || !settings.stripe_secret_key) {
      setStripeTestResult('error');
      return;
    }

    setTestingStripe(true);
    try {
      // In real implementation, this would test the Stripe connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock validation - check if keys look valid
      const pubKeyValid = settings.stripe_publishable_key.startsWith('pk_');
      const secretKeyValid = settings.stripe_secret_key.startsWith('sk_');
      
      if (pubKeyValid && secretKeyValid) {
        setStripeTestResult('success');
      } else {
        setStripeTestResult('error');
      }
    } catch (error) {
      setStripeTestResult('error');
    } finally {
      setTestingStripe(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving payment settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePricing = async (pricingData: any) => {
    try {
      // In real implementation, save pricing data to API
      console.log('Saving pricing data:', pricingData);
    } catch (error) {
      console.error('Error saving pricing data:', error);
    }
  };

  const getEnabledPaymentMethods = () => {
    const methods = [];
    if (settings.cash_enabled) methods.push('Cash');
    if (settings.bank_transfer_enabled) methods.push('Bank Transfer');
    if (settings.stripe_enabled) methods.push('Online Payment');
    return methods;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Payment Settings</h2>
                <p className="text-gray-300 text-sm">{eventName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
            {/* Payment Methods Overview */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Payment Configuration</h3>
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Configure Pricing</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getEnabledPaymentMethods().length > 0 ? (
                  getEnabledPaymentMethods().map((method, index) => (
                    <span key={index} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      {method}
                    </span>
                  ))
                ) : (
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                    No payment methods enabled
                  </span>
                )}
              </div>
            </div>

            {/* Cash Payments */}
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Banknote className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-white font-medium">Cash Payments</h3>
                    <p className="text-gray-400 text-sm">Accept cash payments at the event</p>
                  </div>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cash_enabled}
                    onChange={(e) => handleSettingChange('cash_enabled', e.target.checked)}
                    className="text-green-600 focus:ring-green-500 rounded"
                  />
                  <span className="text-gray-300 text-sm">Enabled</span>
                </label>
              </div>

              {settings.cash_enabled && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Cash Payment Instructions
                  </label>
                  <textarea
                    value={settings.cash_details}
                    onChange={(e) => handleSettingChange('cash_details', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Provide instructions for cash payments..."
                  />
                </div>
              )}
            </div>

            {/* Bank Transfer */}
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Building className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">Bank Transfer</h3>
                    <p className="text-gray-400 text-sm">Accept bank transfers with account details</p>
                  </div>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bank_transfer_enabled}
                    onChange={(e) => handleSettingChange('bank_transfer_enabled', e.target.checked)}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-gray-300 text-sm">Enabled</span>
                </label>
              </div>

              {settings.bank_transfer_enabled && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Bank Account Details
                  </label>
                  <textarea
                    value={settings.bank_details}
                    onChange={(e) => handleSettingChange('bank_details', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide bank account details for transfers..."
                  />
                </div>
              )}
            </div>

            {/* Stripe Online Payments */}
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-white font-medium">Online Payments (Stripe)</h3>
                    <p className="text-gray-400 text-sm">Accept credit/debit cards and installment payments</p>
                  </div>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.stripe_enabled}
                    onChange={(e) => handleSettingChange('stripe_enabled', e.target.checked)}
                    className="text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span className="text-gray-300 text-sm">Enabled</span>
                </label>
              </div>

              {settings.stripe_enabled && (
                <div className="space-y-4">
                  {/* Stripe API Keys */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Publishable Key
                      </label>
                      <div className="relative">
                        <input
                          type={showStripeKeys ? 'text' : 'password'}
                          value={settings.stripe_publishable_key}
                          onChange={(e) => handleSettingChange('stripe_publishable_key', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="pk_..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showStripeKeys ? 'text' : 'password'}
                          value={settings.stripe_secret_key}
                          onChange={(e) => handleSettingChange('stripe_secret_key', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="sk_..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Show/Hide Keys Toggle */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowStripeKeys(!showStripeKeys)}
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                    >
                      {showStripeKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showStripeKeys ? 'Hide' : 'Show'} API Keys</span>
                    </button>

                    {/* Test Connection Button */}
                    <button
                      type="button"
                      onClick={testStripeConnection}
                      disabled={testingStripe || !settings.stripe_publishable_key || !settings.stripe_secret_key}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      {testingStripe ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Test Result */}
                  {stripeTestResult && (
                    <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                      stripeTestResult === 'success' 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}>
                      {stripeTestResult === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className={stripeTestResult === 'success' ? 'text-green-300' : 'text-red-300'}>
                        {stripeTestResult === 'success' 
                          ? 'Stripe connection successful!' 
                          : 'Stripe connection failed. Please check your API keys.'
                        }
                      </span>
                    </div>
                  )}

                  {/* Installment Options */}
                  <div className="border-t border-white/10 pt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allow_installments}
                        onChange={(e) => handleSettingChange('allow_installments', e.target.checked)}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-white font-medium">Allow Installment Payments</span>
                    </label>
                    <p className="text-gray-400 text-sm mt-1 ml-6">
                      Enable 3 and 6 month installment payment options for participants
                    </p>
                  </div>

                  {/* Stripe Info */}
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">Stripe Integration</h4>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>• Get your API keys from your Stripe Dashboard</li>
                      <li>• Use test keys for testing, live keys for production</li>
                      <li>• Installments are managed as Stripe subscriptions</li>
                      <li>• All payments are processed securely by Stripe</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Summary */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Payment Options Available to Participants</h3>
              <div className="space-y-2">
                {settings.cash_enabled && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <Banknote className="w-4 h-4" />
                    <span className="text-sm">Cash payment at event</span>
                  </div>
                )}
                {settings.bank_transfer_enabled && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Building className="w-4 h-4" />
                    <span className="text-sm">Bank transfer</span>
                  </div>
                )}
                {settings.stripe_enabled && (
                  <>
                    <div className="flex items-center space-x-2 text-purple-400">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">Online payment (full amount)</span>
                    </div>
                    {settings.allow_installments && (
                      <>
                        <div className="flex items-center space-x-2 text-purple-400">
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm">Online payment (3 installments)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-purple-400">
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm">Online payment (6 installments)</span>
                        </div>
                      </>
                    )}
                  </>
                )}
                {getEnabledPaymentMethods().length === 0 && (
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">No payment methods enabled</span>
                  </div>
                )}
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
              onClick={handleSave}
              disabled={isSaving || getEnabledPaymentMethods().length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save Payment Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Pricing Modal */}
      <PaymentPricingModal
        eventId={eventId}
        eventName={eventName}
        eventDate="2024-03-15" // In real implementation, get from event data
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSave={handleSavePricing}
      />
    </>
  );
}