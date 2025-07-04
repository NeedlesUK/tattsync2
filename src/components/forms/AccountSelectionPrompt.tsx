import React from 'react';
import { User, UserPlus, LogIn, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AccountSelectionPromptProps {
  eventName: string;
  applicationType: string;
  onUseExistingAccount: () => void;
  onCreateNewApplication: () => void;
  onCancel: () => void;
}

export function AccountSelectionPrompt({ 
  eventName, 
  applicationType, 
  onUseExistingAccount, 
  onCreateNewApplication, 
  onCancel 
}: AccountSelectionPromptProps) {
  const { user } = useAuth();

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Apply as {getApplicationTypeTitle(applicationType)}
          </h2>
          <p className="text-gray-300">
            How would you like to apply for <span className="text-purple-400 font-medium">{eventName}</span>?
          </p>
        </div>

        {/* Current Account Info */}
        {user && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Signed in as {user.name}</span>
            </div>
            <p className="text-green-300 text-sm">
              You can use your existing TattSync account to apply, which will pre-fill your information 
              and link this application to your profile.
            </p>
          </div>
        )}

        {/* Application Options */}
        <div className="space-y-4 mb-8">
          {/* Use Existing Account */}
          <button
            onClick={onUseExistingAccount}
            className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-6 transition-all group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Use My TattSync Account
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Apply using your existing account information. We'll pre-fill your details 
                  and you can update them if needed.
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Recommended</span>
                </div>
              </div>
            </div>
          </button>

          {/* Create New Application */}
          <button
            onClick={onCreateNewApplication}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-6 transition-all group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Apply with New Information
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Fill out the application form manually. This won't be linked to your 
                  TattSync account.
                </p>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Manual entry required</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h4 className="text-blue-300 font-medium mb-2">Why use your TattSync account?</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Faster application process with pre-filled information</li>
            <li>• Track all your applications in one place</li>
            <li>• Receive notifications about application status</li>
            <li>• Build your event participation history</li>
          </ul>
        </div>

        {/* Cancel Button */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancel Application
          </button>
        </div>
      </div>
    </div>
  );
}