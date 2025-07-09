import React, { useState, useEffect } from 'react';
import { Settings, Info, Gift, Tag, Users, MessageCircle, Calendar, CreditCard, FileText, Bell, Globe, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { EventInformationModal } from '../components/settings/EventInformationModal';
import { EventDealsModal } from '../components/settings/EventDealsModal';
import { GlobalDealsModal } from '../components/settings/GlobalDealsModal';

export function EventSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [eventId, setEventId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInformationModalOpen, setIsInformationModalOpen] = useState(false);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState(false);
  const [isGlobalDealsModalOpen, setIsGlobalDealsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [event, setEvent] = useState<any>({
    id: 1,
    name: 'Loading...',
    status: 'draft',
    start_date: '',
    end_date: '',
    location: '',
    venue: ''
  });

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  // Check if user is event manager
  const isEventManager = user?.role === 'event_manager' || user?.role === 'event_admin';

  useEffect(() => {
    // Get event ID from query params
    const params = new URLSearchParams(location.search);
    const eventIdParam = params.get('event');
    
    if (eventIdParam) {
      setEventId(parseInt(eventIdParam));
      fetchEventDetails(parseInt(eventIdParam));
    } else {
      setIsLoading(false);
    }
  }, [location.search]);
  
  const fetchEventDetails = async (id: number) => {
    try {
      setIsLoading(true);
      
      if (supabase) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching event:', error);
          throw error;
        }
        
        if (data) {
          setEvent(data);
        }
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInformation = async (information: any) => {
    try {
      // In real implementation, save to API
      console.log('Saving event information:', information);
    } catch (error) {
      console.error('Error saving event information:', error);
    }
  };

  const handleSaveDeals = async (deals: any) => {
    try {
      // In real implementation, save to API
      console.log('Saving event deals:', deals);
    } catch (error) {
      console.error('Error saving event deals:', error);
    }
  };

  const handleSaveGlobalDeals = async (data: any) => {
    try {
      // In real implementation, save to API
      console.log('Saving global deals:', data);
    } catch (error) {
      console.error('Error saving global deals:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If no event ID was provided or event not found
  if (!eventId) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">No Event Selected</h1>
            <p className="text-gray-300 mb-6">Please select an event to manage from the events page.</p>
            <button
              onClick={() => navigate('/events')}
              className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Go to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: Settings,
      description: 'Basic event settings and configuration',
      items: [
        {
          title: 'Event Details',
          description: 'Update event name, dates, location, and other basic information',
          icon: Calendar,
          action: () => console.log('Edit event details')
        },
        {
          title: 'Event Information',
          description: 'Manage information pages visible to attendees',
          icon: Info,
          action: () => setIsInformationModalOpen(true)
        },
        {
          title: 'Deals & Offers',
          description: 'Create special deals and offers for event attendees',
          icon: Gift,
          action: () => setIsDealsModalOpen(true)
        }
      ]
    },
    {
      id: 'modules',
      title: 'Event Modules',
      icon: Tag,
      description: 'Enable or disable event features',
      items: [
        {
          title: 'Applications',
          description: 'Configure application types, forms, and approval process',
          icon: FileText,
          action: () => console.log('Configure applications')
        },
        {
          title: 'Payments',
          description: 'Set up payment methods, pricing, and installment options',
          icon: CreditCard,
          action: () => console.log('Configure payments')
        },
        {
          title: 'Messaging',
          description: 'Configure messaging settings and templates',
          icon: MessageCircle,
          action: () => console.log('Configure messaging')
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Email and system notification settings',
      items: [
        {
          title: 'Email Templates',
          description: 'Customize email templates for various event communications',
          icon: Mail,
          action: () => console.log('Edit email templates')
        },
        {
          title: 'Notification Rules',
          description: 'Set up when and how notifications are sent',
          icon: Bell,
          action: () => console.log('Configure notification rules')
        }
      ]
    },
    {
      id: 'team',
      title: 'Team Management',
      icon: Users,
      description: 'Manage event staff and permissions',
      items: [
        {
          title: 'Team Members',
          description: 'Add or remove team members and set permissions',
          icon: Users,
          action: () => console.log('Manage team members')
        }
      ]
    }
  ];

  // Admin-only sections
  const adminSections = [
    {
      id: 'admin',
      title: 'Master Admin',
      icon: Shield,
      description: 'System-wide settings and controls',
      items: [
        {
          title: 'Global Deals',
          description: 'Manage deals available across all events',
          icon: Globe,
          action: () => setIsGlobalDealsModalOpen(true)
        }
      ]
    }
  ];

  // Combine sections based on user role
  const allSections = isAdmin ? [...settingsSections, ...adminSections] : settingsSections;

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Event Settings</h1>
            <p className="text-gray-300">
              {isEventManager ? `Manage settings for ${event.name}` : 'System-wide settings and controls'}
            </p>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 space-y-1">
            {allSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === section.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.title}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {allSections.map((section) => (
              <div key={section.id} className={activeTab === section.id ? 'block' : 'hidden'}>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <section.icon className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  </div>
                  <p className="text-gray-300">{section.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.items.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={item.action}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      </div>
                      <p className="text-gray-300 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        <EventInformationModal
          eventId={event.id}
          eventName={event.name}
          isOpen={isInformationModalOpen}
          onClose={() => setIsInformationModalOpen(false)}
          onSave={handleSaveInformation}
        />

        <EventDealsModal
          eventId={event.id}
          eventName={event.name}
          isOpen={isDealsModalOpen}
          onClose={() => setIsDealsModalOpen(false)}
          onSave={handleSaveDeals}
        />

        {isAdmin && (
          <GlobalDealsModal
            isOpen={isGlobalDealsModalOpen}
            onClose={() => setIsGlobalDealsModalOpen(false)}
            onSave={handleSaveGlobalDeals}
          />
        )}
      </div>
    </div>
  );
}