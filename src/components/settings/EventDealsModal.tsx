import React, { useState } from 'react';
import { X, Save, Plus, Trash2, DollarSign, Percent, Calendar, Tag, Image, Link, Users, Gift } from 'lucide-react';

interface EventDeal {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'special';
  discount_value: number | null;
  discount_code: string;
  provider: string;
  provider_logo_url: string;
  application_types: string[];
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

interface EventDealsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deals: EventDeal[]) => void;
}

export function EventDealsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: EventDealsModalProps) {
  const [deals, setDeals] = useState<EventDeal[]>([
    {
      id: '1',
      title: 'Exclusive Tattoo Supply Discount',
      description: '20% off all tattoo supplies from InkMasters Supply Co. Valid during the event weekend.',
      discount_type: 'percentage',
      discount_value: 20,
      discount_code: 'INKFEST20',
      provider: 'InkMasters Supply Co.',
      provider_logo_url: 'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=200',
      application_types: ['artist'],
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      id: '2',
      title: 'Hotel Discount',
      description: 'Special rate at the Riverside Hotel for all event attendees. Use code TATTCON24 when booking.',
      discount_type: 'fixed',
      discount_value: 50,
      discount_code: 'TATTCON24',
      provider: 'Riverside Hotel',
      provider_logo_url: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=200',
      application_types: [],
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const applicationTypes = [
    { value: 'artist', label: 'Artists' },
    { value: 'piercer', label: 'Piercers' },
    { value: 'trader', label: 'Traders' },
    { value: 'caterer', label: 'Caterers' },
    { value: 'performer', label: 'Performers' },
    { value: 'volunteer', label: 'Volunteers' }
  ];

  const discountTypes = [
    { value: 'percentage', label: 'Percentage Discount', icon: Percent },
    { value: 'fixed', label: 'Fixed Amount Off', icon: DollarSign },
    { value: 'special', label: 'Special Offer', icon: Gift }
  ];

  const addDeal = () => {
    const newDeal: EventDeal = {
      id: Date.now().toString(),
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: null,
      discount_code: '',
      provider: '',
      provider_logo_url: '',
      application_types: [],
      valid_from: new Date().toISOString(),
      valid_until: null,
      is_active: true
    };
    setDeals([...deals, newDeal]);
  };

  const updateDeal = (id: string, updates: Partial<EventDeal>) => {
    setDeals(deals.map(deal => 
      deal.id === id ? { ...deal, ...updates } : deal
    ));
  };

  const removeDeal = (id: string) => {
    setDeals(deals.filter(deal => deal.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(deals);
      onClose();
    } catch (error) {
      console.error('Error saving deals:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const getDiscountTypeIcon = (type: string) => {
    const discountType = discountTypes.find(dt => dt.value === type);
    return discountType ? discountType.icon : Gift;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Event Deals & Offers</h2>
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
              <h3 className="text-blue-300 font-medium mb-2">Event Deals & Offers</h3>
              <p className="text-blue-200 text-sm">
                Create special deals and offers for your event attendees. These can be from sponsors, 
                local businesses, or your own organization. Deals can be targeted to specific attendee types 
                or made available to everyone.
              </p>
            </div>
          </div>

          {/* Deals List */}
          <div className="space-y-6">
            {deals.map((deal) => {
              const DiscountIcon = getDiscountTypeIcon(deal.discount_type);
              
              return (
                <div key={deal.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <DiscountIcon className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-medium">Deal/Offer</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deal.is_active}
                          onChange={(e) => updateDeal(deal.id, { is_active: e.target.checked })}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <span className="text-gray-300 text-sm">Active</span>
                      </label>
                      <button
                        onClick={() => removeDeal(deal.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Deal Title</label>
                      <input
                        type="text"
                        value={deal.title}
                        onChange={(e) => updateDeal(deal.id, { title: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., 20% Off Tattoo Supplies"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Provider/Sponsor</label>
                      <input
                        type="text"
                        value={deal.provider}
                        onChange={(e) => updateDeal(deal.id, { provider: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., InkMasters Supply Co."
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={deal.description}
                      onChange={(e) => updateDeal(deal.id, { description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe the deal and any conditions..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Discount Type</label>
                      <select
                        value={deal.discount_type}
                        onChange={(e) => updateDeal(deal.id, { 
                          discount_type: e.target.value as 'percentage' | 'fixed' | 'special' 
                        })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {discountTypes.map(type => (
                          <option key={type.value} value={type.value} className="bg-gray-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {deal.discount_type !== 'special' && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          {deal.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (£)'}
                        </label>
                        <input
                          type="number"
                          value={deal.discount_value || ''}
                          onChange={(e) => updateDeal(deal.id, { 
                            discount_value: e.target.value ? parseFloat(e.target.value) : null 
                          })}
                          min="0"
                          step={deal.discount_type === 'percentage' ? '1' : '0.01'}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={deal.discount_type === 'percentage' ? '20' : '50.00'}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Discount Code</label>
                      <input
                        type="text"
                        value={deal.discount_code}
                        onChange={(e) => updateDeal(deal.id, { discount_code: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., TATTCON24"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Valid From</label>
                      <input
                        type="date"
                        value={formatDate(deal.valid_from)}
                        onChange={(e) => updateDeal(deal.id, { 
                          valid_from: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() 
                        })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Valid Until (optional)</label>
                      <input
                        type="date"
                        value={formatDate(deal.valid_until)}
                        onChange={(e) => updateDeal(deal.id, { 
                          valid_until: e.target.value ? new Date(e.target.value).toISOString() : null 
                        })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Provider Logo URL (optional)</label>
                    <input
                      type="url"
                      value={deal.provider_logo_url}
                      onChange={(e) => updateDeal(deal.id, { provider_logo_url: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/logo.png"
                    />
                    {deal.provider_logo_url && (
                      <div className="mt-2 flex items-center space-x-2">
                        <img 
                          src={deal.provider_logo_url} 
                          alt={deal.provider} 
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-gray-400 text-xs">Logo preview</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Available to</span>
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateDeal(deal.id, { application_types: [] })}
                        className={`px-3 py-1 rounded-full text-sm ${
                          deal.application_types.length === 0
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        All Attendees
                      </button>
                      
                      {applicationTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => {
                            const types = deal.application_types.includes(type.value)
                              ? deal.application_types.filter(t => t !== type.value)
                              : [...deal.application_types, type.value];
                            updateDeal(deal.id, { application_types: types });
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            deal.application_types.includes(type.value)
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Deal Button */}
          <button
            onClick={addDeal}
            className="w-full mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Deal or Offer</span>
          </button>
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
            <span>{isSaving ? 'Saving...' : 'Save Deals'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}