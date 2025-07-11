import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Calendar, 
  Users, 
  CreditCard, 
  MessageCircle, 
  Gift, 
  Heart, 
  Award, 
  FileText, 
  Bell, 
  Shield, 
  BarChart,
  Mail,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EventDetailsModal } from '../components/settings/EventDetailsModal';
import { ApplicationSettingsModal } from '../components/settings/ApplicationSettingsModal';
import { PaymentSettingsModal } from '../components/settings/PaymentSettingsModal';
import { TicketSettingsModal } from '../components/settings/TicketSettingsModal';
import { ConsentFormSettingsModal } from '../components/settings/ConsentFormSettingsModal';
import { MessagingSettingsModal } from '../components/settings/MessagingSettingsModal';
import { EmailTemplatesModal } from '../components/settings/EmailTemplatesModal';
import { NotificationRulesModal } from '../components/settings/NotificationRulesModal';
import { AdminAccessModal } from '../components/settings/AdminAccessModal';
import { StatisticsModal } from '../components/settings/StatisticsModal';
import { EventInformationModal } from '../components/settings/EventInformationModal';
import { EventDealsModal } from '../components/settings/EventDealsModal';

export function EventSettingsPage() {
  const { user, supabase } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [moduleAvailability, setModuleAvailability] = useState({
    ticketing_enabled: false,
    consent_forms_enabled: false,
    tattscore_enabled: false
  });

  // Get event ID from URL
  const eventId = searchParams.get('event');

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(parseInt(eventId));
      fetchModuleAvailability(parseInt(eventId));
    } else {
      // No event ID provided, redirect to events page
      navigate('/events');
    }
  }, [eventId, navigate]);

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
          console.error('Error fetching event details:', error);
          throw error;
        }
        
        if (data) {
          console.log('Event details:', data);
          setEvent(data);
        } else {
          // Event not found
          navigate('/events');
        }
      } else {
        // Mock data for when Supabase is not available
        setEvent({
          id: id,
          name: 'The Great Western Tattoo Show',
          description: 'The premier tattoo event in the West Country',
          event_slug: 'gwts',
          start_date: '2024-08-10',
          end_date: '2024-08-12',
          location: 'Bristol, UK',
          venue: 'Bristol Exhibition Centre',
          max_attendees: 500,
          status: 'published',
          event_manager_id: user?.id
        });
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModuleAvailability = async (id: number) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('event_modules')
          .select('*')
          .eq('event_id', id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching module availability:', error);
          return;
        }
        
        if (data) {
          setModuleAvailability({
            ticketing_enabled: data.ticketing_enabled || false,
            consent_forms_enabled: data.consent_forms_enabled || false,
            tattscore_enabled: data.tattscore_enabled || false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching module availability:', error);
    }
  };

  const handleSaveEventDetails = async (eventData: any) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);
          
        if (error) {
          console.error('Error updating event details:', error);
          throw error;
        }
        
        // Refresh event details
        fetchEventDetails(event.id);
      }
    } catch (error) {
      console.error('Error saving event details:', error);
      throw error;
    }
  };

  const handleSaveApplicationSettings = async (settings: any) => {
    try {
      console.log('Saving application settings:', settings);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving application settings:', error);
      throw error;
    }
  };

  const handleSavePaymentSettings = async (settings: any) => {
    try {
      console.log('Saving payment settings:', settings);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving payment settings:', error);
      throw error;
    }
  };

  const handleSaveTicketSettings = async (settings: any) => {
    try {
      if (!moduleAvailability.ticketing_enabled) {
        throw new Error('Ticketing module is not enabled for this event');
      }
      
      console.log('Saving ticket settings:', settings);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving ticket settings:', error);
      throw error;
    }
  };

  const handleSaveConsentSettings = async (settings: any) => {
    try {
      if (!moduleAvailability.consent_forms_enabled) {
        throw new Error('Consent Forms module is not enabled for this event');
      }
      
      console.log('Saving consent settings:', settings);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving consent settings:', error);
      throw error;
    }
  };

  const handleSaveMessagingSettings = async (settings: any) => {
    try {
      console.log('Saving messaging settings:', settings);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving messaging settings:', error);
      throw error;
    }
  };

  const handleSaveEmailTemplates = async (templates: any) => {
    try {
      console.log('Saving email templates:', templates);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving email templates:', error);
      throw error;
    }
  };

  const handleSaveNotificationRules = async (rules: any) => {
    try {
      console.log('Saving notification rules:', rules);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving notification rules:', error);
      throw error;
    }
  };

  const handleSaveAdminAccess = async (admins: any) => {
    try {
      console.log('Saving admin access:', admins);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving admin access:', error);
      throw error;
    }
  };

  const handleSaveStatistics = async (settings: any) => {
    try {
      console.log('Saving statistics settings:', settings);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving statistics settings:', error);
      throw error;
    }
  };

  const handleSaveEventInformation = async (information: any) => {
    try {
      console.log('Saving event information:', information);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving event information:', error);
      throw error;
    }
  };

  const handleSaveDeals = async (deals: any) => {
    try {
      console.log('Saving deals:', deals);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving deals:', error);
      throw error;
    }
  };

  const handleOpenModal = (modalName: string) => {
    // Check if module is enabled before opening modal
    if (modalName === 'tickets' && !moduleAvailability.ticketing_enabled) {
      alert('Ticketing module is not enabled for this event. Please enable it in the Admin Dashboard.');
      return;
    }
    
    if (modalName === 'consent' && !moduleAvailability.consent_forms_enabled) {
      alert('Consent Forms module is not enabled for this event. Please enable it in the Admin Dashboard.');
      return;
    }
    
    if (modalName === 'tattscore' && !moduleAvailability.tattscore_enabled) {
      alert('TattScore module is not enabled for this event. Please enable it in the Admin Dashboard.');
      return;
    }
    
    setActiveModal(modalName);
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{event.name} Settings</h1>
          <p className="text-gray-300">Configure your event settings and modules</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Event Details</h2>
                <p className="text-gray-300 text-sm">Basic event information</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Name, dates, location</p>
            <button
              onClick={() => handleOpenModal('details')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Applications */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Applications</h2>
                <p className="text-gray-300 text-sm">Application form settings</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Form fields, limits</p>
            <button
              onClick={() => handleOpenModal('applications')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Payments */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Payments</h2>
                <p className="text-gray-300 text-sm">Payment methods and pricing</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Stripe, bank transfer, cash</p>
            <button
              onClick={() => handleOpenModal('payments')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Tickets */}
          <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 ${!moduleAvailability.ticketing_enabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tickets</h2>
                <p className="text-gray-300 text-sm">Ticket types and pricing</p>
              </div>
              {!moduleAvailability.ticketing_enabled && (
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                  Disabled
                </span>
              )}
            </div>
            <p className="text-gray-300 mb-4">Day passes, weekend passes</p>
            <button
              onClick={() => handleOpenModal('tickets')}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto ${!moduleAvailability.ticketing_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!moduleAvailability.ticketing_enabled}
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Consent Forms */}
          <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 ${!moduleAvailability.consent_forms_enabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Consent Forms</h2>
                <p className="text-gray-300 text-sm">Consent form settings</p>
              </div>
              {!moduleAvailability.consent_forms_enabled && (
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                  Disabled
                </span>
              )}
            </div>
            <p className="text-gray-300 mb-4">Enable/disable consent forms</p>
            <button
              onClick={() => handleOpenModal('consent')}
              className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto ${!moduleAvailability.consent_forms_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!moduleAvailability.consent_forms_enabled}
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Messaging */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Messaging</h2>
                <p className="text-gray-300 text-sm">Messaging settings</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Permissions, notifications</p>
            <button
              onClick={() => handleOpenModal('messaging')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Email Templates */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Email Templates</h2>
                <p className="text-gray-300 text-sm">Customize email templates</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Approval, rejection emails</p>
            <button
              onClick={() => handleOpenModal('email')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Notification Rules */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notification Rules</h2>
                <p className="text-gray-300 text-sm">Automated notifications</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Triggers, recipients</p>
            <button
              onClick={() => handleOpenModal('notifications')}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Admin Access */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Access</h2>
                <p className="text-gray-300 text-sm">Manage event administrators</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Access control</p>
            <button
              onClick={() => handleOpenModal('admin')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Statistics */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <BarChart className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Statistics</h2>
                <p className="text-gray-300 text-sm">Event analytics and reporting</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Coming soon</p>
            <button
              onClick={() => handleOpenModal('statistics')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Event Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Event Information</h2>
                <p className="text-gray-300 text-sm">Manage event information</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Content, media, FAQs</p>
            <button
              onClick={() => handleOpenModal('information')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Deals & Offers */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Deals & Offers</h2>
                <p className="text-gray-300 text-sm">Manage promotional offers</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Discounts, special offers</p>
            <button
              onClick={() => handleOpenModal('deals')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-auto"
            >
              <span>Configure</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventDetailsModal
        eventId={event.id}
        eventName={event.name}
        eventStartDate={event.start_date}
        eventEndDate={event.end_date}
        isOpen={activeModal === 'details'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveEventDetails}
        initialData={event}
      />

      <ApplicationSettingsModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'applications'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveApplicationSettings}
      />

      <PaymentSettingsModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'payments'}
        onClose={() => setActiveModal(null)}
        onSave={handleSavePaymentSettings}
      />

      {moduleAvailability.ticketing_enabled && (
        <TicketSettingsModal
          eventId={event.id}
          eventName={event.name}
          eventStartDate={event.start_date}
          eventEndDate={event.end_date}
          isOpen={activeModal === 'tickets'}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveTicketSettings}
        />
      )}

      {moduleAvailability.consent_forms_enabled && (
        <ConsentFormSettingsModal
          eventId={event.id}
          eventName={event.name}
          isOpen={activeModal === 'consent'}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveConsentSettings}
        />
      )}

      <MessagingSettingsModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'messaging'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveMessagingSettings}
      />

      <EmailTemplatesModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'email'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveEmailTemplates}
      />

      <NotificationRulesModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveNotificationRules}
      />

      <AdminAccessModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'admin'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveAdminAccess}
      />

      <StatisticsModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'statistics'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveStatistics}
      />

      <EventInformationModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'information'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveEventInformation}
      />

      <EventDealsModal
        eventId={event.id}
        eventName={event.name}
        isOpen={activeModal === 'deals'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveDeals}
      />
    </div>
  );
}