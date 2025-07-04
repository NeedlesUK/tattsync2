import React, { useState } from 'react';
import { X, Save, Clock, Calendar, Settings } from 'lucide-react';

interface BookingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: BookingSettings) => Promise<void>;
  initialSettings?: BookingSettings;
  eventDates: string[];
}

export interface BookingSettings {
  event_id: number;
  enabled: boolean;
  default_slot_duration: number; // minutes
  booking_hours: {
    start: string; // 24h format "HH:MM"
    end: string; // 24h format "HH:MM"
  };
  available_dates: string[];
  buffer_time: number; // minutes between bookings
  max_bookings_per_day: number | null;
  allow_client_cancellation: boolean;
  cancellation_deadline_hours: number;
}

export function BookingSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialSettings,
  eventDates
}: BookingSettingsModalProps) {
  const [settings, setSettings] = useState<BookingSettings>(
    initialSettings || {
      event_id: 1,
      enabled: true,
      default_slot_duration: 30,
      booking_hours: {
        start: '10:00',
        end: '18:00'
      },
      available_dates: [...eventDates],
      buffer_time: 15,
      max_bookings_per_day: null,
      allow_client_cancellation: true,
      cancellation_deadline_hours: 24
    }
  );

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving booking settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const toggleDateSelection = (date: string) => {
    if (settings.available_dates.includes(date)) {
      setSettings(prev => ({
        ...prev,
        available_dates: prev.available_dates.filter(d => d !== date)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        available_dates: [...prev.available_dates, date]
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Booking Settings</h2>
            <p className="text-gray-300 text-sm">Configure your booking calendar</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Enable/Disable Booking */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="text-white font-medium">Enable Booking Calendar</h3>
              <p className="text-gray-400 text-sm">Allow clients to book appointments with you</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.enabled} 
                onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* Booking Hours */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Booking Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        value={settings.booking_hours.start}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          booking_hours: {
                            ...prev.booking_hours,
                            start: e.target.value
                          }
                        }))}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        value={settings.booking_hours.end}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          booking_hours: {
                            ...prev.booking_hours,
                            end: e.target.value
                          }
                        }))}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Slot Settings */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Time Slot Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Slot Duration (minutes)
                    </label>
                    <select
                      value={settings.default_slot_duration}
                      onChange={(e) => setSettings(prev => ({ ...prev, default_slot_duration: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="15" className="bg-gray-800">15 minutes</option>
                      <option value="30" className="bg-gray-800">30 minutes</option>
                      <option value="45" className="bg-gray-800">45 minutes</option>
                      <option value="60" className="bg-gray-800">1 hour</option>
                      <option value="90" className="bg-gray-800">1.5 hours</option>
                      <option value="120" className="bg-gray-800">2 hours</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Buffer Time Between Bookings (minutes)
                    </label>
                    <select
                      value={settings.buffer_time}
                      onChange={(e) => setSettings(prev => ({ ...prev, buffer_time: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="0" className="bg-gray-800">No buffer</option>
                      <option value="5" className="bg-gray-800">5 minutes</option>
                      <option value="10" className="bg-gray-800">10 minutes</option>
                      <option value="15" className="bg-gray-800">15 minutes</option>
                      <option value="30" className="bg-gray-800">30 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Available Dates */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Available Dates</h3>
                <p className="text-gray-300 text-sm mb-4">Select the dates you'll be available for bookings</p>
                
                <div className="flex flex-wrap gap-2">
                  {eventDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => toggleDateSelection(date)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        settings.available_dates.includes(date)
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-white/5 text-gray-300 border border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Limits */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Booking Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Bookings Per Day (optional)
                    </label>
                    <input
                      type="number"
                      value={settings.max_bookings_per_day || ''}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        max_bookings_per_day: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                      min="1"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="No limit"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave empty for no limit</p>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Cancellation Policy</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allow_client_cancellation}
                      onChange={(e) => setSettings(prev => ({ ...prev, allow_client_cancellation: e.target.checked }))}
                      className="text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <span className="text-gray-300">Allow clients to cancel their bookings</span>
                  </label>
                  
                  {settings.allow_client_cancellation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cancellation Deadline (hours before appointment)
                      </label>
                      <select
                        value={settings.cancellation_deadline_hours}
                        onChange={(e) => setSettings(prev => ({ ...prev, cancellation_deadline_hours: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="12" className="bg-gray-800">12 hours</option>
                        <option value="24" className="bg-gray-800">24 hours</option>
                        <option value="48" className="bg-gray-800">48 hours</option>
                        <option value="72" className="bg-gray-800">72 hours</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
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
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}