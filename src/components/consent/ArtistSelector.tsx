import React, { useState, useEffect } from 'react';
import { Search, User, MapPin, Star, CheckCircle } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  email: string;
  booth_number?: string;
  application_type: string;
  profile_photo?: string;
  specialties?: string[];
  rating?: number;
}

interface ArtistSelectorProps {
  eventId: number;
  onSelectArtist: (artist: Artist) => void;
  selectedArtist: Artist | null;
  error?: string;
}

export function ArtistSelector({ eventId, onSelectArtist, selectedArtist, error }: ArtistSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, [eventId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArtists(artists);
    } else {
      const filtered = artists.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArtists(filtered);
    }
  }, [searchTerm, artists]);

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
          rating: 4.8
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          booth_number: 'B-08',
          application_type: 'piercer',
          profile_photo: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          specialties: ['Ear Piercings', 'Body Piercings'],
          rating: 4.9
        },
        {
          id: '3',
          name: 'Emma Davis',
          email: 'emma@example.com',
          booth_number: 'A-22',
          application_type: 'artist',
          profile_photo: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          specialties: ['Black & Grey', 'Realism'],
          rating: 4.7
        },
        {
          id: '4',
          name: 'Alex Rodriguez',
          email: 'alex@example.com',
          booth_number: 'C-05',
          application_type: 'artist',
          profile_photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          specialties: ['Japanese', 'Color'],
          rating: 4.6
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for an artist or piercer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {filteredArtists.length > 0 ? (
          filteredArtists.map(artist => (
            <div 
              key={artist.id}
              onClick={() => onSelectArtist(artist)}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedArtist?.id === artist.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={artist.profile_photo || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2`}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {selectedArtist?.id === artist.id && (
                    <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">{artist.name}</h4>
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs capitalize">
                      {artist.application_type}
                    </span>
                  </div>
                  {artist.specialties && artist.specialties.length > 0 && (
                    <p className="text-gray-400 text-xs">{artist.specialties.join(', ')}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-gray-300 text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      Booth {artist.booth_number}
                    </div>
                    {artist.rating && renderRatingStars(artist.rating)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No artists found matching your search.</p>
          </div>
        )}
      </div>
      
      {selectedArtist && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-sm">
            You've selected <strong>{selectedArtist.name}</strong> ({selectedArtist.application_type}) at booth {selectedArtist.booth_number}
          </p>
        </div>
      )}
    </div>
  );
}