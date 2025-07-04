import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, X, Check, AlertCircle } from 'lucide-react';

interface TimeSlot {
  id: string;
  start: string; // ISO string
  end: string; // ISO string
  isBooked: boolean;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
}

interface BookingCalendarProps {
  eventId: number;
  eventDates: string[]; // ISO date strings
  eventHours: { start: string; end: string }; // 24h format "HH:MM"
  existingBookings: TimeSlot[];
  onAddBooking: (booking: TimeSlot) => Promise<void>;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isArtistView?: boolean;
}

export function BookingCalendar({
  eventId,
  eventDates,
  eventHours,
  existingBookings,
  onAddBooking,
  onCancelBooking,
  isArtistView = false
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(eventDates[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  });
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [isCancellingBooking, setIsCancellingBooking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Generate time slots for the selected date
  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = eventHours.start.split(':').map(Number);
    const [endHour, endMinute] = eventHours.end.split(':').map(Number);
    
    // Create slots in 30-minute increments
    const slotDuration = 30; // minutes
    const startDate = new Date(`${date}T${eventHours.start}:00`);
    const endDate = new Date(`${date}T${eventHours.end}:00`);
    
    let currentSlotStart = new Date(startDate);
    
    while (currentSlotStart < endDate) {
      const currentSlotEnd = new Date(currentSlotStart);
      currentSlotEnd.setMinutes(currentSlotEnd.getMinutes() + slotDuration);
      
      // Don't create slots that go beyond the end time
      if (currentSlotEnd > endDate) break;
      
      const slotId = `${date}-${currentSlotStart.toISOString().substring(11, 16)}-${currentSlotEnd.toISOString().substring(11, 16)}`;
      
      // Check if this slot is already booked
      const existingBooking = existingBookings.find(booking => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return (
          bookingStart.toISOString() === currentSlotStart.toISOString() ||
          (bookingStart <= currentSlotStart && bookingEnd > currentSlotStart)
        );
      });
      
      if (existingBooking) {
        slots.push({
          ...existingBooking,
          start: currentSlotStart.toISOString(),
          end: currentSlotEnd.toISOString()
        });
      } else {
        slots.push({
          id: slotId,
          start: currentSlotStart.toISOString(),
          end: currentSlotEnd.toISOString(),
          isBooked: false
        });
      }
      
      // Move to next slot
      currentSlotStart = new Date(currentSlotEnd);
    }
    
    return slots;
  };

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    setTimeSlots(generateTimeSlots(selectedDate));
  }, [selectedDate, existingBookings]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentIndex = eventDates.indexOf(selectedDate);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDate(eventDates[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < eventDates.length - 1) {
      setSelectedDate(eventDates[currentIndex + 1]);
    }
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (slot.isBooked) {
      // View booking details
      setSelectedTimeSlot(slot);
      if (isArtistView) {
        setShowCancelConfirm(true);
      }
    } else {
      // Create new booking
      setSelectedTimeSlot(slot);
      setBookingFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        notes: ''
      });
      setShowBookingForm(true);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!bookingFormData.clientName.trim()) {
      newErrors.clientName = 'Name is required';
    }
    
    if (!bookingFormData.clientEmail.trim()) {
      newErrors.clientEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(bookingFormData.clientEmail)) {
      newErrors.clientEmail = 'Email is invalid';
    }
    
    if (!bookingFormData.clientPhone.trim()) {
      newErrors.clientPhone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBooking = async () => {
    if (!validateForm() || !selectedTimeSlot) return;
    
    setIsAddingBooking(true);
    try {
      const newBooking: TimeSlot = {
        ...selectedTimeSlot,
        isBooked: true,
        clientName: bookingFormData.clientName,
        clientEmail: bookingFormData.clientEmail,
        clientPhone: bookingFormData.clientPhone,
        notes: bookingFormData.notes
      };
      
      await onAddBooking(newBooking);
      setShowBookingForm(false);
      setSelectedTimeSlot(null);
      
      // Update the time slots to reflect the new booking
      setTimeSlots(prev => 
        prev.map(slot => 
          slot.id === newBooking.id ? newBooking : slot
        )
      );
    } catch (error) {
      console.error('Error adding booking:', error);
    } finally {
      setIsAddingBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedTimeSlot) return;
    
    setIsCancellingBooking(true);
    try {
      await onCancelBooking(selectedTimeSlot.id);
      setShowCancelConfirm(false);
      setSelectedTimeSlot(null);
      
      // Update the time slots to reflect the cancelled booking
      setTimeSlots(prev => 
        prev.map(slot => 
          slot.id === selectedTimeSlot.id ? { ...slot, isBooked: false, clientName: undefined, clientEmail: undefined, clientPhone: undefined, notes: undefined } : slot
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setIsCancellingBooking(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Booking Calendar</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDateChange('prev')}
            disabled={eventDates.indexOf(selectedDate) === 0}
            className="p-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white">
            {formatDate(selectedDate)}
          </div>
          <button
            onClick={() => handleDateChange('next')}
            disabled={eventDates.indexOf(selectedDate) === eventDates.length - 1}
            className="p-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            onClick={() => handleTimeSlotClick(slot)}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              slot.isBooked
                ? 'bg-red-500/20 border border-red-500/30'
                : 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className={`w-4 h-4 ${slot.isBooked ? 'text-red-400' : 'text-green-400'}`} />
                <span className="text-white font-medium">{formatTime(slot.start)}</span>
              </div>
              <span className="text-gray-300 text-sm">{formatTime(slot.end)}</span>
            </div>
            {slot.isBooked && slot.clientName && (
              <div className="mt-2">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300 text-sm truncate">{slot.clientName}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded"></div>
          <span className="text-gray-300">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded"></div>
          <span className="text-gray-300">Booked</span>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedTimeSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-purple-500/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">New Booking</h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Time Slot:</strong> {formatDate(selectedTimeSlot.start)} from {formatTime(selectedTimeSlot.start)} to {formatTime(selectedTimeSlot.end)}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={bookingFormData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.clientName ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter client's name"
                />
                {errors.clientName && (
                  <p className="text-red-400 text-sm mt-1">{errors.clientName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client Email
                </label>
                <input
                  type="email"
                  value={bookingFormData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.clientEmail ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter client's email"
                />
                {errors.clientEmail && (
                  <p className="text-red-400 text-sm mt-1">{errors.clientEmail}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client Phone
                </label>
                <input
                  type="tel"
                  value={bookingFormData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.clientPhone ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter client's phone number"
                />
                {errors.clientPhone && (
                  <p className="text-red-400 text-sm mt-1">{errors.clientPhone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={bookingFormData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add any notes about this booking"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBookingForm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBooking}
                disabled={isAddingBooking}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isAddingBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Create Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && selectedTimeSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-purple-500/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Cancel Booking</h3>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-yellow-300 font-medium mb-2">Are you sure?</h4>
                  <p className="text-yellow-200 text-sm">
                    You are about to cancel the booking for <strong>{selectedTimeSlot.clientName}</strong> on {formatDate(selectedTimeSlot.start)} at {formatTime(selectedTimeSlot.start)}.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancellingBooking}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isCancellingBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}