import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Calendar, MapPin, Users, Clock, AlertCircle, Check, Link, Calendar as CalendarIcon, Copy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface TicketSettingsModalProps {
  eventId: number;
  eventName: string;
  eventStartDate: string;
  eventEndDate: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketTypes: TicketType[]) => void;
  initialTicketTypes?: TicketType[];
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
  affects_capacity: boolean;
  applicable_days: string[];
  dependency_ticket_id?: string | null;
  max_per_order?: number | null;
  min_age?: number | null;
}

export function TicketSettingsModal({
  eventId,
  eventName,
  eventStartDate,
  eventEndDate,
  isOpen,
  onClose,
  onSave,
  initialTicketTypes = []
}: TicketSettingsModalProps) {
  const { supabase } = useAuth();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [eventDates, setEventDates] = useState<string[]>([]); 
  const [venueCapacity, setVenueCapacity] = useState<number>(1000);

  useEffect(() => {
    if (isOpen) {
      fetchEventDetails();
      fetchTicketTypes();
    }
  }, [isOpen, eventId]);

  const fetchEventDetails = async () => {
    try {
      // Generate dates between start and end date
      console.log('Event dates from props:', { eventStartDate, eventEndDate });
      
      if (eventStartDate && eventEndDate && 
          eventStartDate !== 'undefined' && eventEndDate !== 'undefined' &&
          !isNaN(new Date(eventStartDate).getTime()) && !isNaN(new Date(eventEndDate).getTime())) {
        
        // Parse dates properly - ensure we're working with the date part only
        const startStr = typeof eventStartDate === 'string' ? eventStartDate.split('T')[0] : eventStartDate;
        const endStr = typeof eventEndDate === 'string' ? eventEndDate.split('T')[0] : eventEndDate;
        
        const start = new Date(startStr);
        const end = new Date(endStr);
        const dates: string[] = [];
        
        let currentDate = new Date(start);
        while (currentDate <= end) {
          dates.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setEventDates(dates);
        console.log('Generated dates:', dates);
      } else {
        console.warn('Invalid event dates:', { eventStartDate, eventEndDate });

        // Try to fetch actual event dates from the database if available
        if (supabase) {
          console.log('Attempting to fetch event dates from database for event ID:', eventId);
          const { data, error } = await supabase
            .from('events')
            .select('start_date, end_date')
            .eq('id', eventId)
            .single();

          if (!error && data) {
            console.log('Fetched event dates from DB:', data);
            // Ensure we have valid dates
            if (data.start_date && data.end_date) {
              const start = new Date(data.start_date);
              const end = new Date(data.end_date);
              
              if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const dates: string[] = [];
                
                let currentDate = new Date(start);
                while (currentDate <= end) {
                  dates.push(currentDate.toISOString().split('T')[0]);
                  currentDate.setDate(currentDate.getDate() + 1);
                }
                
                setEventDates(dates);
                console.log('Generated dates from DB:', dates);
                return;
              }
            }
          } else {
            console.warn('Failed to fetch event dates from DB:', error);
          }
        }

        // If we still don't have dates, use a fallback
        console.warn('Using fallback dates');
        
        // Create a range of dates for the next few days
        const fallbackDates = [];
        const today = new Date();
        
        // Add 3 days starting from today
        for (let i = 0; i < 3; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          fallbackDates.push(date.toISOString().split('T')[0]);
        }
        
        setEventDates(fallbackDates);
        console.log('Using fallback dates:', fallbackDates);
      }
      
      // Get venue capacity
      if (supabase) {
        const { data, error } = await supabase
          .from('events')
          .select('max_attendees')
          .eq('id', eventId)
          .single();
          
        if (!error && data) {
          setVenueCapacity(data.max_attendees || 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      
      // If all else fails, set some default dates
      const fallbackDates = [];
      const today = new Date();
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        fallbackDates.push(date.toISOString().split('T')[0]);
      }
      setEventDates(fallbackDates);
    }
  };

  const fetchTicketTypes = async () => {
    try {
      setHasLoadedData(false);
      
      // If we have initial data, use it
      if (initialTicketTypes && initialTicketTypes.length > 0) {
       // Ensure applicable_days is an array for each ticket type
        const processedTicketTypes = initialTicketTypes.map(ticket => ({
          ...ticket,
          applicable_days: Array.isArray(ticket.applicable_days) ? [...ticket.applicable_days] : []
        }));
        setTicketTypes(processedTicketTypes);
        setHasLoadedData(true);
        return;
      }
      
      // Otherwise, fetch from Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching ticket types:', error);
          setTicketTypes([]);
        } else if (data) {
          // Ensure applicable_days is an array for each ticket type
          const processedData = data.map((ticket: any) => ({
            ...ticket,
            applicable_days: Array.isArray(ticket.applicable_days) ? ticket.applicable_days : []
          }));
          setTicketTypes(processedData);
        } else {
          setTicketTypes([]);
        }
      } else {
        // Fallback to mock data
        setTicketTypes([
          {
            id: '1',
            name: 'Day Pass',
            description: 'Access for one day of your choice',
            price_gbp: 25,
            capacity: 500,
            start_date: eventStartDate,
            end_date: eventEndDate,
            is_active: true,
            affects_capacity: true,
            applicable_days: []
          },
          {
            id: '2',
            name: 'Weekend Pass',
            description: 'Full access to all days of the event',
            price_gbp: 65,
            capacity: 300,
            start_date: eventStartDate,
            end_date: eventEndDate,
            is_active: true,
            affects_capacity: true,
            applicable_days: []
          }
        ]);
      }
      
      setHasLoadedData(true);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      setHasLoadedData(true);
    }
  };

  const addTicketType = () => {
    const newTicketType: TicketType = {
      id: uuidv4(),
      name: '',
      description: '',
      price_gbp: 0,
      capacity: null,
      start_date: eventStartDate,
      end_date: eventEndDate,
      is_active: true,
      affects_capacity: true,
      applicable_days: [],
      dependency_ticket_id: null,
      max_per_order: null,
      min_age: null
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

  const duplicateTicketType = (id: string) => {
    const ticketToDuplicate = ticketTypes.find(type => type.id === id);
    if (ticketToDuplicate) {
      const duplicatedTicket: TicketType = {
        ...ticketToDuplicate,
        id: uuidv4(),
        name: `${ticketToDuplicate.name} (Copy)`,
        // Reset any dependencies to avoid circular references
        dependency_ticket_id: null
      };
      setTicketTypes([...ticketTypes, duplicatedTicket]);
    }
  };

  const handleSave = async () => {
    // Validate ticket types
    if (ticketTypes.some(type => !type.name)) {
      setError('All ticket types must have a name');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Saving ticket types to database:', ticketTypes);
      
      if (supabase) {
        // First, delete existing ticket types for this event
        const { error: deleteError } = await supabase
          .from('ticket_types')
          .delete()
          .eq('event_id', eventId);
          
        if (deleteError) {
          console.error('Error deleting existing ticket types:', deleteError);
          throw deleteError;
        }
        
        // Then insert the new ticket types
        const ticketsToInsert = ticketTypes.map(ticket => ({
          event_id: eventId,
          name: ticket.name,
          description: ticket.description,
          price_gbp: ticket.price_gbp,
          capacity: ticket.capacity,
          start_date: ticket.start_date,
          end_date: ticket.end_date,
          is_active: ticket.is_active,
          affects_capacity: ticket.affects_capacity,
          applicable_days: ticket.applicable_days,
          dependency_ticket_id: ticket.dependency_ticket_id,
          max_per_order: ticket.max_per_order,
          min_age: ticket.min_age
        }));
        
        const { data, error: insertError } = await supabase
          .from('ticket_types')
          .insert(ticketsToInsert)
          .select();
          
        if (insertError) {
          console.error('Error inserting ticket types:', insertError);
          throw insertError;
        }
        
        console.log('Ticket types saved successfully:', data);
        setSuccess('Ticket types saved successfully');
        
        // Call the onSave callback
        await onSave(ticketTypes);
        
        // Close the modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // If Supabase is not available, just call the onSave callback
        await onSave(ticketTypes);
        setSuccess('Ticket types saved successfully');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving ticket types:', error);
      setError('Failed to save ticket types');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const getDependencyOptions = (currentId: string) => {
    return ticketTypes.filter(type => type.id !== currentId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}
          
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
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="text"
                      value={ticketType.name}
                      onChange={(e) => updateTicketType(ticketType.id!, { name: e.target.value })}
                      className="bg-transparent text-white font-medium border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none px-1"
                      placeholder="Ticket Name"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ticketType.is_active}
                        onChange={(e) => updateTicketType(ticketType.id!, { is_active: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300 text-sm">Active</span>
                    </label>
                    <button
                      onClick={() => removeTicketType(ticketType.id!)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateTicketType(ticketType.id!)}
                      className="text-blue-400 hover:text-blue-300 ml-2"
                      title="Duplicate ticket type"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={ticketType.description}
                      onChange={(e) => updateTicketType(ticketType.id!, { description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe what this ticket includes..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Price (£)</label>
                    <input
                      type="number"
                      value={ticketType.price_gbp}
                      onChange={(e) => updateTicketType(ticketType.id!, { price_gbp: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Capacity (optional)</label>
                    <input
                      type="number"
                      value={ticketType.capacity || ''}
                      onChange={(e) => updateTicketType(ticketType.id!, { 
                        capacity: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      min="1"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Unlimited"
                    />
                    <div className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        checked={ticketType.affects_capacity}
                        onChange={(e) => updateTicketType(ticketType.id!, { affects_capacity: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500 rounded mr-2"
                      />
                      <span className="text-gray-400 text-xs">Affects venue capacity</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Available From</label>
                    <input
                      type="date"
                      value={formatDate(ticketType.start_date)}
                      onChange={(e) => updateTicketType(ticketType.id!, { 
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
                      onChange={(e) => updateTicketType(ticketType.id!, { 
                        end_date: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Dependency (optional)</label>
                    <select
                      value={ticketType.dependency_ticket_id || ''}
                      onChange={(e) => updateTicketType(ticketType.id!, { 
                        dependency_ticket_id: e.target.value || null 
                      })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">No dependency</option>
                      {getDependencyOptions(ticketType.id!).map(option => (
                        <option key={option.id} value={option.id} className="bg-gray-800">
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      Requires another ticket to be purchased first
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Per Order (optional)</label>
                    <input
                      type="number"
                      value={ticketType.max_per_order || ''}
                      onChange={(e) => updateTicketType(ticketType.id!, { 
                        max_per_order: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      min="1"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="No limit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Minimum Age (optional)</label>
                    <input
                      type="number"
                      value={ticketType.min_age || ''}
                      onChange={(e) => updateTicketType(ticketType.id!, { 
                        min_age: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="No minimum"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Applicable Days (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {eventDates && eventDates.length > 0 ? eventDates.map((date) => {
                      // Ensure we're working with a proper array and do a strict comparison
                      const applicableDays = Array.isArray(ticketType.applicable_days) ? ticketType.applicable_days : [];
                      const isSelected = applicableDays.some(d => d === date);
                      return (
                        <button
                          key={date}
                          onClick={() => {
                            // Create a defensive copy of the array
                            const currentDays = Array.isArray(ticketType.applicable_days) 
                              ? [...ticketType.applicable_days] 
                              : [];
                            
                            const newDays = isSelected
                              ? currentDays.filter(d => d !== date)
                              : [...currentDays, date];
                            
                            updateTicketType(ticketType.id!, { applicable_days: newDays });
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                          }`}
                        >
                          {new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </button>
                      );
                    }) : (
                      <p className="text-gray-400 text-sm">No event dates available</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    If none selected, ticket is valid for all days
                  </p>
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

// Add this component to make TypeScript happy
function Ticket({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}