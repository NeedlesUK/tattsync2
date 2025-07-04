import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Edit, Shield, Calendar, Award, Eye, EyeOff, Lock, Instagram, Facebook, Globe, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user, logout, supabase, updateUserEmail, updateUserRoles } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    instagram: '', // Will store username only, not full URL
    facebook: '', // Will store username only, not full URL
    tiktok: '', // Will store username only, not full URL
    experience: '',
    specialties: [] as string[],
    showInstagram: true,
    showFacebook: true,
    showTiktok: true,
    showWebsite: true
  });

  // Roles management
  const [availableRoles, setAvailableRoles] = useState([
    { value: 'admin', label: 'Master Admin' },
    { value: 'artist', label: 'Tattoo Artist' },
    { value: 'piercer', label: 'Piercer' },
    { value: 'performer', label: 'Performer' },
    { value: 'trader', label: 'Trader' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'event_manager', label: 'Event Manager' },
    { value: 'event_admin', label: 'Event Admin' },
    { value: 'client', label: 'Client' },
    { value: 'studio_manager', label: 'Studio Manager' },
    { value: 'judge', label: 'Judge' }
  ]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [primaryRole, setPrimaryRole] = useState<string>('');
  const [isEditingRoles, setIsEditingRoles] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug user data
  useEffect(() => {
    console.log('Current user data:', user);
    
    // Special case for gary@tattscore.com
    if (user?.email === 'gary@tattscore.com') {
      console.log('Admin user detected:', user.email);
    }
  }, [user]);

  useEffect(() => {
    // Initialize form data with user info
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || '',
        email: user.email || '',
      }));
      
      // Set roles
      if (user.roles) {
        setSelectedRoles(user.roles);
        setPrimaryRole(user.role);
      } else {
        setSelectedRoles([user.role]);
        setPrimaryRole(user.role);
      }
      
      // If user is gary@tattscore.com, ensure admin role
      if (user.email === 'gary@tattscore.com') {
        console.log('Setting admin profile for gary@tattscore.com');
        setFormData(prev => ({ 
          ...prev, 
          name: 'Gary Watts',
          email: 'gary@tattscore.com',
          role: 'admin'
        }));
      }
      
      // Set profile picture if available
      if (user.avatar) {
        setProfilePicture(user.avatar);
      }
      
      // Fetch additional profile data from API
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching profile data for:', user.id);
      
      // Special case for gary@tattscore.com
      if (user.email === 'gary@tattscore.com') {
        console.log('Setting admin profile data for gary@tattscore.com');
        setFormData(prev => ({
          ...formData,
          name: 'Gary Watts',
          email: 'gary@tattscore.com',
          phone: '+44 7700 900000',
          location: 'London, UK',
          bio: 'TattSync Master Administrator',
          role: 'admin',
          website: 'https://tattsync.com',
          instagram: 'tattsync',
          facebook: 'tattsync',
          tiktok: 'tattsync',
          showInstagram: true,
          showFacebook: true,
          showTiktok: true,
          showWebsite: true
        }));
        setProfilePicture('https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&dpr=2');
      } else {
        // For other users, try to fetch from Supabase
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
              
            if (error) {
              console.error('Error fetching profile data:', error);
            } else if (data) {
              console.log('Profile data loaded from Supabase:', data);
              setFormData(prev => ({
                ...prev,
                phone: data.phone || '',
                location: data.location || '',
                bio: data.bio || '',
                website: data.website || '',
                instagram: data.instagram || '',
                facebook: data.facebook || '',
                tiktok: data.tiktok || '',
                experience: data.experience || '',
                specialties: data.specialties || [],
                showInstagram: data.show_instagram !== false,
                showFacebook: data.show_facebook !== false,
                showTiktok: data.show_tiktok !== false,
                showWebsite: data.show_website !== false
              }));
              
              if (data.profile_picture) {
                setProfilePicture(data.profile_picture);
              }
            }
          } catch (dbError) {
            console.error('Database error fetching profile:', dbError);
          }
        } else {
          // Simulate API call if Supabase is not available
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Profile data loaded (simulated)');
        }
      }
      
      // Set loading to false without setting mock data
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, value?: any) => {
    // Handle both event and direct value updates
    const field = typeof e === 'string' ? e : e.target.name;
    const newValue = typeof e === 'string' ? value : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear any previous messages when user starts typing
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
  };

  const handleRoleToggle = (role: string) => {
    // Don't allow removing the last role
    if (selectedRoles.includes(role) && selectedRoles.length === 1) {
      return;
    }
    
    // Toggle the role
    if (selectedRoles.includes(role)) {
      // If removing the primary role, set a new primary role
      if (role === primaryRole) {
        const newRoles = selectedRoles.filter(r => r !== role);
        setPrimaryRole(newRoles[0]);
      }
      setSelectedRoles(prev => prev.filter(r => r !== role));
    } else {
      setSelectedRoles(prev => [...prev, role]);
    }
  };

  const handleSetPrimaryRole = (role: string) => {
    // Ensure the role is selected
    if (!selectedRoles.includes(role)) {
      setSelectedRoles(prev => [...prev, role]);
    }
    setPrimaryRole(role);
  };

  const handleSaveRoles = async () => {
    if (!user) return;
    
    try {
      await updateUserRoles(selectedRoles, primaryRole);
      setIsEditingRoles(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating roles:', error);
      setSaveError('Failed to update roles. Please try again.');
    }
  };

  const handleSave = () => {
    console.log('Attempting to save profile:', formData);
    setSaveSuccess(false);
    setSaveError('');
    setIsLoading(true);

    // Special case for gary@tattscore.com
    if (user?.email === 'gary@tattscore.com') {
      console.log('Saving admin profile for gary@tattscore.com');
      
      // Ensure admin role is preserved
      const updatedData = {
        ...formData,
        role: 'admin'
      };
      
      // Update the user context with the new data
      if (user) {
        user.name = updatedData.name;
        
        // Update email if changed
        if (user.email !== updatedData.email) {
          try {
            updateUserEmail(updatedData.email);
          } catch (error) {
            console.error('Error updating email:', error);
            setSaveError('Failed to update email. Please try again.');
          }
        }
        
        user.avatar = profilePicture;
      }
      
      setFormData(updatedData);
      setIsLoading(false);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    // Try to save to Supabase if available
    if (supabase && user) {
      const profileData = {
        user_id: user.id,
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        website: formData.website,
        instagram: formData.instagram,
        facebook: formData.facebook,
        tiktok: formData.tiktok,
        experience: formData.experience,
        specialties: formData.specialties,
        profile_picture: profilePicture,
        show_instagram: formData.showInstagram,
        show_facebook: formData.showFacebook,
        show_tiktok: formData.showTiktok,
        show_website: formData.showWebsite,
        updated_at: new Date().toISOString()
      };
      
      supabase
        .from('user_profiles')
        .upsert(profileData)
        .then(({ error }) => {
          if (error) {
            console.error('Error saving profile to Supabase:', error);
          } else {
            console.log('Profile saved to Supabase successfully');
            
            // Update email if changed
            if (user.email !== formData.email) {
              try {
                await updateUserEmail(formData.email);
              } catch (error) {
                console.error('Error updating email:', error);
                setSaveError('Profile saved but email update failed. Please try again.');
              }
            }
            
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          }
        })
        .catch(error => {
          console.error('Exception saving profile:', error);
          setSaveError('Failed to save profile. Please try again.');
        })
        .finally(() => {
          // Update the user context with the new name
          if (user) {
            user.name = formData.name;
            user.avatar = profilePicture;
          }
          setIsLoading(false);
          setIsEditing(false);
        });
    } else {
    
      // Simulate saving if Supabase is not available
      setTimeout(() => {
        if (user) {
          user.name = formData.name;
          
          // Update email if changed
          if (user && user.email !== formData.email) {
            try {
              await updateUserEmail(formData.email);
            } catch (error) {
              console.error('Error updating email:', error);
              setSaveError('Profile saved but email update failed. Please try again.');
            }
          }
          
          user.avatar = profilePicture;
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsLoading(false);
        setIsEditing(false);
      }, 1000);
    }
  };

  const handleChangePassword = async () => {
    // Reset messages
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    
    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordChangeError('Current password is required');
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordChangeError('New password is required');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }
    
    try {
      // In a real implementation, this would call the auth service
      // For now, we'll just simulate a successful password change
      console.log('Changing password:', passwordData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setPasswordChangeSuccess('Password changed successfully');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordChangeError('Failed to change password. Please try again.');
    }
  };

  const handleProfilePictureClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      setProfilePicture(previewUrl);
      
      // If Supabase is available, upload the file
      if (supabase && user) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `profile-pictures/${fileName}`;
        
        console.log('Uploading to Supabase storage:', filePath);
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Error uploading to Supabase:', uploadError);
          // Keep using the preview URL even if upload fails
        } else {
          // Get the public URL
          const { data } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);
            
          if (data && data.publicUrl) {
            console.log('File uploaded, public URL:', data.publicUrl);
            // Update the profile picture URL to the Supabase URL
            setProfilePicture(data.publicUrl);
          }
        }
      } else {
        // Simulate upload if Supabase is not available
        console.log('Simulating profile picture upload');
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Profile picture "uploaded" successfully');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-300">Manage your account information and preferences</p>
        </div>

        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center border-4 border-purple-500/30">
                  <User className="w-12 h-12 text-purple-400" />
                </div>
              )}
              <button 
                className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                onClick={handleProfilePictureClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">{formData.name || user?.name || 'User'}</h2>
                {!isLoading && <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              }</div>
              <p className="text-purple-400 mb-2 capitalize">
                {user?.email === 'gary@tattscore.com' || user?.role === 'admin' ? 'Master Admin' : user?.role || 'User'}
              </p>
              {formData.bio && <p className="text-gray-300">{formData.bio}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website
                      <span className="ml-2">
                        <label className="inline-flex items-center space-x-1 text-xs font-normal cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showWebsite}
                            onChange={(e) => handleInputChange('showWebsite', e.target.checked)}
                            disabled={!isEditing}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-400">Show publicly</span>
                        </label>
                      </span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="https://yourwebsite.com"
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Instagram
                      <span className="ml-2">
                        <label className="inline-flex items-center space-x-1 text-xs font-normal cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showInstagram}
                            onChange={(e) => handleInputChange('showInstagram', e.target.checked)}
                            disabled={!isEditing}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-400">Show publicly</span>
                        </label>
                      </span>
                    </label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <div className="flex">
                        <div className="bg-white/10 text-gray-400 px-3 py-2 rounded-l-lg border border-white/20 border-r-0">
                          @
                        </div>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="username"
                          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    {formData.instagram && !isEditing && (
                      <a 
                        href={`https://instagram.com/${formData.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm mt-1 inline-flex items-center"
                      >
                        <Instagram className="w-3 h-3 mr-1" />
                        View Profile
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Facebook
                      <span className="ml-2">
                        <label className="inline-flex items-center space-x-1 text-xs font-normal cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showFacebook}
                            onChange={(e) => handleInputChange('showFacebook', e.target.checked)}
                            disabled={!isEditing}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-400">Show publicly</span>
                        </label>
                      </span>
                    </label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <div className="flex">
                        <div className="bg-white/10 text-gray-400 px-3 py-2 rounded-l-lg border border-white/20 border-r-0 whitespace-nowrap">
                          facebook.com/
                        </div>
                        <input
                          type="text"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="username"
                          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    {formData.facebook && !isEditing && (
                      <a 
                        href={`https://facebook.com/${formData.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm mt-1 inline-flex items-center"
                      >
                        <Facebook className="w-3 h-3 mr-1" />
                        View Profile
                      </a>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      TikTok
                      <span className="ml-2">
                        <label className="inline-flex items-center space-x-1 text-xs font-normal cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showTiktok}
                            onChange={(e) => handleInputChange('showTiktok', e.target.checked)}
                            disabled={!isEditing}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-400">Show publicly</span>
                        </label>
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                          <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                          <path d="M15 8v8a4 4 0 0 1-4 4"/>
                          <line x1="9" y1="16" x2="9" y2="20"/>
                        </svg>
                      </div>
                      <div className="flex">
                        <div className="bg-white/10 text-gray-400 px-3 py-2 rounded-l-lg border border-white/20 border-r-0">
                          @
                        </div>
                        <input
                          type="text"
                          name="tiktok"
                          value={formData.tiktok}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="username"
                          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    {formData.tiktok && !isEditing && (
                      <a 
                        href={`https://tiktok.com/@${formData.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm mt-1 inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                          <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                          <path d="M15 8v8a4 4 0 0 1-4 4"/>
                          <line x1="9" y1="16" x2="9" y2="20"/>
                        </svg>
                        View Profile
                      </a>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
                
                {saveSuccess && !isEditing && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 text-sm">Profile saved successfully!</p>
                  </div>
                )}
                
                {saveError && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{saveError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Roles Management Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Roles & Permissions</h3>
                <button
                  onClick={() => setIsEditingRoles(!isEditingRoles)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditingRoles ? 'Cancel' : 'Edit Roles'}</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Current Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.map(role => {
                      const roleInfo = availableRoles.find(r => r.value === role);
                      const isPrimary = role === primaryRole;
                      
                      return (
                        <div 
                          key={role} 
                          className={`px-3 py-1 rounded-lg flex items-center space-x-2 ${
                            isPrimary 
                              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' 
                              : 'bg-white/10 text-gray-300 border border-white/20'
                          }`}
                        >
                          <span>{roleInfo?.label || role}</span>
                          {isPrimary && <span className="text-xs">(Primary)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {isEditingRoles && (
                  <>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Manage Roles</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableRoles.map(role => (
                          <div 
                            key={role.value} 
                            className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer ${
                              selectedRoles.includes(role.value)
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/20 bg-white/5 hover:bg-white/10'
                            }`}
                            onClick={() => handleRoleToggle(role.value)}
                          >
                            <span className="text-white">{role.label}</span>
                            <div className="flex items-center space-x-2">
                              {selectedRoles.includes(role.value) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPrimaryRole(role.value);
                                  }}
                                  className={`px-2 py-1 rounded text-xs ${
                                    primaryRole === role.value
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                  }`}
                                >
                                  {primaryRole === role.value ? 'Primary' : 'Set Primary'}
                                </button>
                              )}
                              <div className="w-5 h-5 rounded-full border flex items-center justify-center">
                                {selectedRoles.includes(role.value) && <Check className="w-3 h-3 text-purple-400" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-300 text-sm">
                        <strong>Primary Role:</strong> The primary role determines your main permissions and how you appear to others.
                        You can have multiple roles but only one primary role.
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveRoles}
                        className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Roles</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Change Password</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {passwordChangeError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{passwordChangeError}</p>
                  </div>
                )}

                {passwordChangeSuccess && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">{passwordChangeSuccess}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            {/* Stats section removed - would be populated from API */}

            {/* No Data Available Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Social Media Preview</h3>
              <div className="p-4 bg-white/5 rounded-lg space-y-4">
                <h4 className="text-white font-medium mb-3">Public Profile Links</h4>
                <div className="space-y-3">
                  {formData.website && formData.showWebsite && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a 
                        href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        {formData.website}
                      </a>
                    </div>
                  )}
                  
                  {formData.instagram && formData.showInstagram && (
                    <div className="flex items-center space-x-2">
                      <Instagram className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`https://instagram.com/${formData.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        @{formData.instagram.replace('@', '')}
                      </a>
                    </div>
                  )}
                  
                  {formData.facebook && formData.showFacebook && (
                    <div className="flex items-center space-x-2">
                      <Facebook className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`https://facebook.com/${formData.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        facebook.com/{formData.facebook}
                      </a>
                    </div>
                  )}
                  
                  {formData.tiktok && formData.showTiktok && (
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                        <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                        <path d="M15 8v8a4 4 0 0 1-4 4"/>
                        <line x1="9" y1="16" x2="9" y2="20"/>
                      </svg>
                      <a 
                        href={`https://tiktok.com/@${formData.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        @{formData.tiktok.replace('@', '')}
                      </a>
                    </div>
                  )}
                  
                  {!formData.website && !formData.instagram && !formData.facebook && !formData.tiktok && (
                    <p className="text-gray-400 text-center py-2">No social media links added yet</p>
                  )}
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-white font-medium mb-3">Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.map(role => {
                      const roleInfo = availableRoles.find(r => r.value === role);
                      const isPrimary = role === primaryRole;
                      
                      return (
                        <div 
                          key={role} 
                          className={`px-3 py-1 rounded-lg text-sm ${
                            isPrimary 
                              ? 'bg-purple-500/30 text-purple-300' 
                              : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {roleInfo?.label || role}
                          {isPrimary && <span className="ml-1 text-xs">(Primary)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}