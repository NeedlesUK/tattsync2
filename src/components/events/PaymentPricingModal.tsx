import React, { useState } from 'react';
import { X, Calendar, CreditCard, Save, Plus, Trash2, AlertCircle, Clock, DollarSign } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  months_before_event: number;
  full_price: number;
  installment_3_total: number;
  installment_6_total: number;
  installment_3_enabled: boolean;
  installment_6_enabled: boolean;
}

interface ApplicationTypePricing {
  application_type: string;
  enabled: boolean;
  pricing_tiers: PricingTier[];
}

interface PaymentPricingModalProps {
  eventId: number;
  eventName: string;
  eventDate: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pricing: ApplicationTypePricing[]) => void;
}

export function PaymentPricingModal({ 
  eventId, 
  eventName, 
  eventDate,
  isOpen, 
  onClose, 
  onSave 
}: PaymentPricingModalProps) {
  const [pricingData, setPricingData] = useState<ApplicationTypePricing[]>([
    {
      application_type: 'artist',
      enabled: true,
      pricing_tiers: [
        {
          id: '1',
          name: 'Early Bird (8+ months)',
          months_before_event: 8,
          full_price: 275.00,
          installment_3_total: 300.00,
          installment_6_total: 300.00,
          installment_3_enabled: true,
          installment_6_enabled: true
        },
        {
          id: '2',
          name: 'Standard (5-7 months)',
          months_before_event: 5,
          full_price: 275.00,
          installment_3_total: 300.00,
          installment_6_total: 0.00,
          installment_3_enabled: true,
          installment_6_enabled: false
        },
        {
          id: '3',
          name: 'Late Registration (0-4 months)',
          months_before_event: 0,
          full_price: 275.00,
          installment_3_total: 0.00,
          installment_6_total: 0.00,
          installment_3_enabled: false,
          installment_6_enabled: false
        }
      ]
    },
    {
      application_type: 'piercer',
      enabled: true,
      pricing_tiers: [
        {
          id: '1',
          name: 'Early Bird (8+ months)',
          months_before_event: 8,
          full_price: 225.00,
          installment_3_total: 250.00,
          installment_6_total: 250.00,
          installment_3_enabled: true,
          installment_6_enabled: true
        },
        {
          id: '2',
          name: 'Standard (5-7 months)',
          months_before_event: 5,
          full_price: 225.00,
          installment_3_total: 250.00,
          installment_6_total: 0.00,
          installment_3_enabled: true,
          installment_6_enabled: false
        },
        {
          id: '3',
          name: 'Late Registration (0-4 months)',
          months_before_event: 0,
          full_price: 225.00,
          installment_3_total: 0.00,
          installment_6_total: 0.00,
          installment_3_enabled: false,
          installment_6_enabled: false
        }
      ]
    },
    {
      application_type: 'trader',
      enabled: true,
      pricing_tiers: [
        {
          id: '1',
          name: 'Early Bird (8+ months)',
          months_before_event: 8,
          full_price: 350.00,
          installment_3_total: 375.00,
          installment_6_total: 375.00,
          installment_3_enabled: true,
          installment_6_enabled: true
        },
        {
          id: '2',
          name: 'Standard (5-7 months)',
          months_before_event: 5,
          full_price: 350.00,
          installment_3_total: 375.00,
          installment_6_total: 0.00,
          installment_3_enabled: true,
          installment_6_enabled: false
        },
        {
          id: '3',
          name: 'Late Registration (0-4 months)',
          months_before_event: 0,
          full_price: 350.00,
          installment_3_total: 0.00,
          installment_6_total: 0.00,
          installment_3_enabled: false,
          installment_6_enabled: false
        }
      ]
    },
    {
      application_type: 'caterer',
      enabled: true,
      pricing_tiers: [
        {
          id: '1',
          name: 'Early Bird (8+ months)',
          months_before_event: 8,
          full_price: 450.00,
          installment_3_total: 475.00,
          installment_6_total: 475.00,
          installment_3_enabled: true,
          installment_6_enabled: true
        },
        {
          id: '2',
          name: 'Standard (5-7 months)',
          months_before_event: 5,
          full_price: 450.00,
          installment_3_total: 475.00,
          installment_6_total: 0.00,
          installment_3_enabled: true,
          installment_6_enabled: false
        },
        {
          id: '3',
          name: 'Late Registration (0-4 months)',
          months_before_event: 0,
          full_price: 450.00,
          installment_3_total: 0.00,
          installment_6_total: 0.00,
          installment_3_enabled: false,
          installment_6_enabled: false
        }
      ]
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const getApplicationTypeInfo = (type: string) => {
    const info = {
      artist: { title: 'Tattoo Artist', icon: '🎨' },
      piercer: { title: 'Piercer', icon: '💎' },
      trader: { title: 'Trader', icon: '🛍️' },
      caterer: { title: 'Caterer', icon: '🍕' }
    };
    return info[type as keyof typeof info] || { title: type, icon: '📋' };
  };

  const handleTypeToggle = (typeIndex: number) => {
    setPricingData(prev => prev.map((type, i) => 
      i === typeIndex ? { ...type, enabled: !type.enabled } : type
    ));
  };

  const handleTierUpdate = (typeIndex: number, tierIndex: number, field: keyof PricingTier, value: any) => {
    setPricingData(prev => prev.map((type, i) => 
      i === typeIndex ? {
        ...type,
        pricing_tiers: type.pricing_tiers.map((tier, j) => 
          j === tierIndex ? { ...tier, [field]: value } : tier
        )
      } : type
    ));
  };

  const addPricingTier = (typeIndex: number) => {
    const newTier: PricingTier = {
      id: Date.now().toString(),
      name: 'New Pricing Tier',
      months_before_event: 1,
      full_price: 0.00,
      installment_3_total: 0.00,
      installment_6_total: 0.00,
      installment_3_enabled: false,
      installment_6_enabled: false
    };

    setPricingData(prev => prev.map((type, i) => 
      i === typeIndex ? {
        ...type,
        pricing_tiers: [...type.pricing_tiers, newTier]
      } : type
    ));
  };

  const removePricingTier = (typeIndex: number, tierIndex: number) => {
    setPricingData(prev => prev.map((type, i) => 
      i === typeIndex ? {
        ...type,
        pricing_tiers: type.pricing_tiers.filter((_, j) => j !== tierIndex)
      } : type
    ));
  };

  const calculateInstallmentAmount = (total: number, installments: number) => {
    return (total / installments).toFixed(2);
  };

  const getCurrentPricingTier = (applicationTypeIndex: number) => {
    const type = pricingData[applicationTypeIndex];
    const eventDateObj = new Date(eventDate);
    const currentDate = new Date();
    const monthsUntilEvent = Math.ceil((eventDateObj.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // Find the appropriate tier based on months until event
    const applicableTier = type.pricing_tiers
      .sort((a, b) => b.months_before_event - a.months_before_event)
      .find(tier => monthsUntilEvent >= tier.months_before_event);

    return applicableTier || type.pricing_tiers[type.pricing_tiers.length - 1];
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(pricingData.filter(type => type.enabled));
      onClose();
    } catch (error) {
      console.error('Error saving pricing:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Payment Pricing Structure</h2>
              <p className="text-gray-300 text-sm">{eventName} • {formatEventDate(eventDate)}</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-8">
          {/* Pricing Strategy Info */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-300 font-medium mb-2">Time-based Pricing Strategy</h3>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Set different prices based on how far in advance participants register</li>
              <li>• Offer installment options with optional premium pricing to incentivize full payment</li>
              <li>• Automatically disable installments closer to the event date</li>
              <li>• Current pricing tier is automatically selected based on registration date</li>
            </ul>
          </div>

          {/* Application Types */}
          {pricingData.map((appType, typeIndex) => {
            const typeInfo = getApplicationTypeInfo(appType.application_type);
            const currentTier = getCurrentPricingTier(typeIndex);
            
            return (
              <div key={appType.application_type} className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div>
                      <h3 className="text-white font-medium text-lg">{typeInfo.title}</h3>
                      <p className="text-gray-400 text-sm">
                        Current tier: <span className="text-purple-400">{currentTier?.name}</span>
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appType.enabled}
                      onChange={() => handleTypeToggle(typeIndex)}
                      className="text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <span className="text-gray-300 text-sm">Enabled</span>
                  </label>
                </div>

                {appType.enabled && (
                  <div className="space-y-4">
                    {/* Pricing Tiers */}
                    {appType.pricing_tiers.map((tier, tierIndex) => (
                      <div key={tier.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={tier.name}
                              onChange={(e) => handleTierUpdate(typeIndex, tierIndex, 'name', e.target.value)}
                              className="bg-transparent text-white font-medium text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                            />
                          </div>
                          <button
                            onClick={() => removePricingTier(typeIndex, tierIndex)}
                            disabled={appType.pricing_tiers.length <= 1}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">
                              Months Before Event
                            </label>
                            <input
                              type="number"
                              value={tier.months_before_event}
                              onChange={(e) => handleTierUpdate(typeIndex, tierIndex, 'months_before_event', parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-1">
                              Full Price (£)
                            </label>
                            <input
                              type="number"
                              value={tier.full_price}
                              onChange={(e) => handleTierUpdate(typeIndex, tierIndex, 'full_price', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-1">
                              3 Installments Total (£)
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={tier.installment_3_total}
                                onChange={(e) => handleTierUpdate(typeIndex, tierIndex, 'installment_3_total', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                disabled={!tier.installment_3_enabled}
                                className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                              />
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tier.installment_3_enabled}
                                  onChange={(e) => handleTierUpdate(typeIndex, tierIndex, 'installment_3_enabled', e.target.checked)}
                                  className="text-purple-600 focus:ring-purple-500 rounded"
                                />
                              </label>
                            </div>
                            {tier.installment_3_enabled && tier.installment_3_total > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                £{calculateInstallmentAmount(tier.installment_3_total, 3)} per month
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-1">
                              6 Installments Total (£)
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={tier.installment_6_total}
                                onChange={(e) => handleTierUpdate(typeIndex, tierIndex, 'installment_6_total', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                disabled={!tier.installment_6_enabled}
                                className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                              />
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tier.installment_6_enabled}
                                  onChange={(e) => handleTierUpdate(typeIndex, tierIndex, 'installment_6_enabled', e.target.checked)}
                                  className="text-purple-600 focus:ring-purple-500 rounded"
                                />
                              </label>
                            </div>
                            {tier.installment_6_enabled && tier.installment_6_total > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                £{calculateInstallmentAmount(tier.installment_6_total, 6)} per month
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Pricing Summary */}
                        <div className="bg-white/5 rounded p-3">
                          <h4 className="text-white text-sm font-medium mb-2">Payment Options for this Tier:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="text-green-400">
                              <span className="font-medium">Full Payment:</span> £{tier.full_price.toFixed(2)}
                            </div>
                            {tier.installment_3_enabled && tier.installment_3_total > 0 && (
                              <div className="text-blue-400">
                                <span className="font-medium">3 Installments:</span> £{calculateInstallmentAmount(tier.installment_3_total, 3)} × 3
                                {tier.installment_3_total > tier.full_price && (
                                  <span className="text-orange-400 ml-1">
                                    (+£{(tier.installment_3_total - tier.full_price).toFixed(2)})
                                  </span>
                                )}
                              </div>
                            )}
                            {tier.installment_6_enabled && tier.installment_6_total > 0 && (
                              <div className="text-purple-400">
                                <span className="font-medium">6 Installments:</span> £{calculateInstallmentAmount(tier.installment_6_total, 6)} × 6
                                {tier.installment_6_total > tier.full_price && (
                                  <span className="text-orange-400 ml-1">
                                    (+£{(tier.installment_6_total - tier.full_price).toFixed(2)})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Tier Button */}
                    <button
                      onClick={() => addPricingTier(typeIndex)}
                      className="w-full border-2 border-dashed border-white/20 rounded-lg p-4 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Pricing Tier</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pricing Strategy Tips */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="text-yellow-300 font-medium mb-2">Pricing Strategy Tips</h3>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• <strong>Early Bird Incentive:</strong> Offer lower prices for early registration to secure bookings</li>
                  <li>• <strong>Installment Premium:</strong> Charge slightly more for installments to encourage full payment</li>
                  <li>• <strong>Limited Installments:</strong> Disable installments closer to the event to ensure payment completion</li>
                  <li>• <strong>Tier Timing:</strong> Set tier thresholds based on your event planning timeline</li>
                </ul>
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
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Pricing Structure'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}