import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings, User, Calendar, CreditCard, Users, MessageSquare, Award, Building2 } from 'lucide-react';

export function InitialSetupPage() {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState({
    organizationName: '',
    organizationType: 'convention',
    primaryRole: user?.role || 'event_manager',
    features: [] as string[],
    eventTypes: [] as string[]
  });

  const organizationTypes = [
    { id: 'convention', label: 'Tattoo Convention', description: 'Multi-day events with artists, traders, and competitions' },
    { id: 'studio', label: 'Tattoo Studio', description: 'Individual studio managing appointments and clients' },
    { id: 'festival', label: 'Art Festival', description: 'Cultural events featuring various art forms including tattoos' },
    { id: 'competition', label: 'Competition Only', description: 'Focused on tattoo competitions and judging' }
  ];

  const availableFeatures = [
    { id: 'applications', label: 'Artist Applications', icon: Users, description: 'Manage artist and trader applications' },
    { id: 'ticketing', label: 'Ticket Sales', icon: CreditCard, description: 'Sell tickets to attendees' },
    { id: 'booking', label: 'Appointment Booking', icon: Calendar, description: 'Allow clients to book appointments' },
    { id: 'consent', label: 'Consent Forms', icon: MessageSquare, description: 'Digital consent form management' },
    { id: 'tattscore', label: 'TattScore Judging', icon: Award, description: 'Competition judging and scoring' },
    { id: 'studio', label: 'Studio Management', icon: Building2, description: 'Multi-studio management tools' }
  ];

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      setIsLoading(true);
      
      // Skip API call if Supabase is not configured
      if (!supabase) {
        console.error('Supabase not configured. Please update your .env file with actual Supabase credentials');
        setNeedsSetup(false); // Default to false if check fails
        setIsLoading(false);
        return;
      }
      
      // Check if admin exists by querying the users table
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
        
      if (error) {
        console.error('Error checking for admin users:', error);
        setNeedsSetup(false);
        setIsLoading(false);
        return;
      }
      
      // If admin users exist, we don't need setup
      const needsInitialSetup = !data || data.length === 0;
      setNeedsSetup(needsInitialSetup);
      
    } catch (error) {
      console.error('Error checking setup status:', error);
      setNeedsSetup(false); // Default to false if check fails
    } finally {
      setIsLoading(false);
    }
  };

  const eventTypeOptions = [
    'artist', 'piercer', 'performer', 'trader', 'volunteer', 'caterer'
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save setup data and redirect to dashboard
    console.log('Setup completed:', setupData);
    navigate('/dashboard');
  };

  const toggleFeature = (featureId: string) => {
    setSetupData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const toggleEventType = (eventType: string) => {
    setSetupData(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter(t => t !== eventType)
        : [...prev.eventTypes, eventType]
    }));
  };

  // Show loading while checking setup status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login page if setup is not needed
  if (needsSetup === false) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to TattScore</h1>
            <p className="text-purple-200">Let's set up your account to get started</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-purple-200">Step {currentStep} of 4</span>
              <span className="text-sm text-purple-200">{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Organization Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Organization Information</h2>
              
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={setupData.organizationName}
                  onChange={(e) => setSetupData(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your organization name"
                />
              </div>

              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Organization Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizationTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setSetupData(prev => ({ ...prev, organizationType: type.id }))}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        setupData.organizationType === type.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <h3 className="text-white font-medium mb-1">{type.label}</h3>
                      <p className="text-purple-200 text-sm">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Primary Role */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Your Primary Role</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['admin', 'event_manager', 'artist', 'piercer', 'studio_manager', 'judge'].map((role) => (
                  <div
                    key={role}
                    onClick={() => setSetupData(prev => ({ ...prev, primaryRole: role }))}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      setupData.primaryRole === role
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <User className="w-6 h-6 text-purple-400 mb-2" />
                    <h3 className="text-white font-medium capitalize">{role.replace('_', ' ')}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Features */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Select Features</h2>
              <p className="text-purple-200 mb-6">Choose the features you'd like to enable for your organization</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        setupData.features.includes(feature.id)
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-purple-400 mb-2" />
                      <h3 className="text-white font-medium mb-1">{feature.label}</h3>
                      <p className="text-purple-200 text-sm">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Event Types */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Application Types</h2>
              <p className="text-purple-200 mb-6">Select the types of applications you'll accept</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {eventTypeOptions.map((eventType) => (
                  <div
                    key={eventType}
                    onClick={() => toggleEventType(eventType)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all text-center ${
                      setupData.eventTypes.includes(eventType)
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <h3 className="text-white font-medium capitalize">{eventType}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !setupData.organizationName) ||
                (currentStep === 3 && setupData.features.length === 0) ||
                (currentStep === 4 && setupData.eventTypes.length === 0)
              }
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 4 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}