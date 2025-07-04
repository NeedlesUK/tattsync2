import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Calendar, DollarSign, Users, Clock } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price_gbp: number;
  capacity: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface TicketTypeModalProps {
  eventId: number;
  eventName: string;
  eventStartDate: string;
  eventEndDate: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketTypes: TicketType[]) => void;
  initialTicketTypes?: TicketType[];
}

export function TicketTypeModal({
  eventId,
  eventName,
  eventStartDate,
  eventEndDate,
  isOpen,
  onClose,
  onSave,
  initialTicketTypes = []
}: TicketTypeModalProps) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(
    initialTicketTypes.length > 0 
      ? initialTicketTypes 
      : [
          {
            id: '1',
            name: 'Day Pass',
            description: 'Access for one day of your choice',
            price_gbp: 25.00,
            capacity: null,
            start_date: eventStartDate,
            end_date: eventEndDate,
            is_active: true
          },
          {
            id: '2',
            name: 'Weekend Pass',
            description: 'Full access to all days of the event',
            price_gbp: 65.00,
            capacity: null,
            start_date: eventStartDate,
            end_date: eventEndDate,
            is_active: true
          }
        ]
  );

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const addTicketType = () => {
    const newTicketType: TicketType = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price_gbp: 0,
      capacity: null,
      start_date: eventStartDate,
      end_date: eventEndDate,
      is_active: true
    };
    setTicketTypes([...ticketTypes, newTicketType]);
  };

  const updateTicketType = (id: string, updates: Partial<TicketType>) => {
    setTicketTypes(ticketTypes.map(type => 
      type.id === id ? { ...type, ...updates } : type
    ));
  };

  const removeTicketType = (id: string) => {
    setTicketTypes(ticketTypes.filter(type => type.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(ticketTypes);
      onClose();
    } catch (error) {
      console.error('Error saving ticket types:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Ticket Types</h2>
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
              <h3 className="text-blue-300 font-medium mb-2">Ticket Configuration</h3>
              <p className="text-blue-200 text-sm">
                Create different ticket types for your event. Set prices, capacities, and availability dates.
                Tickets will be available for purchase on your event page.
              </p>
            </div>
          </div>

          {/* Ticket Types List */}
          <div className="space-y-6">
            {ticketTypes.map((ticketType) => (
              <div key={ticketType.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-medium">Ticket Type</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ticketType.is_active}
                        onChange={(e) => updateTicketType(ticketType.id, { is_active: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300 text-sm">Active</span>
                    </label>
                    <button
                      onClick={() => removeTicketType(ticketType.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Ticket Name</label>
                    <input
                      type="text"
                      value={ticketType.name}
                      onChange={(e) => updateTicketType(ticketType.id, { name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Day Pass, Weekend Pass"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Price (£)</label>
                    <input
                      type="number"
                      value={ticketType.price_gbp}
                      onChange={(e) => updateTicketType(ticketType.id, { price_gbp: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={ticketType.description}
                    onChange={(e) => updateTicketType(ticketType.id, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe what this ticket includes..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Capacity (optional)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={ticketType.capacity || ''}
                        onChange={(e) => updateTicketType(ticketType.id, { 
                          capacity: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        min="1"
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Unlimited"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Leave empty for unlimited</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Available From</label>
                    <input
                      type="date"
                      value={formatDate(ticketType.start_date)}
                      onChange={(e) => updateTicketType(ticketType.id, { 
                        start_date: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Available Until</label>
                    <input
                      type="date"
                      value={formatDate(ticketType.end_date)}
                      onChange={(e) => updateTicketType(ticketType.id, { 
                        end_date: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Ticket Type Button */}
          <button
            onClick={addTicketType}
            className="w-full mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Ticket Type</span>
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
            <span>{isSaving ? 'Saving...' : 'Save Ticket Types'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}