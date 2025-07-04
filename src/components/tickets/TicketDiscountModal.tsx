import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Percent, DollarSign, Calendar, Tag, AlertCircle } from 'lucide-react';

interface TicketDiscount {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
}

interface TicketDiscountModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (discounts: TicketDiscount[]) => void;
  initialDiscounts?: TicketDiscount[];
}

export function TicketDiscountModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave,
  initialDiscounts = []
}: TicketDiscountModalProps) {
  const [discounts, setDiscounts] = useState<TicketDiscount[]>(
    initialDiscounts.length > 0 
      ? initialDiscounts 
      : [
          {
            id: '1',
            code: 'EARLY10',
            description: 'Early bird discount',
            discount_type: 'percentage',
            discount_value: 10,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            max_uses: 100,
            current_uses: 0,
            is_active: true
          }
        ]
  );

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const addDiscount = () => {
    const newDiscount: TicketDiscount = {
      id: Date.now().toString(),
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      start_date: new Date().toISOString(),
      end_date: null,
      max_uses: null,
      current_uses: 0,
      is_active: true
    };
    setDiscounts([...discounts, newDiscount]);
  };

  const updateDiscount = (id: string, updates: Partial<TicketDiscount>) => {
    setDiscounts(discounts.map(discount => 
      discount.id === id ? { ...discount, ...updates } : discount
    ));
  };

  const removeDiscount = (id: string) => {
    setDiscounts(discounts.filter(discount => discount.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(discounts);
      onClose();
    } catch (error) {
      console.error('Error saving discounts:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Ticket Discounts</h2>
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
          <div className="mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">Discount Codes</h3>
              <p className="text-blue-200 text-sm">
                Create discount codes for your event tickets. Set percentage or fixed amount discounts,
                validity periods, and usage limits.
              </p>
            </div>
          </div>

          {/* Discounts List */}
          <div className="space-y-6">
            {discounts.map((discount) => (
              <div key={discount.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Tag className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-medium">Discount Code</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discount.is_active}
                        onChange={(e) => updateDiscount(discount.id, { is_active: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300 text-sm">Active</span>
                    </label>
                    <button
                      onClick={() => removeDiscount(discount.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Discount Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={discount.code}
                        onChange={(e) => updateDiscount(discount.id, { code: e.target.value.toUpperCase() })}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., SUMMER20"
                      />
                      <button
                        onClick={() => updateDiscount(discount.id, { code: generateRandomCode() })}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={discount.description}
                      onChange={(e) => updateDiscount(discount.id, { description: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Early bird discount"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Discount Type</label>
                    <select
                      value={discount.discount_type}
                      onChange={(e) => updateDiscount(discount.id, { 
                        discount_type: e.target.value as 'percentage' | 'fixed'
                      })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="percentage" className="bg-gray-800">Percentage (%)</option>
                      <option value="fixed" className="bg-gray-800">Fixed Amount (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      {discount.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (£)'}
                    </label>
                    <div className="relative">
                      {discount.discount_type === 'percentage' ? (
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      )}
                      <input
                        type="number"
                        value={discount.discount_value}
                        onChange={(e) => updateDiscount(discount.id, { 
                          discount_value: parseFloat(e.target.value) || 0
                        })}
                        min="0"
                        step={discount.discount_type === 'percentage' ? '1' : '0.01'}
                        className="w-full pl-10 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={discount.discount_type === 'percentage' ? '10' : '5.00'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Usage Limit (optional)</label>
                    <input
                      type="number"
                      value={discount.max_uses || ''}
                      onChange={(e) => updateDiscount(discount.id, { 
                        max_uses: e.target.value ? parseInt(e.target.value) : null
                      })}
                      min="1"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Unlimited"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave empty for unlimited</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Valid From</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={formatDate(discount.start_date)}
                        onChange={(e) => updateDiscount(discount.id, { 
                          start_date: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                        })}
                        className="w-full pl-10 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Valid Until (optional)</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={formatDate(discount.end_date)}
                        onChange={(e) => updateDiscount(discount.id, { 
                          end_date: e.target.value ? new Date(e.target.value).toISOString() : null
                        })}
                        className="w-full pl-10 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Leave empty for no expiration</p>
                  </div>
                </div>

                {discount.current_uses > 0 && (
                  <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      This code has been used <strong>{discount.current_uses}</strong> times
                      {discount.max_uses && ` out of ${discount.max_uses}`}.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Discount Button */}
          <button
            onClick={addDiscount}
            className="w-full mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Discount Code</span>
          </button>

          {/* Discount Tips */}
          <div className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-300 font-medium mb-2">Discount Tips</h4>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• <strong>Early Bird:</strong> Create time-limited discounts to encourage early registrations</li>
                  <li>• <strong>Group Discounts:</strong> Offer special codes for groups or organizations</li>
                  <li>• <strong>Limited Quantity:</strong> Set usage limits to create scarcity</li>
                  <li>• <strong>Targeted Marketing:</strong> Create unique codes for different marketing channels</li>
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
            <span>{isSaving ? 'Saving...' : 'Save Discounts'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}