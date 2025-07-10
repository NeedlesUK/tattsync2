import React, { useState, useEffect } from 'react';
import { X, Save, BarChart, PieChart, LineChart, Calendar, Users, CreditCard, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface StatisticsModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => Promise<void>;
}

export function StatisticsModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: StatisticsModalProps) {
  const { supabase } = useAuth();
  const [settings, setSettings] = useState({
    enabled: true,
    public_dashboard: false,
    track_demographics: true,
    track_revenue: true,
    track_attendance: true,
    track_applications: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, eventId]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, fetch settings from database
      // For now, use default settings
      setSettings({
        enabled: true,
        public_dashboard: false,
        track_demographics: true,
        track_revenue: true,
        track_attendance: true,
        track_applications: true
      });
    } catch (error) {
      console.error('Error fetching statistics settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving statistics settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Statistics & Analytics</h2>
            <p className="text-gray-300 text-sm">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Dashboard Preview
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-blue-300 font-medium mb-2">Statistics & Analytics</h3>
                <p className="text-blue-200 text-sm">
                  Configure what data is collected and displayed in your event dashboard. 
                  This feature is currently in development and will be available soon.
                </p>
              </div>

              {/* Main Settings */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <BarChart className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Analytics Dashboard</h3>
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Public Dashboard</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.public_dashboard} 
                          onChange={(e) => setSettings(prev => ({ ...prev, public_dashboard: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <p className="text-gray-400 text-sm">
                      When enabled, a public dashboard will be available at a shareable URL.
                    </p>
                  </div>
                )}
              </div>

              {/* Data Collection Settings */}
              {settings.enabled && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Data Collection</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Track Demographics</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.track_demographics} 
                          onChange={(e) => setSettings(prev => ({ ...prev, track_demographics: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Track Revenue</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.track_revenue} 
                          onChange={(e) => setSettings(prev => ({ ...prev, track_revenue: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Track Attendance</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.track_attendance} 
                          onChange={(e) => setSettings(prev => ({ ...prev, track_attendance: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Track Applications</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.track_applications} 
                          onChange={(e) => setSettings(prev => ({ ...prev, track_applications: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <BarChart className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-yellow-300 font-medium">Coming Soon</h3>
                </div>
                <p className="text-yellow-200 text-sm mt-2">
                  The statistics dashboard is currently in development and will be available soon. 
                  This preview shows what the dashboard will look like.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Total Attendees</h4>
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-gray-400 text-sm mt-2">No data available yet</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Total Revenue</h4>
                    <CreditCard className="w-5 h-5 text-teal-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">£0</p>
                  <p className="text-gray-400 text-sm mt-2">No data available yet</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Applications</h4>
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-gray-400 text-sm mt-2">No data available yet</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Attendance by Day</h4>
                    <LineChart className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-400">Chart will appear here</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Attendee Types</h4>
                    <PieChart className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-400">Chart will appear here</p>
                  </div>
                </div>
              </div>
            </div>
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
            disabled={isSaving || isLoading}
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