import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, FileText, CreditCard, Heart, CheckCircle, Globe } from 'lucide-react';
import { DynamicApplicationForm } from '../components/forms/DynamicApplicationForm';
import { AccountSelectionPrompt } from '../components/forms/AccountSelectionPrompt';
import { ProfileUpdatePrompt } from '../components/forms/ProfileUpdatePrompt';
import { useAuth } from '../contexts/AuthContext';

// Helper function to get event details from slug
const getEventFromSlug = async (slug: string, supabase: any) => {
  if (!supabase) return null;
  
  try {
    console.log('Fetching event with slug:', slug);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_slug', slug)
      .single();
      
    if (error) {
      console.error('Error fetching event by slug:', error);
      return null;
    }
    
    console.log('Event data retrieved by slug:', data);
    return data;
  } catch (error) {
    console.error('Exception fetching event by slug:', error);
    return null;
  }
};

interface EventDetails {
  id: number;
  name: string;
  description: string;
  event_slug: string;
  start_date: string;
  end_date: string;
  location: string;
  venue: string;
  status: string;
  applications_enabled: boolean;
  ticketing_enabled: boolean;
  consent_forms_enabled: boolean;
  application_types: string[];
  banner_image_url?: string;
  logo_url?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export function EventApplicationPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'apply' | 'tickets' | 'consent'>('info');
  const [selectedApplicationType, setSelectedApplicationType] = useState<string | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [showAccountSelection, setShowAccountSelection] = useState(false);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [useExistingAccount, setUseExistingAccount] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (eventSlug) {
      fetchEventDetails();
    }
  }, [eventSlug, supabase]);

  useEffect(() => {
    if (user) {
      // Fetch user profile data
      setUserProfile({
        name: user.name,
        email: user.email,
        phone: '+44 7700 900123', // Mock data - in real implementation, fetch from user profile
        location: 'London, UK', // Mock data
        bio: 'Experienced tattoo artist specializing in traditional styles.' // Mock data
      });
    }
  }, [user]);

  const fetchEventDetails = async () => {
    if (!eventSlug) return;
    
    try {
      setIsLoading(true);
      
      // Try to fetch from Supabase first
      if (supabase) {
        const eventData = await getEventFromSlug(eventSlug, supabase);
        
        if (eventData) {
          // Get event modules
          const { data: modules, error: modulesError } = await supabase
            .from('event_modules')
            .select('*')
            .eq('event_id', eventData.id)
            .single();
            
          if (modulesError) {
            console.error('Error fetching event modules:', modulesError);
          }
          
          // Get application types
          const { data: appSettings, error: appError } = await supabase
            .from('application_settings')
            .select('application_types')
            .eq('event_id', eventData.id)
            .single();
            
          const applicationTypes = appSettings?.application_types || [];
          
          // Combine data
          const fullEventData: EventDetails = {
            id: eventData.id,
            name: eventData.name,
            description: eventData.description || '',
            event_slug: eventData.event_slug,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            location: eventData.location,
            venue: eventData.venue || '',
            status: eventData.status,
            applications_enabled: modules?.applications_enabled || false,
            ticketing_enabled: modules?.ticketing_enabled || false,
            consent_forms_enabled: modules?.consent_forms_enabled || false,
            application_types: applicationTypes
          };
          
          console.log('Setting event data from Supabase:', fullEventData);
          setEvent(fullEventData);
          return;
        }
      }
      
      // Fallback to mock data if Supabase fetch fails
      console.log('Using mock event data for slug:', eventSlug);
      
      // Use different mock data based on slug to help with testing
      if (eventSlug === 'gwts') {
        setEvent({
          id: 2,
          name: 'Great Western Tattoo Show',
          description: 'The premier tattoo event in the West Country featuring top artists from across the UK and Europe.',
          event_slug: eventSlug,
          start_date: '2024-08-10',
          end_date: '2024-08-12',
          location: 'Bristol, UK',
          venue: 'Bristol Exhibition Centre',
          status: 'published',
          applications_enabled: true,
          ticketing_enabled: true,
          consent_forms_enabled: true,
          application_types: ['artist', 'piercer', 'performer', 'trader', 'volunteer']
        });
      } else {
        setEvent({
          id: 1,
          name: 'Ink Fest 2024',
          description: 'The premier tattoo convention on the West Coast featuring world-renowned artists, live demonstrations, competitions, and exclusive merchandise. Join us for three days of incredible artistry and community.',
          event_slug: eventSlug,
          start_date: '2024-03-15',
          end_date: '2024-03-17',
          location: 'Los Angeles, CA',
          venue: 'LA Convention Center',
          status: 'published',
          applications_enabled: true,
          ticketing_enabled: true,
          consent_forms_enabled: true,
          application_types: ['artist', 'piercer', 'performer', 'trader', 'volunteer', 'caterer']
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationTypeSelect = (type: string) => {
    setSelectedApplicationType(type);
    
    if (user) {
      // User is logged in, show account selection
      setShowAccountSelection(true);
    } else {
      // User not logged in, go directly to form
      setUseExistingAccount(false);
    }
  };

  const handleUseExistingAccount = () => {
    setUseExistingAccount(true);
    setShowAccountSelection(false);
    
    // Check if profile needs updating
    if (userProfile && (!userProfile.phone || !userProfile.location)) {
      setShowProfileUpdate(true);
    }
  };

  const handleCreateNewApplication = () => {
    setUseExistingAccount(false);
    setShowAccountSelection(false);
  };

  const handleProfileUpdate = async (updatedProfile: ProfileData) => {
    try {
      // In real implementation, update user profile via API
      console.log('Updating profile:', updatedProfile);
      setUserProfile(updatedProfile);
      setShowProfileUpdate(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleSkipProfileUpdate = () => {
    setShowProfileUpdate(false);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      // In real implementation, submit to API
      const submissionData = {
        event_id: event?.id,
        application_type: selectedApplicationType,
        used_existing_account: useExistingAccount,
        user_profile_snapshot: useExistingAccount ? userProfile : null,
        profile_updated_at: showProfileUpdate ? new Date().toISOString() : null,
        ...applicationData
      };
      
      console.log('Submitting application:', submissionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setApplicationSubmitted(true);
      setSelectedApplicationType(null);
      setShowAccountSelection(false);
      setShowProfileUpdate(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setSelectedApplicationType(null);
    setShowAccountSelection(false);
    setShowProfileUpdate(false);
    setUseExistingAccount(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getApplicationTypeInfo = (type: string) => {
    const info = {
      artist: {
        title: 'Tattoo Artist',
        description: 'Showcase your artistry and connect with clients',
        icon: '🎨'
      },
      piercer: {
        title: 'Piercer',
        description: 'Demonstrate your piercing expertise',
        icon: '💎'
      },
      performer: {
        title: 'Performer',
        description: 'Entertain crowds with your unique talents',
        icon: '🎭'
      },
      trader: {
        title: 'Trader',
        description: 'Sell your products and merchandise',
        icon: '🛍️'
      },
      volunteer: {
        title: 'Volunteer',
        description: 'Help make the event a success',
        icon: '🤝'
      },
      caterer: {
        title: 'Caterer',
        description: 'Provide food and beverages for attendees',
        icon: '🍕'
      }
    };
    return info[type as keyof typeof info] || { title: type, description: '', icon: '📋' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-300 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Show account selection prompt
  if (showAccountSelection && selectedApplicationType) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Application Types
          </button>
          
          <AccountSelectionPrompt
            eventName={event.name}
            applicationType={selectedApplicationType}
            onUseExistingAccount={handleUseExistingAccount}
            onCreateNewApplication={handleCreateNewApplication}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Show profile update prompt
  if (showProfileUpdate && userProfile) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setShowProfileUpdate(false)}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Account Selection
          </button>
          
          <ProfileUpdatePrompt
            currentProfile={userProfile}
            onUpdate={handleProfileUpdate}
            onSkip={handleSkipProfileUpdate}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Show application form if a type is selected
  if (selectedApplicationType) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Application Types
          </button>
          
          <DynamicApplicationForm
            applicationType={selectedApplicationType as any}
            eventId={event.id}
            eventName={event.name}
            useExistingAccount={useExistingAccount}
            existingProfile={useExistingAccount ? userProfile : null}
            onSubmit={handleApplicationSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Show success message if application was submitted
  if (applicationSubmitted) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Application Submitted!</h1>
            <p className="text-gray-300 mb-6">
              Thank you for your application to <span className="text-purple-400 font-medium">{event.name}</span>. 
              You will receive an email confirmation shortly, and we'll notify you about the status of your application.
            </p>
            {useExistingAccount && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  Your application has been linked to your TattSync account. You can track its progress in your dashboard.
                </p>
              </div>
            )}
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => {
                  setApplicationSubmitted(false);
                  setActiveTab('info');
                }}
                className="bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                View Event Details
              </button>
              <button
                onClick={() => navigate(user ? '/dashboard' : '/')}
                className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                {user ? 'Go to Dashboard' : 'Browse More Events'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            {/* Banner Image */}
            <div className="relative">
              {event.banner_image_url ? (
                <div className="w-full h-64 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
                  <img 
                    src={event.banner_image_url} 
                    alt={event.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center space-x-4">
                      {event.logo_url && (
                        <img 
                          src={event.logo_url} 
                          alt={`${event.name} logo`} 
                          className="w-20 h-20 rounded-lg object-cover border-2 border-white/20"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <h1 className="text-3xl font-bold text-white">{event.name}</h1>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex items-center space-x-4">
                    {event.logo_url && (
                      <img 
                        src={event.logo_url} 
                        alt={`${event.name} logo`} 
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <h1 className="text-3xl font-bold text-white">{event.name}</h1>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8">
              <p className="text-gray-300 mb-6">{event.description}</p>
              
              {/* Social Media Links */}
              {(event.website || event.instagram || event.facebook || event.tiktok) && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {event.website && (
                    <a 
                      href={event.website.startsWith('http') ? event.website : `https://${event.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                  
                  {event.instagram && (
                    <a 
                      href={`https://instagram.com/${event.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                    >
                      <svg 
                        className="w-4 h-4" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      <span>Instagram</span>
                    </a>
                  )}
                  
                  {event.facebook && (
                    <a 
                      href={event.facebook.startsWith('http') ? event.facebook : `https://facebook.com/${event.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                    >
                      <svg 
                        className="w-4 h-4" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                      <span>Facebook</span>
                    </a>
                  )}
                  
                  {event.tiktok && (
                    <a 
                      href={`https://tiktok.com/@${event.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                    >
                      <svg 
                        className="w-4 h-4" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                        <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                        <path d="M15 8v8a4 4 0 0 1-4 4"></path>
                        <path d="M15 8h-4"></path>
                      </svg>
                      <span>TikTok</span>
                    </a>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">{formatDate(event.start_date)}</p>
                    <p className="text-sm">to {formatDate(event.end_date)}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">{event.venue}</p>
                    <p className="text-sm">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">Open Registration</p>
                    <p className="text-sm">Multiple categories</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {event.applications_enabled && (
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Apply to Participate</span>
                  </button>
                )}
                
                {event.ticketing_enabled && (
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Buy Tickets</span>
                  </button>
                )}
                
                {event.consent_forms_enabled && (
                  <button
                    onClick={() => setActiveTab('consent')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Consent Forms</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { key: 'info', label: 'Event Info' },
            ...(event.applications_enabled ? [{ key: 'apply', label: 'Apply' }] : []),
            ...(event.ticketing_enabled ? [{ key: 'tickets', label: 'Tickets' }] : []),
            ...(event.consent_forms_enabled ? [{ key: 'consent', label: 'Consent Forms' }] : [])
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          {activeTab === 'info' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Event Information</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 mb-4">
                  {event.description}
                </p>
                <h3 className="text-xl font-semibold text-white mb-3">What to Expect</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• World-class tattoo artists from around the globe</li>
                  <li>• Live tattooing demonstrations and competitions</li>
                  <li>• Piercing and body modification showcases</li>
                  <li>• Exclusive merchandise and art sales</li>
                  <li>• Networking opportunities with industry professionals</li>
                  <li>• Educational workshops and seminars</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'apply' && event.applications_enabled && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Apply to Participate</h2>
              <p className="text-gray-300 mb-6">
                Join {event.name} as a participant! Choose your category below and submit your application.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.application_types.map((type) => {
                  const typeInfo = getApplicationTypeInfo(type);
                  return (
                    <div key={type} className="border border-white/20 rounded-lg p-6 hover:bg-white/5 transition-colors">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{typeInfo.icon}</div>
                        <h3 className="text-lg font-semibold text-white mb-2">{typeInfo.title}</h3>
                        <p className="text-gray-300 mb-4">{typeInfo.description}</p>
                      </div>
                      <button 
                        onClick={() => handleApplicationTypeSelect(type)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Apply as {typeInfo.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && event.ticketing_enabled && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Event Tickets</h2>
              <p className="text-gray-300 mb-6">
                Purchase your tickets to attend {event.name}. All prices are in GBP (£).
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { type: 'day', title: 'Day Pass', price: '£25.00', description: 'Access for one day of your choice' },
                  { type: 'weekend', title: 'Weekend Pass', price: '£65.00', description: 'Full access to all three days' },
                  { type: 'vip', title: 'VIP Pass', price: '£120.00', description: 'Premium access with exclusive perks' }
                ].map((ticket) => (
                  <div key={ticket.type} className="border border-white/20 rounded-lg p-6 hover:bg-white/5 transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-2">{ticket.title}</h3>
                    <p className="text-2xl font-bold text-purple-400 mb-2">{ticket.price}</p>
                    <p className="text-gray-300 mb-4">{ticket.description}</p>
                    <button className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Buy {ticket.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'consent' && event.consent_forms_enabled && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Consent & Medical Forms</h2>
              <p className="text-gray-300 mb-6">
                Complete the required consent and medical history forms before your appointment.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: 'Tattoo Consent Form', description: 'Required for all tattoo procedures', required: true },
                  { title: 'Medical History Form', description: 'Confidential medical information', required: true },
                  { title: 'Photography Waiver', description: 'Permission for event photography', required: false }
                ].map((form, index) => (
                  <div key={index} className="border border-white/20 rounded-lg p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{form.title}</h3>
                      <p className="text-gray-300 text-sm">{form.description}</p>
                      {form.required && (
                        <span className="text-red-400 text-xs">Required</span>
                      )}
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Complete Form
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}