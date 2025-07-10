import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Calendar, DollarSign, Users, Clock, AlertCircle, Check, Link, Calendar as CalendarIcon } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEventDetails();
      fetchTicketTypes();
    }
  }, [isOpen, eventId]);

  const fetchEventDetails = async () => {
    try {
      if (supabase) {
        // Fetch event details to get dates and max_attendees
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('start_date, end_date, max_attendees')
          .eq('id', eventId)
          .single();
          
        if (eventError) {
          console.error('Error fetching event details:', eventError);
          return;
        }
        
        if (eventData) {
          // Generate array of dates between start_date and end_date
          const dates: string[] = [];
          const startDate = new Date(eventData.start_date);
          const endDate = new Date(eventData.end_date);
          
          // Set venue capacity from max_attendees
          setVenueCapacity(eventData.max_attendees || 1000);
          
          // Generate all dates between start and end
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          setEventDates(dates);
        }
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const fetchTicketTypes = async () => {
    try {
      setError(null);
      
      // If we already have initial ticket types, use those
      if (initialTicketTypes.length > 0) {
        setTicketTypes(initialTicketTypes);
        setHasLoadedData(true);
        return;
      }
      
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
          // Format dates for input fields and ensure all fields exist
          const formattedData = data.map(type => ({
            ...type,
            start_date: type.start_date ? type.start_date.split('T')[0] : '',
            end_date: type.end_date ? type.end_date.split('T')[0] : '',
            affects_capacity: type.affects_capacity !== undefined ? type.affects_capacity : true,
            applicable_days: type.applicable_days || [],
            dependency_ticket_id: type.dependency_ticket_id || null,
            max_per_order: type.max_per_order || null,
            min_age: type.min_age || null
          }));
          
          console.log('Fetched ticket types:', formattedData);
          setTicketTypes(formattedData);
          setHasLoadedData(true);
          return;
        }
        
        // Only set default ticket types if we haven't loaded data before
        if (!hasLoadedData) {
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
                is_active: true,
                affects_capacity: true,
                applicable_days: [],
                dependency_ticket_id: null,
                max_per_order: 4,
                min_age: 18
              }
            ];
            
            setTicketTypes(defaultTypes);
          }
        } else {
          // If we've loaded data before but found nothing, just set empty array
          setTicketTypes([]);
        }
      }
      
      setHasLoadedData(true);
    } catch (err) {
      console.error('Exception fetching ticket types:', err);
      setError('Failed to load ticket types');
    }
  };

  const addTicketType = () => {
    const newTicketType: TicketType = {
      id: `temp_${uuidv4()}`,
      name: '',
      description: '',
      price_gbp: 0,
      capacity: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: eventEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
      affects_capacity: true,
      applicable_days: [],
      dependency_ticket_id: null,
      max_per_order: null,
      min_age: null
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

  const toggleApplicableDay = (index: number, day: string) => {
    const ticketType = ticketTypes[index];
    const days = [...(ticketType.applicable_days || [])];
    
    if (days.includes(day)) {
      // Remove day
      updateTicketType(index, { 
        applicable_days: days.filter(d => d !== day) 
      });
    } else {
      // Add day
      updateTicketType(index, { 
        applicable_days: [...days, day] 
      });
    }
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
          // First pass: Insert all tickets with dependencies set to null
          const ticketsToInsert = ticketTypes.map(type => ({
            event_id: eventId,
            name: type.name,
            description: type.description,
            price_gbp: type.price_gbp,
            capacity: type.capacity,
            start_date: type.start_date,
            end_date: type.end_date,
            is_active: type.is_active,
            affects_capacity: type.affects_capacity,
            applicable_days: type.applicable_days,
            dependency_ticket_id: null, // Set to null initially
            max_per_order: type.max_per_order,
            min_age: type.min_age
          }));
          
          const { data: insertedTickets, error: insertError } = await supabase
            .from('ticket_types')
            .insert(ticketsToInsert)
            .select();
            
          if (insertError) {
            console.error('Error inserting ticket types:', insertError);
            throw insertError;
          }
          
          // Second pass: Update dependencies if needed
          const dependencyUpdates = [];
          
          for (let i = 0; i < ticketTypes.length; i++) {
            const originalTicket = ticketTypes[i];
            const insertedTicket = insertedTickets[i];
            
            if (originalTicket.dependency_ticket_id) {
              // Find the real ID of the dependency ticket
              let realDependencyId = null;
              
              // Check if it's a temp ID (starts with 'temp_')
              if (typeof originalTicket.dependency_ticket_id === 'string' && 
                  originalTicket.dependency_ticket_id.startsWith('temp_')) {
                // Extract the index from the temp ID
                const tempIndex = ticketTypes.findIndex(
                  t => t.id === originalTicket.dependency_ticket_id
                );
                
                if (tempIndex !== -1 && insertedTickets[tempIndex]) {
                  realDependencyId = insertedTickets[tempIndex].id;
                }
              } else {
                // It's a real ID, use it directly
                realDependencyId = originalTicket.dependency_ticket_id;
              }
              
              if (realDependencyId) {
                dependencyUpdates.push({
                  id: insertedTicket.id,
                  dependency_ticket_id: realDependencyId
                });
              }
            }
          }
          
          // Update dependencies if any exist
          if (dependencyUpdates.length > 0) {
            for (const update of dependencyUpdates) {
              const { error: updateError } = await supabase
                .from('ticket_types')
                .update({ dependency_ticket_id: update.dependency_ticket_id })
                .eq('id', update.id);
                
              if (updateError) {
                console.error('Error updating ticket dependency:', updateError);
                // Continue with other updates even if one fails
              }
            }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
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
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3 mb-6">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}
          
          <div className="mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">Venue Capacity</h3>
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={venueCapacity}
                    onChange={(e) => setVenueCapacity(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1000"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (supabase) {
                      try {
                        const { error } = await supabase
                          .from('events')
                          .update({ max_attendees: venueCapacity })
                          .eq('id', eventId);
                            
                        if (error) throw error;
                        setSuccess('Venue capacity updated successfully');
                      } catch (err) {
                        console.error('Error updating venue capacity:', err);
                        setError('Failed to update venue capacity');
                      }
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Update Capacity
                </button>
              </div>
              <p className="text-blue-200 text-sm mt-2">
                This is the maximum number of attendees your venue can hold. Ticket sales will be limited to this capacity.
              </p>
            </div>
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

                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => {
                      // Create a duplicate of this ticket type
                      const duplicate = { ...ticketType, name: `${ticketType.name} (Copy)` };
                      // Remove the ID if it exists to ensure it's treated as a new ticket
                      if (duplicate.id) delete duplicate.id;
                      setTicketTypes([...ticketTypes, duplicate]);
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Duplicate Ticket</span>
                  </button>
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
                    <div className="relative">
                      <input
                        type="number"
                        value={ticketType.price_gbp}
                        onChange={(e) => updateTicketType(index, { price_gbp: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="25.00"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">£</div>
                    </div>
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
                    <label className="block text-sm text-gray-400 mb-1">Ticket Capacity</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Per Order</label>
                    <input
                      type="number"
                      value={ticketType.max_per_order || ''}
                      onChange={(e) => updateTicketType(index, { 
                        max_per_order: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      min="1"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="No limit"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum tickets per order</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Minimum Age</label>
                    <input
                      type="number"
                      value={ticketType.min_age || ''}
                      onChange={(e) => updateTicketType(index, { 
                        min_age: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      min="0"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="No minimum"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum age requirement</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Ticket Dependency</label>
                  <select
                    value={ticketType.dependency_ticket_id || ''}
                    onChange={(e) => updateTicketType(index, { 
                      dependency_ticket_id: e.target.value || null 
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" className="bg-gray-800">No dependency</option>
                    {ticketTypes
                      .filter((type, typeIndex) => type.is_active && typeIndex !== index)
                      .map((type, typeIndex) => {
                        // Find the original index in the full array for temporary IDs
                        // This helps us maintain consistent references even for unsaved tickets
                        const originalIndex = ticketTypes.findIndex(ticket => ticket === type);
                        return (
                          <option 
                            key={typeIndex} 
                            value={type.id || `temp_${originalIndex}`} 
                            className="bg-gray-800"
                          >
                            {type.name}
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    This ticket can only be purchased with the selected ticket (e.g., child tickets with adult tickets)
                  </p>
                  {ticketType.dependency_ticket_id && (
                    <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-xs flex items-center">
                        <Link className="w-4 h-4 mr-1" />
                        This ticket requires the purchase of: {
                          ticketTypes.find(t => 
                            (t.id && String(t.id) === String(ticketType.dependency_ticket_id)) || 
                            (`temp_${ticketTypes.findIndex(ticket => ticket === t)}` === String(ticketType.dependency_ticket_id))
                          )?.name || 'Unknown ticket'
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">Affects Venue Capacity</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={ticketType.affects_capacity} 
                        onChange={(e) => updateTicketType(index, { affects_capacity: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">
                    When enabled, this ticket will count towards the venue's maximum capacity
                  </p>
                </div>

                {/* Applicable Days */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Applicable Days</label>
                  <div className="flex flex-wrap gap-2">
                    {eventDates.length > 0 ? (
                      eventDates.map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => toggleApplicableDay(index, date)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            ticketType.applicable_days?.includes(date)
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {formatDate(date)}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No event dates available</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {ticketType.applicable_days?.length === 0 
                      ? "This ticket applies to all event days" 
                      : `This ticket only applies to the selected days (${ticketType.applicable_days?.length} selected)`
                    }
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

          {/* Ticket Type Examples */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mt-6">
            <h4 className="text-yellow-300 font-medium mb-2">Ticket Type Examples</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• <strong>Day Pass:</strong> Applies to a single day, affects capacity for that day only</li>
              <li>• <strong>Weekend Pass:</strong> Applies to all days, affects capacity for all days</li>
              <li>• <strong>Child Ticket:</strong> Requires an adult ticket, lower price</li>
              <li>• <strong>Carer Ticket:</strong> Free ticket that requires a full-price ticket</li>
              <li>• <strong>VIP Upgrade:</strong> Doesn't affect capacity, adds benefits to existing ticket</li>
            </ul>
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