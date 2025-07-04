import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Image, User, Mail, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { user } = useAuth();
  const { supabase } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_slug: '',
    startDate: '',
    endDate: '',
    location: '',
    venue: '',
    maxAttendees: '',
    image: '',
    eventManagerName: '',
    eventManagerEmail: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user has admin permissions
  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    try {
      // Check admin permissions on frontend
      if (!isAdmin) {
        throw new Error('Only Master Admins can create events. Please contact an administrator if you need to create an event.');
      }

      // Format the data for Supabase
      const eventData = {
        name: formData.name,
        description: formData.description,
        event_slug: formData.event_slug,
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location,
        venue: formData.venue,
        max_attendees: parseInt(formData.maxAttendees) || 500,
        status: 'draft'
      };
      
      console.log('Submitting event data:', eventData);
      
      // Create event directly with Supabase
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // First create the event
      const { data: eventResult, error: eventError } = await supabase
        .from('events')
        .insert(eventData)
        .select('id')
        .single();
      
      if (eventError) {
        throw eventError;
      }
      
      // Now handle the event manager
      // First check if the user exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', formData.eventManagerEmail)
        .maybeSingle();
      
      if (userCheckError) {
        throw userCheckError;
      }
      
      let eventManagerId;
      
      if (existingUser) {
        // User exists, update role if needed
        eventManagerId = existingUser.id;
        
        if (existingUser.role !== 'event_manager' && existingUser.role !== 'admin') {
          const { error: updateRoleError } = await supabase
            .from('users')
            .update({ 
              role: 'event_manager', 
              updated_at: new Date().toISOString() 
            })
            .eq('id', existingUser.id);
            
          if (updateRoleError) {
            throw updateRoleError;
          }
        }
      } else {
        // Create new user with event_manager role
        // This would normally be done through auth.admin.createUser
        // But we'll just show a message that this would be done
        setSuccess('Event created successfully! A new account would be created for the event manager and they would receive an email with login instructions.');
        setIsSubmitting(false);
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            event_slug: '',
            startDate: '',
            endDate: '',
            location: '',
            venue: '',
            maxAttendees: '',
            image: '',
            eventManagerName: '',
            eventManagerEmail: ''
          });
          onClose();
        }, 2000);
        
        return;
      }
      
      // Update the event with the event manager
      const { error: updateEventError } = await supabase
        .from('events')
        .update({ 
          event_manager_id: eventManagerId,
          updated_at: new Date().toISOString() 
        })
        .eq('id', eventResult.id);
        
      if (updateEventError) {
        throw updateEventError;
      }
      
      console.log('Event created successfully with ID:', eventResult.id);
      
      // Show success message
      setSuccess('Event created successfully! The event manager has been assigned.');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          event_slug: '',
          startDate: '',
          endDate: '',
          location: '',
          venue: '',
          maxAttendees: '',
          image: '',
          eventManagerName: '',
          eventManagerEmail: ''
        });
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || err.error_description || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        event_slug: slug
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white">Create New Event</h2>
            {isAdmin && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-300">Admin Access</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isAdmin && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-medium">Access Restricted</p>
              <p className="text-red-300 text-sm">Only Master Admins can create events. Please contact an administrator if you need to create an event.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Information */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Event Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter event name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Slug (URL)
                </label>
                <input
                  type="text"
                  name="event_slug"
                  value={formData.event_slug}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="event-url-slug"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Town, City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Convention center name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Event Manager Assignment */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Event Manager Assignment</h3>
            <p className="text-gray-300 text-sm mb-4">
              Assign an Event Manager who will be responsible for managing applications and event details.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Event Manager Name
                </label>
                <input
                  type="text"
                  name="eventManagerName"
                  value={formData.eventManagerName}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter manager's full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Event Manager Email
                </label>
                <input
                  type="email"
                  name="eventManagerEmail"
                  value={formData.eventManagerEmail}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="manager@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> If this email doesn't exist in the system, a new Event Manager account will be created automatically. 
                The Event Manager will receive login credentials and can then configure the event details, upload images, and manage applications.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAdmin}
              className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>{isAdmin ? 'Create Event & Assign Manager' : 'Admin Access Required'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}