import React, { useState } from 'react';
import { X, Save, Plus, Trash2, DollarSign, Percent, Calendar, Tag, Image, Link, Users, Gift, Globe } from 'lucide-react';

interface GlobalDeal {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'special';
  discount_value: number | null;
  discount_code: string;
  provider: string;
  provider_logo_url: string;
  is_active: boolean;
}

interface DealAssignment {
  id: string;
  global_deal_id: string;
  event_id: string | null; // null means all events
  application_types: string[];
  is_active: boolean;
}

interface GlobalDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { deals: GlobalDeal[], assignments: DealAssignment[] }) => void;
}

export function GlobalDealsModal({
  isOpen,
  onClose,
  onSave
}: GlobalDealsModalProps) {
  const [deals, setDeals] = useState<GlobalDeal[]>([
    {
      id: '1',
      title: 'TattSync Pro Membership Discount',
      description: 'Get 15% off your first year of TattSync Pro membership. Access exclusive events and resources.',
      discount_type: 'percentage',
      discount_value: 15,
      discount_code: 'TATTSYNCPRO15',
      provider: 'TattSync',
      provider_logo_url: 'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=200',
      is_active: true
    }
  ]);

  const [assignments, setAssignments] = useState<DealAssignment[]>([
    {
      id: '1',
      global_deal_id: '1',
      event_id: null,
      application_types: [],
      is_active: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'deals' | 'assignments'>('deals');
  const [isSaving, setIsSaving] = useState(false);

  // Mock data for events
  const events = [
    { id: '1', name: 'Ink Fest 2024' },
    { id: '2', name: 'Body Art Expo' },
    { id: '3', name: 'Tattoo Convention' }
  ];

  if (!isOpen) return null;

  const applicationTypes = [
    { value: 'artist', label: 'Artists' },
    { value: 'piercer', label: 'Piercers' },
    { value: 'trader', label: 'Traders' },
    { value: 'caterer', label: 'Caterers' },
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
    const newDeal: GlobalDeal = {
      id: Date.now().toString(),
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: null,
      discount_code: '',
      provider: '',
      provider_logo_url: '',
      is_active: true
    };
    setDeals([...deals, newDeal]);
  };

  const updateDeal = (id: string, updates: Partial<GlobalDeal>) => {
    setDeals(deals.map(deal => 
      deal.id === id ? { ...deal, ...updates } : deal
    ));
  };

  const removeDeal = (id: string) => {
    setDeals(deals.filter(deal => deal.id !== id));
    // Also remove any assignments for this deal
    setAssignments(assignments.filter(assignment => assignment.global_deal_id !== id));
  };

  const addAssignment = () => {
    if (deals.length === 0) return;
    
    const newAssignment: DealAssignment = {
      id: Date.now().toString(),
      global_deal_id: deals[0].id,
      event_id: null,
      application_types: [],
      is_active: true
    };
    setAssignments([...assignments, newAssignment]);
  };

  const updateAssignment = (id: string, updates: Partial<DealAssignment>) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === id ? { ...assignment, ...updates } : assignment
    ));
  };

  const removeAssignment = (id: string) => {
    setAssignments(assignments.filter(assignment => assignment.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ deals, assignments });
      onClose();
    } catch (error) {
      console.error('Error saving global deals:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getDiscountTypeIcon = (type: string) => {
    const discountType = discountTypes.find(dt => dt.value === type);
    return discountType ? discountType.icon : Gift;
  };

  const getDealTitle = (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.title : 'Unknown Deal';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Global Deals Management</h2>
            <p className="text-gray-300 text-sm">Master Admin Controls</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { key: 'deals', label: 'Global Deals', icon: Gift },
            { key: 'assignments', label: 'Deal Assignments', icon: Tag }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'deals' && (
            <div className="space-y-6">
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-2">Global Deals</h3>
                <p className="text-blue-200 text-sm">
                  Create system-wide deals that can be assigned to specific events or made available to all events.
                  These deals can be from sponsors, partners, or your own organization.
                </p>
              </div>

              {/* Global Deals List */}
              <div className="space-y-6">
                {deals.map((deal) => {
                  const DiscountIcon = getDiscountTypeIcon(deal.discount_type);
                  
                  return (
                    <div key={deal.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <DiscountIcon className="w-5 h-5 text-purple-400" />
                          <h4 className="text-white font-medium">Global Deal</h4>
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
                            placeholder="e.g., TattSync Pro Membership Discount"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Provider/Sponsor</label>
                          <input
                            type="text"
                            value={deal.provider}
                            onChange={(e) => updateDeal(deal.id, { provider: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., TattSync"
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
                              placeholder={deal.discount_type === 'percentage' ? '15' : '50.00'}
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
                            placeholder="e.g., TATTSYNCPRO15"
                          />
                        </div>
                      </div>

                      <div>
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
                <span>Add Global Deal</span>
              </button>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-2">Deal Assignments</h3>
                <p className="text-blue-200 text-sm">
                  Assign global deals to specific events or attendee types. You can make a deal available to all events,
                  a specific event, or certain types of attendees within events.
                </p>
              </div>

              {deals.length === 0 ? (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm">
                    Please create at least one global deal before creating assignments.
                  </p>
                </div>
              ) : (
                <>
                  {/* Assignments List */}
                  <div className="space-y-6">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Tag className="w-5 h-5 text-purple-400" />
                            <h4 className="text-white font-medium">Deal Assignment</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignment.is_active}
                                onChange={(e) => updateAssignment(assignment.id, { is_active: e.target.checked })}
                                className="text-purple-600 focus:ring-purple-500 rounded"
                              />
                              <span className="text-gray-300 text-sm">Active</span>
                            </label>
                            <button
                              onClick={() => removeAssignment(assignment.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Global Deal</label>
                            <select
                              value={assignment.global_deal_id}
                              onChange={(e) => updateAssignment(assignment.id, { global_deal_id: e.target.value })}
                              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {deals.map(deal => (
                                <option key={deal.id} value={deal.id} className="bg-gray-800">
                                  {deal.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Event</label>
                            <select
                              value={assignment.event_id || ''}
                              onChange={(e) => updateAssignment(assignment.id, { 
                                event_id: e.target.value ? e.target.value : null 
                              })}
                              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="" className="bg-gray-800">All Events</option>
                              {events.map(event => (
                                <option key={event.id} value={event.id} className="bg-gray-800">
                                  {event.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center space-x-2 mb-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Available to</span>
                          </label>
                          
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => updateAssignment(assignment.id, { application_types: [] })}
                              className={`px-3 py-1 rounded-full text-sm ${
                                assignment.application_types.length === 0
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
                                  const types = assignment.application_types.includes(type.value)
                                    ? assignment.application_types.filter(t => t !== type.value)
                                    : [...assignment.application_types, type.value];
                                  updateAssignment(assignment.id, { application_types: types });
                                }}
                                className={`px-3 py-1 rounded-full text-sm ${
                                  assignment.application_types.includes(type.value)
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                                }`}
                              >
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-white/5 rounded">
                          <h5 className="text-white text-sm font-medium mb-2">Assignment Summary</h5>
                          <p className="text-gray-300 text-sm">
                            <strong>{getDealTitle(assignment.global_deal_id)}</strong> will be available to{' '}
                            {assignment.application_types.length === 0 ? 'all attendee types' : applicationTypes
                              .filter(type => assignment.application_types.includes(type.value))
                              .map(type => type.label)
                              .join(', ')}{' '}
                            at{' '}
                            {assignment.event_id 
                              ? events.find(e => e.id === assignment.event_id)?.name || 'the selected event'
                              : 'all events'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Assignment Button */}
                  <button
                    onClick={addAssignment}
                    className="w-full mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Deal Assignment</span>
                  </button>
                </>
              )}
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
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Global Deals'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}