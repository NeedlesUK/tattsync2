import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, 
  Calendar, 
  Ticket, 
  Heart, 
  MessageCircle, 
  Gift, 
  Award, 
  FileText,
  Bell,
  Mail,
  Users,
  CreditCard,
  Info,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EventDetailsModal } from '../components/settings/EventDetailsModal';
import { TicketSettingsModal } from '../components/settings/TicketSettingsModal';
import { ConsentFormSettingsModal } from '../components/settings/ConsentFormSettingsModal';
import { MessagingSettingsModal } from '../components/settings/MessagingSettingsModal';
import { GlobalDealsModal } from '../components/settings/GlobalDealsModal';
import { EventDealsModal } from '../components/settings/EventDealsModal';
import { PaymentSettingsModal } from '../components/settings/PaymentSettingsModal';
import { PaymentPricingModal } from '../components/settings/PaymentPricingModal';
import { ApplicationSettingsModal } from '../components/settings/ApplicationSettingsModal';
import { EventInformationModal } from '../components/settings/EventInformationModal';
import { EmailTemplatesModal } from '../components/settings/EmailTemplatesModal';
import { NotificationRulesModal } from '../components/settings/NotificationRulesModal';

export function EventSettingsPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [eventModules, setEventModules] = useState<any>(null);
  
  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTicketSettingsModalOpen, setIsTicketSettingsModalOpen] = useState(false);
  const [isConsentFormSettingsModalOpen, setIsConsentFormSettingsModalOpen] = useState(false);
  const [isMessagingSettingsModalOpen, setIsMessagingSettingsModalOpen] = useState(false);
  const [isEventDealsModalOpen, setIsEventDealsModalOpen] = useState(false);
  const [isPaymentSettingsModalOpen, setIsPaymentSettingsModalOpen] = useState(false);
  const [isApplicationSettingsModalOpen, setIsApplicationSettingsModalOpen] = useState(false);
  const [isEventInformationModalOpen, setIsEventInformationModalOpen] = useState(false);
  const [isEmailTemplatesModalOpen, setIsEmailTemplatesModalOpen] = useState(false);
  const [isNotificationRulesModalOpen, setIsNotificationRulesModalOpen] = useState(false);

  // Get event ID from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const eventId = searchParams.get('event');

  useEffect(() => {
    if (!eventId) {
      navigate('/events');
      return;
    }
    
    fetchEventDetails();
  }, [eventId, navigate]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      
      if (supabase) {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (eventError) {
          console.error('Error fetching event details:', eventError);
          navigate('/events');
          return;
        }
        
        if (eventData) {
          setEvent(eventData);
          
          // Fetch event modules
          const { data: modulesData, error: modulesError } = await supabase
            .from('event_modules')
            .select('*')
            .eq('event_id', eventId)
            .single();
            
          if (!modulesError && modulesData) {
            setEventModules(modulesData);
          } else {
            // If no modules exist yet, set defaults
            setEventModules({
              ticketing_enabled: false,
              applications_enabled: true,
              consent_forms_enabled: false,
              deals_enabled: false,
              messaging_enabled: true,
              booking_enabled: false,
              tattscore_enabled: false
            });
          }
        } else {
          navigate('/events');
        }
      } else {
        // Mock data for when Supabase is not available
        setEvent({
          id: eventId,
          name: 'Mock Event',
          description: 'This is a mock event for testing',
          event_slug: 'mock-event',
          start_date: '2024-08-15',
          end_date: '2024-08-17',
          location: 'London, UK',
          venue: 'ExCeL London',
          status: 'published'
        });
        
        setEventModules({
          ticketing_enabled: false,
          applications_enabled: true,
          consent_forms_enabled: false,
          deals_enabled: false,
          messaging_enabled: true,
          booking_enabled: false,
          tattscore_enabled: false
        });
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      navigate('/events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEventDetails = async (eventData: any) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventId);
          
        if (error) {
          console.error('Error updating event details:', error);
          throw error;
        }
        
        // Update local state
        setEvent(eventData);
      }
    } catch (error) {
      console.error('Error saving event details:', error);
      throw error;
    }
  };

  const handleSaveTicketSettings = async (ticketTypes: any[]) => {
    try {
      console.log('Saving ticket settings:', ticketTypes);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving ticket settings:', error);
      throw error;
    }
  };

  const handleSaveConsentFormSettings = async (settings: any) => {
    try {
      console.log('Saving consent form settings:', settings);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving consent form settings:', error);
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

  const handleSaveEventDeals = async (deals: any[]) => {
    try {
      console.log('Saving event deals:', deals);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving event deals:', error);
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

  const handleSaveApplicationSettings = async (settings: any) => {
    try {
      console.log('Saving application settings:', settings);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving application settings:', error);
      throw error;
    }
  };

  const handleSaveEventInformation = async (information: any[]) => {
    try {
      console.log('Saving event information:', information);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving event information:', error);
      throw error;
    }
  };

  const handleSaveEmailTemplates = async (templates: any[]) => {
    try {
      console.log('Saving email templates:', templates);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving email templates:', error);
      throw error;
    }
  };

  const handleSaveNotificationRules = async (rules: any[]) => {
    try {
      console.log('Saving notification rules:', rules);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving notification rules:', error);
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

  if (!event) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-300 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{event.name}</h1>
              <p className="text-gray-300">Event Settings</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'published' 
                  ? 'bg-green-500/20 text-green-400' 
                  : event.status === 'draft'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsDetailsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Event Details</h3>
                <p className="text-gray-300 text-sm">Basic event information</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-300">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' - '}
                  {new Date(event.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center text-gray-300">
                <Globe className="w-4 h-4 mr-2" />
                <span>{event.venue}, {event.location}</span>
              </div>
            </div>
          </div>

          {/* Ticket Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsTicketSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Ticket Settings</h3>
                <p className="text-gray-300 text-sm">Manage ticket types and pricing</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">
                {eventModules?.ticketing_enabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="text-teal-400 text-sm">Configure →</span>
            </div>
          </div>

          {/* Consent Form Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsConsentFormSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Consent Forms</h3>
                <p className="text-gray-300 text-sm">Manage consent form settings</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">
                {eventModules?.consent_forms_enabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="text-red-400 text-sm">Configure →</span>
            </div>
          </div>

          {/* Messaging Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsMessagingSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Messaging</h3>
                <p className="text-gray-300 text-sm">Configure messaging settings</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">
                {eventModules?.messaging_enabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="text-blue-400 text-sm">Configure →</span>
            </div>
          </div>

          {/* Event Deals */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsEventDealsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Deals & Offers</h3>
                <p className="text-gray-300 text-sm">Manage promotional deals</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">
                {eventModules?.deals_enabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="text-green-400 text-sm">Configure →</span>
            </div>
          </div>

          {/* Payment Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsPaymentSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Settings</h3>
                <p className="text-gray-300 text-sm">Configure payment methods</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Payment methods</span>
              <span className="text-orange-400 text-sm">Configure →</span>
            </div>
          </div>

          {/* Application Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsApplicationSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Applications</h3>
                <p className="text-gray-300 text-sm">Configure application forms</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">
                {eventModules?.applications_enabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="text-purple-400 text-sm">Configure →</span>
            </div>
          </div>

          {/* Event Information */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsEventInformationModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Info className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Information</h3>
                <p className="text-gray-300 text-sm">Manage event information</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Content management</span>
              <span className="text-blue-400 text-sm">Configure →</span>
            </div>
          </div>

          {/* Email Templates */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsEmailTemplatesModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Email Templates</h3>
                <p className="text-gray-300 text-sm">Configure email templates</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Approval & rejection emails</span>
              <span className="text-yellow-400 text-sm">Configure →</span>
            </div>
          </div>

          {/* Notification Rules */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsNotificationRulesModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Notification Rules</h3>
                <p className="text-gray-300 text-sm">Configure notification rules</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Automated notifications</span>
              <span className="text-green-400 text-sm">Configure →</span>
            </div>
          </div>
        </div>

        {/* Modals */}
        <EventDetailsModal
          eventId={parseInt(eventId || '0')}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onSave={handleSaveEventDetails}
          initialData={event}
        />
        
        <TicketSettingsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          eventStartDate={event.start_date}
          eventEndDate={event.end_date}
          isOpen={isTicketSettingsModalOpen}
          onClose={() => setIsTicketSettingsModalOpen(false)}
          onSave={handleSaveTicketSettings}
        />
        
        <ConsentFormSettingsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isConsentFormSettingsModalOpen}
          onClose={() => setIsConsentFormSettingsModalOpen(false)}
          onSave={handleSaveConsentFormSettings}
        />
        
        <MessagingSettingsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isMessagingSettingsModalOpen}
          onClose={() => setIsMessagingSettingsModalOpen(false)}
          onSave={handleSaveMessagingSettings}
        />
        
        <EventDealsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isEventDealsModalOpen}
          onClose={() => setIsEventDealsModalOpen(false)}
          onSave={handleSaveEventDeals}
        />
        
        <PaymentSettingsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isPaymentSettingsModalOpen}
          onClose={() => setIsPaymentSettingsModalOpen(false)}
          onSave={handleSavePaymentSettings}
        />
        
        <ApplicationSettingsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isApplicationSettingsModalOpen}
          onClose={() => setIsApplicationSettingsModalOpen(false)}
          onSave={handleSaveApplicationSettings}
        />
        
        <EventInformationModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isEventInformationModalOpen}
          onClose={() => setIsEventInformationModalOpen(false)}
          onSave={handleSaveEventInformation}
        />
        
        <EmailTemplatesModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isEmailTemplatesModalOpen}
          onClose={() => setIsEmailTemplatesModalOpen(false)}
          onSave={handleSaveEmailTemplates}
        />
        
        <NotificationRulesModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isNotificationRulesModalOpen}
          onClose={() => setIsNotificationRulesModalOpen(false)}
          onSave={handleSaveNotificationRules}
        />
      </div>
    </div>
  );
}