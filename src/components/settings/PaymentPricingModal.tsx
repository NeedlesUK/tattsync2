import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, DollarSign, Calendar, Clock, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentPricingModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pricingSettings: PricingSettings[]) => Promise<void>;
}

export interface PricingTier {
  id?: number;
  tier_name: string;
  months_before_event: number;
  full_price: number;
  installment_3_total: number | null;
  installment_6_total: number | null;
  installment_3_enabled: boolean;
  installment_6_enabled: boolean;
}

export interface PricingSettings {
  id?: number;
  event_id: number;
  application_type: string;
  enabled: boolean;
  pricing_tiers: PricingTier[];
}

export function PaymentPricingModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: PaymentPricingModalProps) {
  const { supabase } = useAuth();
  const [pricingSettings, setPricingSettings] = useState<PricingSettings[]>([]);
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
      fetchPricingSettings();
    }
  }, [isOpen, eventId]);

  const fetchPricingSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        // First, get all pricing settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('payment_pricing_settings')
          .select('*')
          .eq('event_id', eventId);
          
        if (settingsError) {
          console.error('Error fetching pricing settings:', settingsError);
          throw settingsError;
        }
        
        // Then get all pricing tiers
        const { data: tiersData, error: tiersError } = await supabase
          .from('payment_pricing_tiers')
          .select('*')
          .in('pricing_setting_id', settingsData?.map(s => s.id) || []);
          
        if (tiersError) {
          console.error('Error fetching pricing tiers:', tiersError);
          throw tiersError;
        }
        
        // Combine the data
        const combinedSettings = settingsData?.map(setting => {
          const tiers = tiersData?.filter(tier => tier.pricing_setting_id === setting.id) || [];
          return {
            ...setting,
            pricing_tiers: tiers
          };
        }) || [];
        
        // If we have settings, use them
        if (combinedSettings.length > 0) {
          console.log('Fetched pricing settings:', combinedSettings);
          setPricingSettings(combinedSettings);
          
          // Set the first type as selected
          if (combinedSettings.length > 0 && !selectedType) {
            setSelectedType(combinedSettings[0].application_type);
          }
        } else {
          // Otherwise, create default settings for each application type
          const defaultSettings = applicationTypes.map(type => ({
            event_id: eventId,
            application_type: type.value,
            enabled: true,
            pricing_tiers: [
              {
                tier_name: 'Early Bird',
                months_before_event: 3,
                full_price: 100,
                installment_3_total: 110,
                installment_6_total: 120,
                installment_3_enabled: true,
                installment_6_enabled: true
              },
              {
                tier_name: 'Regular',
                months_before_event: 1,
                full_price: 150,
                installment_3_total: 160,
                installment_6_total: 170,
                installment_3_enabled: true,
                installment_6_enabled: true
              },
              {
                tier_name: 'Late',
                months_before_event: 0,
                full_price: 200,
                installment_3_total: 210,
                installment_6_total: 220,
                installment_3_enabled: true,
                installment_6_enabled: true
              }
            ]
          }));
          
          console.log('Created default pricing settings:', defaultSettings);
          setPricingSettings(defaultSettings);
          
          // Set the first type as selected
          if (defaultSettings.length > 0) {
            setSelectedType(defaultSettings[0].application_type);
          }
        }
      } else {
        // Mock data for when Supabase is not available
        const mockSettings = applicationTypes.map(type => ({
          event_id: eventId,
          application_type: type.value,
          enabled: true,
          pricing_tiers: [
            {
              tier_name: 'Early Bird',
              months_before_event: 3,
              full_price: 100,
              installment_3_total: 110,
              installment_6_total: 120,
              installment_3_enabled: true,
              installment_6_enabled: true
            },
            {
              tier_name: 'Regular',
              months_before_event: 1,
              full_price: 150,
              installment_3_total: 160,
              installment_6_total: 170,
              installment_3_enabled: true,
              installment_6_enabled: true
            },
            {
              tier_name: 'Late',
              months_before_event: 0,
              full_price: 200,
              installment_3_total: 210,
              installment_6_total: 220,
              installment_3_enabled: true,
              installment_6_enabled: true
            }
          ]
        }));
        
        setPricingSettings(mockSettings);
        
        // Set the first type as selected
        if (mockSettings.length > 0) {
          setSelectedType(mockSettings[0].application_type);
        }
      }
    } catch (err) {
      console.error('Exception fetching pricing settings:', err);
      setError('Failed to load pricing settings');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedSettings = () => {
    return pricingSettings.find(s => s.application_type === selectedType) || null;
  };

  const updateSettings = (type: string, updates: Partial<PricingSettings>) => {
    setPricingSettings(prev => 
      prev.map(setting => 
        setting.application_type === type ? { ...setting, ...updates } : setting
      )
    );
  };

  const updateTier = (type: string, tierIndex: number, updates: Partial<PricingTier>) => {
    setPricingSettings(prev => 
      prev.map(setting => {
        if (setting.application_type === type) {
          const updatedTiers = [...setting.pricing_tiers];
          updatedTiers[tierIndex] = { ...updatedTiers[tierIndex], ...updates };
          return { ...setting, pricing_tiers: updatedTiers };
        }
        return setting;
      })
    );
  };

  const addTier = (type: string) => {
    const settings = pricingSettings.find(s => s.application_type === type);
    if (!settings) return;
    
    const newTier: PricingTier = {
      tier_name: 'New Tier',
      months_before_event: 0,
      full_price: 100,
      installment_3_total: 110,
      installment_6_total: 120,
      installment_3_enabled: true,
      installment_6_enabled: true
    };
    
    updateSettings(type, {
      pricing_tiers: [...settings.pricing_tiers, newTier]
    });
  };

  const removeTier = (type: string, tierIndex: number) => {
    const settings = pricingSettings.find(s => s.application_type === type);
    if (!settings) return;
    
    const updatedTiers = [...settings.pricing_tiers];
    updatedTiers.splice(tierIndex, 1);
    
    updateSettings(type, {
      pricing_tiers: updatedTiers
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate settings
      for (const setting of pricingSettings) {
        if (setting.enabled && setting.pricing_tiers.length === 0) {
          setError(`${applicationTypes.find(t => t.value === setting.application_type)?.label} must have at least one pricing tier`);
          setIsSaving(false);
          return;
        }
        
        for (const tier of setting.pricing_tiers) {
          if (!tier.tier_name) {
            setError('All tiers must have a name');
            setIsSaving(false);
            return;
          }
          
          if (tier.full_price <= 0) {
            setError('All prices must be greater than zero');
            setIsSaving(false);
            return;
          }
          
          if (tier.installment_3_enabled && (!tier.installment_3_total || tier.installment_3_total <= 0)) {
            setError('3-month installment total must be greater than zero');
            setIsSaving(false);
            return;
          }
          
          if (tier.installment_6_enabled && (!tier.installment_6_total || tier.installment_6_total <= 0)) {
            setError('6-month installment total must be greater than zero');
            setIsSaving(false);
            return;
          }
        }
      }
      
      // Save to database if using Supabase
      if (supabase) {
        // First, upsert the settings
        for (const setting of pricingSettings) {
          const { data: settingData, error: settingError } = await supabase
            .from('payment_pricing_settings')
            .upsert({
              id: setting.id,
              event_id: eventId,
              application_type: setting.application_type,
              enabled: setting.enabled,
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (settingError) {
            console.error('Error saving pricing setting:', settingError);
            throw settingError;
          }
          
          // Then, handle the tiers
          // First, delete any existing tiers
          if (setting.id) {
            const { error: deleteError } = await supabase
              .from('payment_pricing_tiers')
              .delete()
              .eq('pricing_setting_id', setting.id);
              
            if (deleteError) {
              console.error('Error deleting existing tiers:', deleteError);
              throw deleteError;
            }
          }
          
          // Then insert the new tiers
          if (setting.pricing_tiers.length > 0) {
            const { error: tiersError } = await supabase
              .from('payment_pricing_tiers')
              .insert(
                setting.pricing_tiers.map(tier => ({
                  pricing_setting_id: settingData.id,
                  tier_name: tier.tier_name,
                  months_before_event: tier.months_before_event,
                  full_price: tier.full_price,
                  installment_3_total: tier.installment_3_total,
                  installment_6_total: tier.installment_6_total,
                  installment_3_enabled: tier.installment_3_enabled,
                  installment_6_enabled: tier.installment_6_enabled
                }))
              );
              
            if (tiersError) {
              console.error('Error saving pricing tiers:', tiersError);
              throw tiersError;
            }
          }
        }
        
        setSuccess('Payment pricing settings saved successfully');
      }
      
      // Call the onSave callback
      await onSave(pricingSettings);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving pricing settings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedSettings = getSelectedSettings();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Payment Pricing</h2>
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
                const settings = pricingSettings.find(s => s.application_type === type.value);
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
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium">{type.label}</h4>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings?.enabled ?? true} 
                            onChange={(e) => {
                              e.stopPropagation();
                              updateSettings(type.value, { enabled: e.target.checked });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-xs">
                      {settings?.enabled 
                        ? `${settings.pricing_tiers.length} pricing tiers`
                        : 'Disabled'
                      }
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right side - Pricing tiers */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : selectedSettings ? (
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
                
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {applicationTypes.find(t => t.value === selectedType)?.label} Pricing
                  </h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSettings.enabled}
                      onChange={(e) => updateSettings(selectedType!, { enabled: e.target.checked })}
                      className="text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <span className="text-gray-300">Enabled</span>
                  </label>
                </div>
                
                {selectedSettings.enabled ? (
                  <>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-300 font-medium mb-2">Pricing Tiers</h4>
                      <p className="text-blue-200 text-sm">
                        Create different pricing tiers based on how far in advance participants register.
                        For each tier, you can set the full payment price and optional installment prices.
                      </p>
                    </div>
                    
                    {/* Pricing Tiers */}
                    {selectedSettings.pricing_tiers.map((tier, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              {tier.months_before_event > 2 ? (
                                <Calendar className="w-5 h-5 text-purple-400" />
                              ) : tier.months_before_event > 0 ? (
                                <Clock className="w-5 h-5 text-yellow-400" />
                              ) : (
                                <DollarSign className="w-5 h-5 text-green-400" />
                              )}
                            </div>
                            <input
                              type="text"
                              value={tier.tier_name}
                              onChange={(e) => updateTier(selectedType!, index, { tier_name: e.target.value })}
                              className="bg-transparent text-white font-medium border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none px-1"
                              placeholder="Tier Name"
                            />
                          </div>
                          <button
                            onClick={() => removeTier(selectedType!, index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            disabled={selectedSettings.pricing_tiers.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Months Before Event
                            </label>
                            <input
                              type="number"
                              value={tier.months_before_event}
                              onChange={(e) => updateTier(selectedType!, index, { months_before_event: parseInt(e.target.value) || 0 })}
                              min="0"
                              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-gray-400 text-xs mt-1">
                              When this tier becomes available (0 = available until the event)
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-white font-medium mb-3">Full Payment</h4>
                          <div className="flex items-center space-x-3">
                            <div className="relative flex-1">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="number"
                                value={tier.full_price}
                                onChange={(e) => updateTier(selectedType!, index, { full_price: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="0.01"
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="100.00"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">3-Month Installments</h4>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tier.installment_3_enabled}
                                onChange={(e) => updateTier(selectedType!, index, { installment_3_enabled: e.target.checked })}
                                className="text-purple-600 focus:ring-purple-500 rounded"
                              />
                              <span className="text-gray-300">Enabled</span>
                            </label>
                          </div>
                          
                          {tier.installment_3_enabled && (
                            <div className="flex items-center space-x-3">
                              <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                  type="number"
                                  value={tier.installment_3_total || ''}
                                  onChange={(e) => updateTier(selectedType!, index, { installment_3_total: parseFloat(e.target.value) || null })}
                                  min="0"
                                  step="0.01"
                                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="110.00"
                                />
                              </div>
                              <div className="text-gray-300 text-sm">
                                {tier.installment_3_total ? (
                                  <span>3 payments of £{(tier.installment_3_total / 3).toFixed(2)}</span>
                                ) : (
                                  <span>Enter total amount</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">6-Month Installments</h4>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tier.installment_6_enabled}
                                onChange={(e) => updateTier(selectedType!, index, { installment_6_enabled: e.target.checked })}
                                className="text-purple-600 focus:ring-purple-500 rounded"
                              />
                              <span className="text-gray-300">Enabled</span>
                            </label>
                          </div>
                          
                          {tier.installment_6_enabled && (
                            <div className="flex items-center space-x-3">
                              <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                  type="number"
                                  value={tier.installment_6_total || ''}
                                  onChange={(e) => updateTier(selectedType!, index, { installment_6_total: parseFloat(e.target.value) || null })}
                                  min="0"
                                  step="0.01"
                                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="120.00"
                                />
                              </div>
                              <div className="text-gray-300 text-sm">
                                {tier.installment_6_total ? (
                                  <span>6 payments of £{(tier.installment_6_total / 6).toFixed(2)}</span>
                                ) : (
                                  <span>Enter total amount</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addTier(selectedType!)}
                      className="w-full border-2 border-dashed border-white/20 rounded-lg p-4 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Pricing Tier</span>
                    </button>
                    
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                      <h4 className="text-yellow-300 font-medium mb-2">How Pricing Tiers Work</h4>
                      <p className="text-yellow-200 text-sm">
                        Pricing tiers are applied based on how many months before the event a participant registers.
                        For example, if you set a tier for 3 months before the event, participants registering 3 or more months
                        in advance will get that price. The system automatically selects the appropriate tier based on the registration date.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <h4 className="text-yellow-300 font-medium mb-2">Pricing Disabled</h4>
                    <p className="text-yellow-200 text-sm">
                      Pricing for {applicationTypes.find(t => t.value === selectedType)?.label} is currently disabled.
                      Enable it using the toggle above to configure pricing tiers.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select an application type</h3>
                  <p className="text-gray-400">
                    Choose an application type from the sidebar to configure pricing
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
            <span>{isSaving ? 'Saving...' : 'Save Pricing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}