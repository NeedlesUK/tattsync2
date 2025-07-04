import React, { useState } from 'react';
import { X, Save, Calendar, Clock, MessageCircle, Phone, Mail, Instagram, Globe } from 'lucide-react';

interface BookingPreferencesModalProps {
  applicationId: number;
  applicantName: string;
  applicationType: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: any) => void;
}

export function BookingPreferencesModal({
  applicationId,
  applicantName,
  applicationType,
  isOpen,
  onClose,
  onSave
}: BookingPreferencesModalProps) {
  const [preferences, setPreferences] = useState({
    booking_status: 'taking_walkups',
    contact_method: 'instagram',
    contact_details: '',
    booking_notes: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const bookingStatusOptions = [
    {
      value: 'fully_booked',
      label: 'Fully Booked',
      description: 'Not taking any new bookings for this event',
      color: 'red'
    },
    {
      value: 'advance_bookings',
      label: 'Taking Advance Bookings',
      description: 'Accepting bookings in advance of the event',
      color: 'yellow'
    },
    {
      value: 'taking_walkups',
      label: 'Taking Walk-ups',
      description: 'Available for walk-in clients at the event',
      color: 'green'
    }
  ];

  const contactMethods = [
    { value: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username' },
    { value: 'email', label: 'Email', icon: Mail, placeholder: 'your@email.com' },
    { value: 'phone', label: 'Phone', icon: Phone, placeholder: '+44 7700 900123' },
    { value: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
    { value: 'message', label: 'Event Messaging', icon: MessageCircle, placeholder: 'Contact via event messaging system' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(preferences);
      onClose();
    } catch (error) {
      console.error('Error saving booking preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getContactMethodIcon = (method: string) => {
    const contactMethod = contactMethods.find(cm => cm.value === method);
    return contactMethod ? contactMethod.icon : MessageCircle;
  };

  const getContactMethodPlaceholder = (method: string) => {
    const contactMethod = contactMethods.find(cm => cm.value === method);
    return contactMethod ? contactMethod.placeholder : '';
  };

  // Only show booking preferences for artists and piercers
  if (!['artist', 'piercer'].includes(applicationType)) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Booking Preferences</h2>
            <p className="text-gray-300 text-sm">{applicantName} • {applicationType}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Status */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Booking Availability</h3>
            <div className="space-y-3">
              {bookingStatusOptions.map((option) => (
                <label key={option.value} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="booking_status"
                    value={option.value}
                    checked={preferences.booking_status === option.value}
                    onChange={(e) => setPreferences(prev => ({ ...prev, booking_status: e.target.value }))}
                    className="sr-only"
                  />
                  <div className={`border rounded-lg p-4 transition-all ${
                    preferences.booking_status === option.value
                      ? `border-${option.color}-500 bg-${option.color}-500/20`
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        preferences.booking_status === option.value
                          ? `bg-${option.color}-500`
                          : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <h4 className="text-white font-medium">{option.label}</h4>
                        <p className="text-gray-300 text-sm">{option.description}</p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Information - Only show if not fully booked */}
          {preferences.booking_status !== 'fully_booked' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contactMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label key={method.value} className="block cursor-pointer">
                          <input
                            type="radio"
                            name="contact_method"
                            value={method.value}
                            checked={preferences.contact_method === method.value}
                            onChange={(e) => setPreferences(prev => ({ ...prev, contact_method: e.target.value }))}
                            className="sr-only"
                          />
                          <div className={`border rounded-lg p-3 transition-all flex items-center space-x-3 ${
                            preferences.contact_method === method.value
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}>
                            <Icon className="w-5 h-5 text-gray-400" />
                            <span className="text-white text-sm">{method.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Details
                  </label>
                  <div className="relative">
                    {React.createElement(getContactMethodIcon(preferences.contact_method), {
                      className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    })}
                    <input
                      type="text"
                      value={preferences.contact_details}
                      onChange={(e) => setPreferences(prev => ({ ...prev, contact_details: e.target.value }))}
                      placeholder={getContactMethodPlaceholder(preferences.contact_method)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Notes (Optional)
                  </label>
                  <textarea
                    value={preferences.booking_notes}
                    onChange={(e) => setPreferences(prev => ({ ...prev, booking_notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Additional information for potential clients (e.g., minimum size, style preferences, booking requirements)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Public Display Preview</h4>
            <div className="bg-white/5 rounded p-3">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{applicantName.charAt(0)}</span>
                </div>
                <div>
                  <h5 className="text-white font-medium">{applicantName}</h5>
                  <p className="text-gray-400 text-sm capitalize">{applicationType}</p>
                </div>
              </div>
              
              <div className="mt-3">
                {preferences.booking_status === 'fully_booked' && (
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm">
                    Fully Booked
                  </span>
                )}
                {preferences.booking_status === 'advance_bookings' && (
                  <div>
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm">
                      Taking Advance Bookings
                    </span>
                    {preferences.contact_details && (
                      <p className="text-gray-300 text-sm mt-2">
                        Contact: {preferences.contact_details}
                      </p>
                    )}
                  </div>
                )}
                {preferences.booking_status === 'taking_walkups' && (
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                    Taking Walk-ups
                  </span>
                )}
                
                {preferences.booking_notes && (
                  <p className="text-gray-300 text-sm mt-2">{preferences.booking_notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 p-6 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}