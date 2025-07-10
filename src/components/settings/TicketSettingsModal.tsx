import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Calendar, DollarSign, Users, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TicketSettingsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketTypes: TicketType[]) => Promise<void>;
}

export interface TicketType {
  id?: string;
  name: string;
  description: string;
  price_gbp: number;
  capacity: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export function TicketSettingsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: TicketSettingsModalProps) {
  const { supabase } = useAuth();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      name: 'Day Pass',
      description: 'Access for one day of your choice',
      price_gbp: 25.00,
      capacity: 500,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      is_active: true
    },
    {
      name: 'Weekend Pass',
      description: 'Full access to all days of the event',
      price_gbp: 65.00,
      capacity: 300,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      is_active: true
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTicketTypes();
    }
  }, [isOpen, eventId]);

  const fetchTicketTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        const { data, error } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching ticket types:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Format dates for input fields
          const formattedData = data.map(type => ({
            ...type,
            start_date: type.start_date ? type.start_date.split('T')[0] : '',
            end_date: type.end_date ? type.end_date.split('T')[0] : ''
          }));
          
          console.log('Fetched ticket types:', formattedData);
          setTicketTypes(formattedData);
        } else {
          // No ticket types found, use defaults
          console.log('No ticket types found, using defaults');
          
          // Get event dates
          const { data: eventData } = await supabase
            .from('events')
            .select('start_date, end_date')
            .eq('id', eventId)
            .single();
            
          if (eventData) {
            const defaultTypes = [
              {
                name: 'Day Pass',
                description: 'Access for one day of your choice',
                price_gbp: 25.00,
                capacity: 500,
                start_date: new Date().toISOString().split('T')[0],
                end_date: eventData.start_date.split('T')[0],
                is_active: true
              },
              {
                name: 'Weekend Pass',
                description: 'Full access to all days of the event',
                price_gbp: 65.00,
                capacity: 300,
                start_date: new Date().toISOString().split('T')[0],
                end_date: eventData.start_date.split('T')[0],
                is_active: true
              }
            ];
            
            setTicketTypes(defaultTypes);
          }
        }
      }
    } catch (err) {
      console.error('Exception fetching ticket types:', err);
      setError('Failed to load ticket types');
    } finally {
      setIsLoading(false);
    }
  };

  const addTicketType = () => {
    const newTicketType: TicketType = {
      name: '',
      description: '',
      price_gbp: 0,
      capacity: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      is_active: true
    };
    
    setTicketTypes([...ticketTypes, newTicketType]);
  };

  const updateTicketType = (index: number, updates: Partial<TicketType>) => {
    setTicketTypes(ticketTypes.map((type, i) => 
      i === index ? { ...type, ...updates } : type
    ));
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate ticket types
      for (const type of ticketTypes) {
        if (!type.name.trim()) {
          setError('All ticket types must have a name');
          setIsSaving(false);
          return;
        }
        
        if (type.price_gbp < 0) {
          setError('Ticket prices cannot be negative');
          setIsSaving(false);
          return;
        }
        
        if (!type.start_date) {
          setError('All ticket types must have a start date');
          setIsSaving(false);
          return;
        }
        
        if (!type.end_date) {
          setError('All ticket types must have an end date');
          setIsSaving(false);
          return;
        }
        
        if (new Date(type.end_date) < new Date(type.start_date)) {
          setError('End date cannot be before start date');
          setIsSaving(false);
          return;
        }
      }
      
      // Save to database if using Supabase
      if (supabase) {
        // First, delete all existing ticket types
        const { error: deleteError } = await supabase
          .from('ticket_types')
          .delete()
          .eq('event_id', eventId);
          
        if (deleteError) {
          console.error('Error deleting existing ticket types:', deleteError);
          throw deleteError;
        }
        
        // Then insert the new ticket types
        if (ticketTypes.length > 0) {
          const { error: insertError } = await supabase
            .from('ticket_types')
            .insert(
              ticketTypes.map(type => ({
                event_id: eventId,
                name: type.name,
                description: type.description,
                price_gbp: type.price_gbp,
                capacity: type.capacity,
                start_date: type.start_date,
                end_date: type.end_date,
                is_active: type.is_active
              }))
            );
            
          if (insertError) {
            console.error('Error inserting ticket types:', insertError);
            throw insertError;
          }
        }
        
        setSuccess('Ticket types saved successfully');
      }
      
      // Call the onSave callback
      await onSave(ticketTypes);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving ticket types:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Ticket Settings</h2>
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
                  <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-blue-300 font-medium mb-2">Ticket Configuration</h3>
                <p className="text-blue-200 text-sm">
                  Create different ticket types for your event. Set prices, capacities, and availability dates.
                  Tickets will be available for purchase on your event page.
                </p>
              </div>

              {/* Ticket Types List */}
              <div className="space-y-6">
                {ticketTypes.map((ticketType, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
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
                            onChange={(e) => updateTicketType(index, { is_active: e.target.checked })}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-300 text-sm">Active</span>
                        </label>
                        <button
                          onClick={() => removeTicketType(index)}
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
                          onChange={(e) => updateTicketType(index, { name: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., Day Pass, Weekend Pass"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Price (£)</label>
                        <input
                          type="number"
                          value={ticketType.price_gbp}
                          onChange={(e) => updateTicketType(index, { price_gbp: parseFloat(e.target.value) || 0 })}
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
                        onChange={(e) => updateTicketType(index, { description: e.target.value })}
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
                            onChange={(e) => updateTicketType(index, { 
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
                          value={ticketType.start_date}
                          onChange={(e) => updateTicketType(index, { 
                            start_date: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Available Until</label>
                        <input
                          type="date"
                          value={ticketType.end_date}
                          onChange={(e) => updateTicketType(index, { 
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
            <span>{isSaving ? 'Saving...' : 'Save Ticket Types'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}