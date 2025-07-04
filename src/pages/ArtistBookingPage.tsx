import React, { useState, useEffect } from 'react';
import { Calendar, Settings, Clock, User, Mail, Phone, FileText, Bell, Filter, Search, Plus, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { BookingSettingsModal } from '../components/booking/BookingSettingsModal';
import { BookingPreferencesModal } from '../components/booking/BookingPreferencesModal';
import { BookingCard } from '../components/booking/BookingCard';

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

interface Booking {
  id: string;
  start: string; // ISO string
  end: string; // ISO string
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  consentCompleted?: boolean;
}

export function ArtistBookingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings'>('calendar');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState<any>(null);
  const [bookingSettings, setBookingSettings] = useState<any>(null);
  const [bookingPreferences, setBookingPreferences] = useState<any>(null);

  useEffect(() => {
    fetchArtistData();
    fetchBookings();
    fetchBookingSettings();
    fetchBookingPreferences();
  }, []);

  useEffect(() => {
    let filtered = bookings;
    
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    
    setFilteredBookings(filtered);
  }, [searchTerm, filterStatus, bookings]);

  const fetchArtistData = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, fetch from API
      // Mock data for now
      const mockArtistData = {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        booth_number: 'A-15',
        application_type: 'artist',
        specialties: ['Traditional', 'Neo-Traditional'],
        event_id: 1,
        event_name: 'Ink Fest 2024'
      };
      
      setArtistData(mockArtistData);
    } catch (error) {
      console.error('Error fetching artist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      // In a real implementation, fetch from API
      // Mock data for now
      const mockBookings: Booking[] = [
        {
          id: '1',
          start: '2024-03-15T10:00:00Z',
          end: '2024-03-15T11:00:00Z',
          clientName: 'John Smith',
          clientEmail: 'john@example.com',
          clientPhone: '+44 7700 900123',
          notes: 'Traditional sleeve design, upper arm',
          status: 'upcoming',
          consentCompleted: true
        },
        {
          id: '2',
          start: '2024-03-15T13:00:00Z',
          end: '2024-03-15T14:30:00Z',
          clientName: 'Emily Wilson',
          clientEmail: 'emily@example.com',
          clientPhone: '+44 7700 900456',
          notes: 'Small rose design on wrist',
          status: 'upcoming',
          consentCompleted: false
        },
        {
          id: '3',
          start: '2024-03-16T11:00:00Z',
          end: '2024-03-16T12:00:00Z',
          clientName: 'David Brown',
          clientEmail: 'david@example.com',
          clientPhone: '+44 7700 900789',
          notes: 'Japanese style dragon on back',
          status: 'upcoming',
          consentCompleted: false
        },
        {
          id: '4',
          start: '2024-03-14T14:00:00Z',
          end: '2024-03-14T15:00:00Z',
          clientName: 'Sarah Johnson',
          clientEmail: 'sarah@example.com',
          clientPhone: '+44 7700 900321',
          notes: 'Small bird design on ankle',
          status: 'completed',
          consentCompleted: true
        },
        {
          id: '5',
          start: '2024-03-14T16:00:00Z',
          end: '2024-03-14T17:00:00Z',
          clientName: 'Michael Lee',
          clientEmail: 'michael@example.com',
          clientPhone: '+44 7700 900654',
          notes: 'Geometric design on forearm',
          status: 'cancelled',
          consentCompleted: false
        }
      ];
      
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchBookingSettings = async () => {
    try {
      // In a real implementation, fetch from API
      // Mock data for now
      const mockSettings = {
        event_id: 1,
        enabled: true,
        default_slot_duration: 30,
        booking_hours: {
          start: '10:00',
          end: '18:00'
        },
        available_dates: [
          '2024-03-15',
          '2024-03-16',
          '2024-03-17'
        ],
        buffer_time: 15,
        max_bookings_per_day: null,
        allow_client_cancellation: true,
        cancellation_deadline_hours: 24
      };
      
      setBookingSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching booking settings:', error);
    }
  };

  const fetchBookingPreferences = async () => {
    try {
      // In a real implementation, fetch from API
      // Mock data for now
      const mockPreferences = {
        booking_status: 'taking_walkups',
        contact_method: 'instagram',
        contact_details: '@artist_handle',
        booking_notes: 'Specializing in traditional and neo-traditional styles. Minimum size applies.'
      };
      
      setBookingPreferences(mockPreferences);
    } catch (error) {
      console.error('Error fetching booking preferences:', error);
    }
  };

  const handleAddBooking = async (booking: TimeSlot) => {
    try {
      // In a real implementation, save to API
      console.log('Adding booking:', booking);
      
      // Add to bookings list
      const newBooking: Booking = {
        id: Date.now().toString(),
        start: booking.start,
        end: booking.end,
        clientName: booking.clientName || '',
        clientEmail: booking.clientEmail || '',
        clientPhone: booking.clientPhone,
        notes: booking.notes,
        status: 'upcoming',
        consentCompleted: false
      };
      
      setBookings([...bookings, newBooking]);
      
      // Show success message
      alert('Booking created successfully! The client will receive an email confirmation.');
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // In a real implementation, update via API
      console.log('Cancelling booking:', bookingId);
      
      // Update booking status
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'cancelled' as const } : booking
      );
      
      setBookings(updatedBookings);
      
      // Show success message
      alert('Booking cancelled successfully! The client will be notified.');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      // In a real implementation, update via API
      console.log('Completing booking:', bookingId);
      
      // Update booking status
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'completed' as const } : booking
      );
      
      setBookings(updatedBookings);
      
      // Show success message
      alert('Booking marked as completed!');
    } catch (error) {
      console.error('Error completing booking:', error);
    }
  };

  const handleViewConsent = (bookingId: string) => {
    // In a real implementation, navigate to consent form view
    console.log('Viewing consent form for booking:', bookingId);
  };

  const handleSaveSettings = async (settings: any) => {
    try {
      // In a real implementation, save to API
      console.log('Saving booking settings:', settings);
      setBookingSettings(settings);
      
      // Show success message
      alert('Booking settings saved successfully!');
    } catch (error) {
      console.error('Error saving booking settings:', error);
      throw error;
    }
  };

  const handleSavePreferences = async (preferences: any) => {
    try {
      // In a real implementation, save to API
      console.log('Saving booking preferences:', preferences);
      setBookingPreferences(preferences);
      
      // Show success message
      alert('Booking preferences saved successfully!');
    } catch (error) {
      console.error('Error saving booking preferences:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mock event dates for the calendar
  const eventDates = [
    '2024-03-15',
    '2024-03-16',
    '2024-03-17'
  ];

  // Convert bookings to time slots for the calendar
  const bookingTimeSlots: TimeSlot[] = bookings
    .filter(booking => booking.status === 'upcoming')
    .map(booking => ({
      id: booking.id,
      start: booking.start,
      end: booking.end,
      isBooked: true,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      notes: booking.notes
    }));

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Management</h1>
            <p className="text-gray-300">
              Manage your appointments and availability
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <button
              onClick={() => setIsPreferencesModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Bell className="w-5 h-5" />
              <span>Booking Preferences</span>
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>Calendar Settings</span>
            </button>
          </div>
        </div>

        {/* Booking Status Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                bookingPreferences?.booking_status === 'fully_booked'
                  ? 'bg-red-500/20'
                  : bookingPreferences?.booking_status === 'advance_bookings'
                  ? 'bg-yellow-500/20'
                  : 'bg-green-500/20'
              }`}>
                <Calendar className={`w-6 h-6 ${
                  bookingPreferences?.booking_status === 'fully_booked'
                    ? 'text-red-400'
                    : bookingPreferences?.booking_status === 'advance_bookings'
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Booking Status</h2>
                <p className={`${
                  bookingPreferences?.booking_status === 'fully_booked'
                    ? 'text-red-400'
                    : bookingPreferences?.booking_status === 'advance_bookings'
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}>
                  {bookingPreferences?.booking_status === 'fully_booked'
                    ? 'Fully Booked'
                    : bookingPreferences?.booking_status === 'advance_bookings'
                    ? 'Taking Advance Bookings'
                    : 'Taking Walk-ups'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/5 px-4 py-2 rounded-lg">
                <p className="text-gray-400 text-sm">Upcoming</p>
                <p className="text-white font-bold text-xl">
                  {bookings.filter(b => b.status === 'upcoming').length}
                </p>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-lg">
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-white font-bold text-xl">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-lg">
                <p className="text-gray-400 text-sm">Cancelled</p>
                <p className="text-white font-bold text-xl">
                  {bookings.filter(b => b.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Bookings List
          </button>
        </div>

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <BookingCalendar
            eventId={1}
            eventDates={eventDates}
            eventHours={{ start: '10:00', end: '18:00' }}
            existingBookings={bookingTimeSlots}
            onAddBooking={handleAddBooking}
            onCancelBooking={handleCancelBooking}
            isArtistView={true}
          />
        )}

        {/* Bookings List View */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Booking</span>
              </button>
            </div>

            {/* Bookings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={booking.status === 'upcoming' ? handleCancelBooking : undefined}
                  onComplete={booking.status === 'upcoming' ? handleCompleteBooking : undefined}
                  onViewConsent={booking.consentCompleted ? handleViewConsent : undefined}
                  isArtistView={true}
                />
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No bookings found</h3>
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'You don\'t have any bookings yet'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <BookingSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSaveSettings}
          initialSettings={bookingSettings}
          eventDates={eventDates}
        />

        <BookingPreferencesModal
          isOpen={isPreferencesModalOpen}
          onClose={() => setIsPreferencesModalOpen(false)}
          onSave={handleSavePreferences}
          initialPreferences={bookingPreferences}
        />
      </div>
    </div>
  );
}