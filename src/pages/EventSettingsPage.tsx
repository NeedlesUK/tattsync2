import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Mail, 
  Bell, 
  Calendar, 
  Users, 
  CreditCard, 
  Heart, 
  Award, 
  MessageCircle, 
  FileText, 
  Gift, 
  BarChart, 
  UserPlus
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

export function EventSettingsPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  
  // Modal states
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  const [isApplicationSettingsModalOpen, setIsApplicationSettingsModalOpen] = useState(false);
  const [isPaymentSettingsModalOpen, setIsPaymentSettingsModalOpen] = useState(false);
  const [isTicketSettingsModalOpen, setIsTicketSettingsModalOpen] = useState(false);
  const [isConsentFormSettingsModalOpen, setIsConsentFormSettingsModalOpen] = useState(false);
  const [isMessagingSettingsModalOpen, setIsMessagingSettingsModalOpen] = useState(false);
  const [isEmailTemplatesModalOpen, setIsEmailTemplatesModalOpen] = useState(false);
  const [isNotificationRulesModalOpen, setIsNotificationRulesModalOpen] = useState(false);
  const [isAdminAccessModalOpen, setIsAdminAccessModalOpen] = useState(false);
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);

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
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (error) {
          console.error('Error fetching event details:', error);
          navigate('/events');
          return;
        }
        
        if (data) {
          console.log('Fetched event details:', data);
          setEvent(data);
        } else {
          navigate('/events');
        }
      } else {
        // Mock data for when Supabase is not available
        setEvent({
          id: eventId,
          name: 'Ink Fest 2024',
          description: 'The premier tattoo convention on the West Coast',
          event_slug: 'ink-fest-2024',
          start_date: '2024-03-15',
          end_date: '2024-03-17',
          location: 'Los Angeles, CA',
          venue: 'LA Convention Center',
          status: 'published',
          max_attendees: 500
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
      console.log('Saving event details:', eventData);
      // In a real implementation, save to database
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
      console.log('Saving ticket settings:', settings);
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

  const handleSaveAdminAccess = async (admins: any[]) => {
    try {
      console.log('Saving admin access:', admins);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving admin access:', error);
      throw error;
    }
  };

  const handleSaveStatistics = async (statistics: any) => {
    try {
      console.log('Saving statistics settings:', statistics);
      // In a real implementation, save to database
    } catch (error) {
      console.error('Error saving statistics settings:', error);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsEventDetailsModalOpen(true)}
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
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Name, dates, location</span>
              <span className="text-purple-400 text-sm">Configure →</span>
            </div>
          </div>
          
          {/* Application Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsApplicationSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Applications</h3>
                <p className="text-gray-300 text-sm">Application form settings</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Form fields, limits</span>
              <span className="text-teal-400 text-sm">Configure →</span>
            </div>
          </div>
          
          {/* Payment Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsPaymentSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payments</h3>
                <p className="text-gray-300 text-sm">Payment methods and pricing</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Stripe, bank transfer, cash</span>
              <span className="text-green-400 text-sm">Configure →</span>
            </div>
          </div>
          
          {/* Ticket Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsTicketSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tickets</h3>
                <p className="text-gray-300 text-sm">Ticket types and pricing</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Day passes, weekend passes</span>
              <span className="text-blue-400 text-sm">Configure →</span>
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
                <p className="text-gray-300 text-sm">Consent form settings</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Enable/disable consent forms</span>
              <span className="text-red-400 text-sm">Configure →</span>
            </div>
          </div>
          
          {/* Messaging Settings */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsMessagingSettingsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Messaging</h3>
                <p className="text-gray-300 text-sm">Messaging settings</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Permissions, notifications</span>
              <span className="text-orange-400 text-sm">Configure →</span>
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
                <p className="text-gray-300 text-sm">Customize email templates</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Approval, rejection emails</span>
              <span className="text-yellow-400 text-sm">Configure →</span>
            </div>
          </div>
          
          {/* Notification Rules */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsNotificationRulesModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Notification Rules</h3>
                <p className="text-gray-300 text-sm">Automated notifications</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Triggers, recipients</span>
              <span className="text-pink-400 text-sm">Configure →</span>
            </div>
          </div>
          
          {/* Admin Access */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsAdminAccessModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Admin Access</h3>
                <p className="text-gray-300 text-sm">Manage event administrators</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Access control</span>
              <span className="text-purple-400 text-sm">Configure →</span>
            </div>
          </div>
          
          {/* Statistics */}
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setIsStatisticsModalOpen(true)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BarChart className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Statistics</h3>
                <p className="text-gray-300 text-sm">Event analytics and reporting</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Coming soon</span>
              <span className="text-blue-400 text-sm">Configure →</span>
            </div>
          </div>
        </div>
        
        <EventDetailsModal
          eventId={parseInt(eventId || '0')}
          isOpen={isEventDetailsModalOpen}
          onClose={() => setIsEventDetailsModalOpen(false)}
          onSave={handleSaveEventDetails}
          initialData={event}
        />
        
        <ApplicationSettingsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isApplicationSettingsModalOpen}
          onClose={() => setIsApplicationSettingsModalOpen(false)}
          onSave={handleSaveApplicationSettings}
        />
        
        <PaymentSettingsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isPaymentSettingsModalOpen}
          onClose={() => setIsPaymentSettingsModalOpen(false)}
          onSave={handleSavePaymentSettings}
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
        
        <AdminAccessModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isAdminAccessModalOpen}
          onClose={() => setIsAdminAccessModalOpen(false)}
          onSave={handleSaveAdminAccess}
        />
        
        <StatisticsModal
          eventId={parseInt(eventId || '0')}
          eventName={event.name}
          isOpen={isStatisticsModalOpen}
          onClose={() => setIsStatisticsModalOpen(false)}
          onSave={handleSaveStatistics}
        />
      </div>
    </div>
  );
}