import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, FileText, Save, AlertCircle } from 'lucide-react';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingRequest) => Promise<void>;
  artistName: string;
  artistType: string;
  availableDates: string[];
  availableTimeSlots: { start: string; end: string }[];
}

export interface BookingRequest {
  artist_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  description: string;
  consent_to_contact: boolean;
}

export function BookingRequestModal({
  isOpen,
  onClose,
  onSubmit,
  artistName,
  artistType,
  availableDates,
  availableTimeSlots
}: BookingRequestModalProps) {
  const [formData, setFormData] = useState<BookingRequest>({
    artist_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    booking_date: availableDates[0] || '',
    booking_time: availableTimeSlots[0]?.start || '',
    description: '',
    consent_to_contact: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof BookingRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Name is required';
    }
    
    if (!formData.client_email.trim()) {
      newErrors.client_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.client_email)) {
      newErrors.client_email = 'Email is invalid';
    }
    
    if (!formData.client_phone.trim()) {
      newErrors.client_phone = 'Phone number is required';
    }
    
    if (!formData.booking_date) {
      newErrors.booking_date = 'Please select a date';
    }
    
    if (!formData.booking_time) {
      newErrors.booking_time = 'Please select a time';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description of what you want';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting booking request:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit booking request. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Book with {artistName}</h2>
            <p className="text-gray-300 text-sm capitalize">{artistType}</p>
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
          {errors.submit && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
          
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.client_name ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Your full name"
                  />
                </div>
                {errors.client_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.client_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleInputChange('client_email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.client_email ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Your email address"
                  />
                </div>
                {errors.client_email && (
                  <p className="text-red-400 text-sm mt-1">{errors.client_email}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) => handleInputChange('client_phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.client_phone ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Your phone number"
                />
              </div>
              {errors.client_phone && (
                <p className="text-red-400 text-sm mt-1">{errors.client_phone}</p>
              )}
            </div>
          </div>
          
          {/* Booking Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.booking_date}
                    onChange={(e) => handleInputChange('booking_date', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                      errors.booking_date ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="" disabled>Select a date</option>
                    {availableDates.map((date) => (
                      <option key={date} value={date} className="bg-gray-800">
                        {formatDate(date)}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.booking_date && (
                  <p className="text-red-400 text-sm mt-1">{errors.booking_date}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.booking_time}
                    onChange={(e) => handleInputChange('booking_time', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                      errors.booking_time ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="" disabled>Select a time</option>
                    {availableTimeSlots.map((slot) => (
                      <option key={slot.start} value={slot.start} className="bg-gray-800">
                        {new Date(slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.booking_time && (
                  <p className="text-red-400 text-sm mt-1">{errors.booking_time}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder={`Describe what you want (${artistType === 'artist' ? 'tattoo design, size, placement, etc.' : 'piercing type, jewelry preferences, etc.'}`}
                />
              </div>
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>
          
          {/* Consent */}
          <div>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consent_to_contact}
                onChange={(e) => handleInputChange('consent_to_contact', e.target.checked)}
                className="mt-1 text-purple-600 focus:ring-purple-500 rounded"
              />
              <span className="text-gray-300 text-sm">
                I consent to be contacted by the artist regarding this booking request. I understand that I will need to complete a consent form before my appointment.
              </span>
            </label>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">What happens next?</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Your booking request will be sent to {artistName}</li>
              <li>• You'll receive an email confirmation of your request</li>
              <li>• The artist will review and confirm your booking</li>
              <li>• You'll receive reminders before your appointment</li>
            </ul>
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
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.consent_to_contact}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}