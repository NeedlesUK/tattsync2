import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, FileText, Image, Link as LinkIcon, Instagram, Facebook, Twitter, Gift, Info, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AttendeeDealsSection } from '../components/profile/AttendeeDealsSection';
import { AttendeeInformationSection } from '../components/profile/AttendeeInformationSection';

interface ProfileField {
  field_name: string;
  field_label: string;
  field_value: string;
  field_type: string;
  file_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
}

interface Deal {
  id: number;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'special';
  discount_value: number | null;
  discount_code: string;
  provider: string;
  provider_logo_url: string | null;
  valid_from: string;
  valid_until: string | null;
  is_global: boolean;
}

interface InformationItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function AttendeeProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'deals' | 'information'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [profileFields, setProfileFields] = useState<ProfileField[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [informationItems, setInformationItems] = useState<InformationItem[]>([]);

  // Mock data for the attendee
  const attendee = null;

  useEffect(() => {
    // Fetch profile data, deals, and information
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API calls to fetch profile data
      setProfileFields([]);
      setDeals([]);
      setInformationItems([]);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getApplicationTypeTitle = (type: string) => {
    switch (type) {
      case 'artist': return 'Tattoo Artist';
      case 'piercer': return 'Piercer';
      case 'performer': return 'Performer';
      case 'trader': return 'Trader';
      case 'volunteer': return 'Volunteer';
      case 'caterer': return 'Caterer';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={attendee.profile_photo}
              alt={attendee.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
            />
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-white">{attendee.name}</h1>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                    Booth {attendee.booth_number}
                  </span>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    Profile Complete
                  </span>
                </div>
              </div>
              
              <p className="text-purple-400 mb-4">{getApplicationTypeTitle(attendee.application_type)} • {attendee.event_name}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{attendee.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{attendee.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Registered: {formatDate(attendee.registration_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'deals'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Deals & Offers</span>
            {deals.length > 0 && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs">
                {deals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('information')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'information'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Information</span>
            {informationItems.length > 0 && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs">
                {informationItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Fields */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
              </div>
              
              <div className="space-y-6">
                {profileFields.map((field) => (
                  <div key={field.field_name} className="border border-white/10 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">{field.field_label}</h3>
                    
                    {field.field_type === 'image' && field.file_url ? (
                      <div className="mt-2">
                        <img 
                          src={field.file_url} 
                          alt={field.field_label} 
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-300 whitespace-pre-line">{field.field_value}</p>
                    )}
                    
                    {field.field_name === 'instagram_handle' && (
                      <a 
                        href={`https://instagram.com/${field.field_value.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>View Instagram</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <AttendeeDealsSection deals={deals} />
        )}

        {activeTab === 'information' && (
          <AttendeeInformationSection informationItems={informationItems} />
        )}
      </div>
    </div>
  );
}