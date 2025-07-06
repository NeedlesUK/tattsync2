import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Edit, Shield, Calendar, Award, Eye, EyeOff, Lock, Instagram, Facebook, Globe, Plus, Trash2, CheckCircle, AlertCircle, EyeOff as EyeSlash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from "qrcode.react";


export function ProfilePage() {
  const { user, updateUserEmail, updateUserRoles, supabase } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileDbId, setProfileDbId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '', 
    experience: '',
    specialties: [],
    show_instagram: true,
    show_facebook: true,
    show_tiktok: true,
    show_website: true,
    show_profile: true
  });

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
  const [profilePicture, setProfilePicture] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Roles state
  const [userRoles, setUserRoles] = useState<string[]>(user?.roles || [user?.role || 'artist']);
  const [primaryRole, setPrimaryRole] = useState<string>('');
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
  const [newRole, setNewRole] = useState('');

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      
      // Set roles from user object
      if (user.roles) {
        setUserRoles(user.roles);
        setPrimaryRole(user.role);
      } else if (user.role) {
        setUserRoles([user.role]);
        setPrimaryRole(user.role);
      }
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!supabase || !user) return;
    
    try {
      // Fetch user profile from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        // Store the profile ID for updates
        setProfileDbId(data.id);
        
        setFormData(prev => ({
          ...prev,
          // Keep basic user data from auth
          name: user.name,
          email: user.email,
          phone: data.phone || prev.phone,
          location: data.location || prev.location,
          bio: data.bio || prev.bio,
          website: data.website || prev.website, 
          instagram: data.instagram || prev.instagram, 
          facebook: data.facebook || prev.facebook, 
          tiktok: data.tiktok || prev.tiktok, 
          experience: data.experience || prev.experience,
          specialties: data.specialties || prev.specialties,
          show_instagram: data.show_instagram !== null ? data.show_instagram : true,
          show_facebook: data.show_facebook !== null ? data.show_facebook : true,
          show_tiktok: data.show_tiktok !== null ? data.show_tiktok : true,
          show_website: data.show_website !== null ? data.show_website : true,
          show_profile: data.show_profile !== null ? data.show_profile : true
        }));
        
        if (data.profile_picture) {
          setProfilePicture(data.profile_picture);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
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

  const handleSave = async () => {
    if (!supabase || !user) return;
    
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');
    
    try {
      // Update user name in auth.users
      const { error: nameError } = await supabase.auth.updateUser({
        data: { name: formData.name }
      });
      
      if (nameError) {
        console.error('Error updating name:', nameError);
        setSaveError('Failed to update name. Please try again.');
        setIsSaving(false);
        return;
      }
      
      // Update user name in users table
      const { error: userError } = await supabase
        .from('users')
        .update({ name: formData.name, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (userError) {
        console.error('Error updating user:', userError);
        setSaveError('Failed to update user. Please try again.');
        setIsSaving(false);
        return;
      }
      
      // Update or insert user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: profileDbId, // Include the ID for updates
          user_id: user.id,
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
          show_instagram: formData.show_instagram,
          show_facebook: formData.show_facebook,
          show_tiktok: formData.show_tiktok,
          show_website: formData.show_website, 
          show_profile: formData.show_profile,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error('Error updating profile:', profileError.message);
        setSaveError('Failed to update profile. Please try again.');
        setIsSaving(false);
        return;
      }
      
      // Update email if changed
      if (user.email !== formData.email) {
        try {
          await updateUserEmail(formData.email);
        } catch (emailError) {
          console.error('Error updating email:', emailError);
          setSaveError('Failed to update email. Please try again.');
          setIsSaving(false);
          return;
        }
      }
      
      // Success
      setSaveSuccess('Profile updated successfully!');
      
      // Refresh user data
      if (user.email !== formData.email) {
        window.location.reload();
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
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
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) {
        throw error;
      }
      
      // Success
      setPasswordChangeSuccess('Password changed successfully');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordChangeError(error.message || 'Failed to change password. Please try again.');
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

      // In a real implementation, you would upload the file to storage
      // For now, we'll just simulate an API call
      console.log('Uploading profile picture:', file);
     
     // Update the user avatar in the auth context
     if (user) {
       user.avatar = previewUrl;
     }
     
     // Update user data in context
     updateUserProfile({
       name: formData.name,
       email: formData.email,
       avatar: profilePicture
     });
     
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success - in a real implementation, you would get the URL from the storage service
      console.log('Profile picture uploaded successfully');
      
      // Clean up the temporary URL when done
      // URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole || !supabase || !user) return;
    
    try {
      const updatedRoles = [...userRoles, newRole];
      await updateUserRoles(updatedRoles, primaryRole);
      setUserRoles(updatedRoles);
      setNewRole('');
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleRemoveRole = async (role: string) => {
    if (role === primaryRole || !supabase || !user) return;
    
    try {
      const updatedRoles = userRoles.filter(r => r !== role);
      await updateUserRoles(updatedRoles, primaryRole);
      setUserRoles(updatedRoles);
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  const handleSetPrimaryRole = async (role: string) => {
    if (!supabase || !user) return;
    
    try {
      await updateUserRoles(userRoles, role);
      setPrimaryRole(role);
    } catch (error) {
      console.error('Error setting primary role:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const stats = [
    { label: 'Events Attended', value: '12', icon: Calendar },
    { label: 'Years Experience', value: formData.experience, icon: Award },
    { label: 'Specialties', value: formData.specialties.length.toString(), icon: User },
    { label: 'Profile Views', value: '234', icon: Shield }
  ];

  const recentEvents = [
    {
      id: 1,
      name: 'Ink Fest 2024',
      date: '2024-03-15',
      role: 'Artist',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Body Art Expo',
      date: '2024-02-20',
      role: 'Artist',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Tattoo Convention',
      date: '2024-01-10',
      role: 'Artist',
      status: 'completed'
    }
  ];

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
              <img
                src={profilePicture}
                alt={user?.name || "Profile"}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
              />
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
                <h2 className="text-2xl font-bold text-white">{formData.name}</h2>
                <button
                  onClick={() => {
                    if (isEditing) {
                      // Cancel editing
                      setIsEditing(false);
                      // Reset form data to original values
                      fetchUserProfile();
                    } else {
                      // Start editing
                      setIsEditing(true);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-purple-400 capitalize">{user?.role}</p>
                {!formData.show_profile && (
                  <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs flex items-center">
                    <EyeSlash className="w-3 h-3 mr-1" />
                    <span>Private Profile</span>
                  </span>
                )}
              </div>
              <p className="text-gray-300">{formData.bio}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
              
              {saveSuccess && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-400 text-sm">{saveSuccess}</p>
                </div>
              )}
              
              {saveError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{saveError}</p>
                </div>
              )}
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
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
                      Email
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
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                      {isEditing && (
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="show_website"
                            checked={formData.show_website}
                            onChange={handleCheckboxChange}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-300 text-sm">Show</span>
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Instagram
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                      {isEditing && (
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="show_instagram"
                            checked={formData.show_instagram}
                            onChange={handleCheckboxChange}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-300 text-sm">Show</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Facebook
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                      {isEditing && (
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="show_facebook"
                            checked={formData.show_facebook}
                            onChange={handleCheckboxChange}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-300 text-sm">Show</span>
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      TikTok
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <svg 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                          <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                          <path d="M15 8v8a4 4 0 0 1-4 4"></path>
                          <path d="M15 8h-4"></path>
                        </svg>
                        <input
                          type="text"
                          name="tiktok"
                          value={formData.tiktok}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                      {isEditing && (
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="show_tiktok"
                            checked={formData.show_tiktok}
                            onChange={handleCheckboxChange}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-300 text-sm">Show</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="show_profile"
                        checked={formData.show_profile}
                        onChange={handleCheckboxChange}
                        className="text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-gray-300">Show profile publicly</span>
                    </label>
                    <p className="text-gray-400 text-xs mt-1 ml-6">
                      When disabled, your profile will only be visible to event managers, studio members, and clients you work with.
                    </p>
                  </div>
                )}

              {/* User Roles Section */}
              {user && (
                <div className="mt-6 p-6 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">User Roles</h3>
                  
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">
                      Your current roles:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {userRoles.map(role => (
                        <div 
                          key={role} 
                          className={`px-3 py-1 rounded-full text-sm flex items-center space-x-2 ${
                            role === primaryRole 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-white/10 text-gray-300 border border-white/20'
                          }`}
                        >
                          <span>{role}</span>
                          {role !== primaryRole && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRole(role);
                              }}
                              className="text-gray-400 hover:text-red-400 ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                          {role !== primaryRole && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetPrimaryRole(role);
                              }}
                              className="text-gray-400 hover:text-purple-400 ml-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4">
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="bg-white/5 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select a role to add</option>
                        {availableRoles
                          .filter(role => !userRoles.includes(role.value))
                          .map(role => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))
                        }
                      </select>
                      <button
                        onClick={handleAddRole}
                        disabled={!newRole}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-gray-400 text-xs mt-2">
                      Primary role is highlighted and cannot be removed. You can set any role as primary.
                    </p>
                  </div>
                </div>
              )}

                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
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
                    className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
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
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <stat.icon className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300">{stat.label}</span>
                    </div>
                    <span className="text-white font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Events</h3>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="border border-white/10 rounded-lg p-3">
                    <h4 className="text-white font-medium text-sm">{event.name}</h4>
                    <p className="text-gray-400 text-xs">{formatDate(event.date)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-purple-400 text-xs">{event.role}</span>
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Profile QR Code */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile QR Code</h3>
              <div className="flex justify-center mb-3">
                <div className="bg-white p-3 rounded-lg flex items-center justify-center">
                  <QRCodeSVG 
                    value={`https://tattsync.com/profile/${user?.id}`} 
                    size={128} 
                    bgColor={"#ffffff"} 
                    fgColor={"#000000"} 
                    level={"L"} 
                    includeMargin={false}
                  />
                </div>
              </div>
              <p className="text-center text-gray-400 text-sm">
                Share your profile with clients and colleagues
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}