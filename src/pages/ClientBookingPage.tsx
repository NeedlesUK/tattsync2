import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, User, Mail, Phone, MapPin, Clock, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingRequestModal } from '../components/booking/BookingRequestModal';

interface Artist {
  id: string;
  name: string;
  email: string;
  booth_number?: string;
  application_type: string;
  profile_photo?: string;
  specialties?: string[];
  rating?: number;
  booking_status: 'fully_booked' | 'advance_bookings' | 'taking_walkups';
  contact_method?: string;
  contact_details?: string;
  booking_notes?: string;
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
  artistId: string;
  artistName: string;
  artistType: string;
}

export function ClientBookingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'artists' | 'bookings'>('artists');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchArtists();
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = artists;
    
    if (searchTerm) {
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.specialties && artist.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(artist => artist.application_type === filterType);
    }
    
    setFilteredArtists(filtered);
  }, [searchTerm, filterType, artists]);

  useEffect(() => {
    let filtered = bookings;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    
    setFilteredBookings(filtered);
  }, [filterStatus, bookings]);

  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, fetch from API
      // Mock data for now
      const mockArtists: Artist[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          booth_number: 'A-15',
          application_type: 'artist',
          profile_photo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          specialties: ['Traditional', 'Neo-Traditional'],
          rating: 4.8,
          booking_status: 'advance_bookings',
          contact_method: 'instagram',
          contact_details: '@sarahtattoos',
          booking_notes: 'Specializing in traditional and neo-traditional styles. Minimum size applies.'
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          booth_number: 'B-08',
          application_type: 'piercer',
          profile_photo: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          specialties: ['Ear Piercings', 'Body Piercings'],
          rating: 4.9,
          booking_status: 'taking_walkups',
          contact_method: 'email',
          contact_details: 'mike@example.com',
          booking_notes: 'Experienced piercer with a wide range of jewelry options available.'
        },
        {
          id: '3',
          name: 'Emma Davis',
          email: 'emma@example.com',
          booth_number: 'A-22',
          application_type: 'artist',
          profile_photo: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          specialties: ['Black & Grey', 'Realism'],
          rating: 4.7,
          booking_status: 'fully_booked',
          contact_method: 'instagram',
          contact_details: '@emmadavis_art',
          booking_notes: 'Specializing in black and grey realism. Currently fully booked for this event.'
        },
        {
          id: '4',
          name: 'Alex Rodriguez',
          email: 'alex@example.com',
          booth_number: 'C-05',
          application_type: 'artist',
          profile_photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          specialties: ['Japanese', 'Color'],
          rating: 4.6,
          booking_status: 'advance_bookings',
          contact_method: 'phone',
          contact_details: '+44 7700 900123',
          booking_notes: 'Specializing in Japanese style and color work. Booking in advance recommended.'
        }
      ];
      
      setArtists(mockArtists);
      setFilteredArtists(mockArtists);
    } catch (error) {
      console.error('Error fetching artists:', error);
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
          clientName: user?.name || 'Client',
          clientEmail: user?.email || 'client@example.com',
          clientPhone: '+44 7700 900123',
          notes: 'Traditional sleeve design, upper arm',
          status: 'upcoming',
          consentCompleted: true,
          artistId: '1',
          artistName: 'Sarah Johnson',
          artistType: 'artist'
        },
        {
          id: '2',
          start: '2024-03-16T14:00:00Z',
          end: '2024-03-16T15:00:00Z',
          clientName: user?.name || 'Client',
          clientEmail: user?.email || 'client@example.com',
          clientPhone: '+44 7700 900123',
          notes: 'Ear piercing, helix',
          status: 'upcoming',
          consentCompleted: false,
          artistId: '2',
          artistName: 'Mike Chen',
          artistType: 'piercer'
        },
        {
          id: '3',
          start: '2024-03-14T13:00:00Z',
          end: '2024-03-14T14:00:00Z',
          clientName: user?.name || 'Client',
          clientEmail: user?.email || 'client@example.com',
          clientPhone: '+44 7700 900123',
          notes: 'Small rose design on wrist',
          status: 'completed',
          consentCompleted: true,
          artistId: '4',
          artistName: 'Alex Rodriguez',
          artistType: 'artist'
        }
      ];
      
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBookingRequest = async (bookingData: any) => {
    try {
      // In a real implementation, submit to API
      console.log('Submitting booking request:', bookingData);
      
      // Mock successful submission
      const newBooking: Booking = {
        id: Date.now().toString(),
        start: new Date(bookingData.booking_date + 'T' + bookingData.booking_time).toISOString(),
        end: new Date(new Date(bookingData.booking_date + 'T' + bookingData.booking_time).getTime() + 60 * 60 * 1000).toISOString(),
        clientName: bookingData.client_name,
        clientEmail: bookingData.client_email,
        clientPhone: bookingData.client_phone,
        notes: bookingData.description,
        status: 'upcoming',
        consentCompleted: false,
        artistId: selectedArtist?.id || '',
        artistName: selectedArtist?.name || '',
        artistType: selectedArtist?.application_type || ''
      };
      
      setBookings([...bookings, newBooking]);
      
      // Show success message
      alert('Booking request submitted successfully! You will receive a confirmation email shortly.');
    } catch (error) {
      console.error('Error submitting booking request:', error);
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
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleViewConsent = (bookingId: string) => {
    // In a real implementation, navigate to consent form view
    console.log('Viewing consent form for booking:', bookingId);
  };

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-4 h-4 text-yellow-400" />
        )}
        {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" />
        ))}
        <span className="ml-1 text-gray-300 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fully_booked':
        return 'bg-red-500/20 text-red-400';
      case 'advance_bookings':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'taking_walkups':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mock event dates for the booking modal
  const availableDates = [
    '2024-03-15',
    '2024-03-16',
    '2024-03-17'
  ];

  // Mock time slots for the booking modal
  const availableTimeSlots = [
    { start: '2024-03-15T10:00:00Z', end: '2024-03-15T11:00:00Z' },
    { start: '2024-03-15T11:00:00Z', end: '2024-03-15T12:00:00Z' },
    { start: '2024-03-15T13:00:00Z', end: '2024-03-15T14:00:00Z' },
    { start: '2024-03-15T14:00:00Z', end: '2024-03-15T15:00:00Z' },
    { start: '2024-03-15T15:00:00Z', end: '2024-03-15T16:00:00Z' },
    { start: '2024-03-15T16:00:00Z', end: '2024-03-15T17:00:00Z' }
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Artist Bookings</h1>
          <p className="text-gray-300">
            Book appointments with artists and piercers
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'artists'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Find Artists
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            My Bookings
          </button>
        </div>

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or style..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                >
                  <option value="all">All Types</option>
                  <option value="artist">Tattoo Artists</option>
                  <option value="piercer">Piercers</option>
                </select>
              </div>
            </div>

            {/* Artists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist) => (
                <div key={artist.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={artist.profile_photo || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2`}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{artist.name}</h3>
                          <p className="text-gray-300 text-sm capitalize">{artist.application_type}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(artist.booking_status)}`}>
                          {artist.booking_status.replace('_', ' ')}
                        </span>
                      </div>
                      {artist.rating && renderRatingStars(artist.rating)}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {artist.specialties && artist.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {artist.specialties.map((specialty, index) => (
                          <span key={index} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      Booth {artist.booth_number}
                    </div>
                    
                    {artist.booking_notes && (
                      <p className="text-gray-300 text-sm">{artist.booking_notes}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleBookArtist(artist)}
                    disabled={artist.booking_status === 'fully_booked'}
                    className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {artist.booking_status === 'fully_booked' 
                      ? 'Fully Booked' 
                      : `Book ${artist.application_type === 'artist' ? 'Tattoo' : 'Piercing'}`}
                  </button>
                </div>
              ))}
            </div>

            {filteredArtists.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No artists found</h3>
                <p className="text-gray-400">
                  {searchTerm || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No artists are available for booking at this time'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                >
                  <option value="all">All Bookings</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => setActiveTab('artists')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Booking</span>
              </button>
            </div>

            {/* Bookings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="space-y-3">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{booking.artistName}</h4>
                        <p className="text-gray-400 text-sm capitalize">{booking.artistType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <BookingCard
                    booking={booking}
                    onCancel={booking.status === 'upcoming' ? handleCancelBooking : undefined}
                    onViewConsent={booking.consentCompleted ? handleViewConsent : undefined}
                    isArtistView={false}
                  />
                </div>
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No bookings found</h3>
                <p className="text-gray-400">
                  {filterStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You don\'t have any bookings yet'
                  }
                </p>
                <button
                  onClick={() => setActiveTab('artists')}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Book an Artist
                </button>
              </div>
            )}
          </div>
        )}

        {/* Booking Request Modal */}
        {isBookingModalOpen && selectedArtist && (
          <BookingRequestModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onSubmit={handleSubmitBookingRequest}
            artistName={selectedArtist.name}
            artistType={selectedArtist.application_type}
            availableDates={availableDates}
            availableTimeSlots={availableTimeSlots}
          />
        )}
      </div>
    </div>
  );
}