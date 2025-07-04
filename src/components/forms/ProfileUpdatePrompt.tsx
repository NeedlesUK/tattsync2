import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, AlertCircle, CheckCircle, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface ProfileUpdatePromptProps {
  currentProfile: ProfileData;
  onUpdate: (updatedProfile: ProfileData) => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function ProfileUpdatePrompt({ 
  currentProfile, 
  onUpdate, 
  onSkip, 
  onCancel 
}: ProfileUpdatePromptProps) {
  const [profileData, setProfileData] = useState<ProfileData>(currentProfile);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check if there are changes
    const hasChanges = Object.keys(profileData).some(key => 
      profileData[key as keyof ProfileData] !== currentProfile[key as keyof ProfileData]
    );
    setHasChanges(hasChanges || value !== currentProfile[field]);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isProfileComplete = () => {
    return profileData.name && 
           profileData.email && 
           profileData.phone && 
           profileData.location;
  };

  const getMissingFields = () => {
    const missing = [];
    if (!profileData.name) missing.push('Name');
    if (!profileData.email) missing.push('Email');
    if (!profileData.phone) missing.push('Phone');
    if (!profileData.location) missing.push('Location');
    return missing;
  };

  const missingFields = getMissingFields();
  const isComplete = isProfileComplete();

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Update Your Profile</h3>
        <p className="text-gray-300">
          We found your existing TattSync account! Would you like to update your profile before applying?
        </p>
      </div>

      {/* Profile Status */}
      <div className={`p-4 rounded-lg mb-6 ${
        isComplete 
          ? 'bg-green-500/20 border border-green-500/30' 
          : 'bg-yellow-500/20 border border-yellow-500/30'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          {isComplete ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <span className={`font-medium ${
            isComplete ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {isComplete ? 'Profile Complete' : 'Profile Incomplete'}
          </span>
        </div>
        {!isComplete && (
          <p className={`text-sm ${isComplete ? 'text-green-300' : 'text-yellow-300'}`}>
            Missing fields: {missingFields.join(', ')}
          </p>
        )}
      </div>

      {/* Profile Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your full name"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={profileData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={profileData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={onSkip}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Skip Update
        </button>
        
        <button
          onClick={handleUpdate}
          disabled={isUpdating || !hasChanges}
          className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isUpdating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              <span>Update & Continue</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}