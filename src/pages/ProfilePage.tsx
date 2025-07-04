import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Edit, Shield, Calendar, Award, Eye, EyeOff, Lock, Instagram, Facebook, Globe, Plus, Trash2, CheckCircle, AlertCircle, EyeOff as EyeSlash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user, logout, updateUserEmail, updateUserRoles, supabase } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'Los Angeles, CA',
    bio: 'Experienced tattoo artist specializing in traditional and neo-traditional styles.',
    website: 'https://example.com',
    instagram: '@artist_handle',
    facebook: '@artist.page',
    tiktok: '@artist_tiktok', 
    experience: '8 years',
    specialties: ['Traditional', 'Neo-Traditional', 'Black & Grey'],
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
  const [profilePicture, setProfilePicture] = useState(user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&dpr=2');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Roles state
  const [userRoles, setUserRoles] = useState<string[]>([]);
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
        setFormData(prev => ({
          ...prev,
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
        console.error('Error updating profile:', profileError);
        setSaveError('Failed to update profile. Please try again.');
        setIsSaving(false);
        return;
      }
      
      // Update email if changed
      if (user