import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, CreditCard, Banknote, Building, Calendar, Clock, User, Mail, Phone, Heart, Shield, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationData {
  token: string;
  application: {
    id: number;
    applicant_name: string;
    applicant_email: string;
    application_type: string;
    event_name: string;
    event_id: number;
  };
  requirements: {
    requires_payment: boolean;
    payment_amount: number;
    agreement_text: string;
    profile_deadline_days: number;
  };
  payment_settings: {
    cash_enabled: boolean;
    cash_details: string;
    bank_transfer_enabled: boolean;
    bank_details: string;
    stripe_enabled: boolean;
    allow_installments: boolean;
  };
}

interface RegistrationFormData {
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions: string;
  allergies: string;
  medications: string;
  agreement_accepted: boolean;
  payment_method: string;
}

export function RegistrationFormPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_conditions: '',
    allergies: '',
    medications: '',
    agreement_accepted: false,
    payment_method: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      fetchRegistrationData(token);
    }
  }, [token]);

  const fetchRegistrationData = async (registrationToken: string) => {
    try {
      setIsLoading(true);
      // Mock data - in real implementation, fetch from API
      const mockData: RegistrationData = {
        token: registrationToken,
        application: {
          id: 1,
          applicant_name: 'Sarah Johnson',
          applicant_email: 'sarah@example.com',
          application_type: 'artist',
          event_name: 'Ink Fest 2024',
          event_id: 1
        },
        requirements: {
          requires_payment: true,
          payment_amount: 150.00,
          agreement_text: `1. I have a valid tattoo registration issued by a local authority or government department or am willing to demonstrate my understanding of safe tattooing using the method(s) determined by the event.

2. I have or will have valid Public Liability Insurance for the event.

3. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

4. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

5. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

6. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

7. I understand that only the practitioner in this application may tattoo at the event in a single booth and this is not a studio application.`,
          profile_deadline_days: 30
        },
        payment_settings: {
          cash_enabled: true,
          cash_details: 'Cash payments can be made at the event registration desk. Please bring exact change when possible.',
          bank_transfer_enabled: true,
          bank_details: 'Bank transfers should be made to: Account Name: Event Organizer, Sort Code: 12-34-56, Account Number: 12345678. Please use your application reference as the payment reference.',
          stripe_enabled: true,
          allow_installments: true
        }
      };
      setRegistrationData(mockData);
    } catch (error) {
      console.error('Error fetching registration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationFormData, value: string | boolean) => {
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.emergency_contact_name.trim()) {
        newErrors.emergency_contact_name = 'Emergency contact name is required';
      }
      if (!formData.emergency_contact_phone.trim()) {
        newErrors.emergency_contact_phone = 'Emergency contact phone is required';
      }
    }

    if (step === 2 && requiresAgreement()) {
      if (!formData.agreement_accepted) {
        newErrors.agreement_accepted = 'You must accept the agreement to continue';
      }
    }

    if (step === 3 && registrationData?.requirements.requires_payment) {
      if (!formData.payment_method) {
        newErrors.payment_method = 'Please select a payment method';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // In real implementation, submit to API
      const submissionData = {
        token,
        registration_data: formData,
        profile_deadline: new Date(Date.now() + (registrationData!.requirements.profile_deadline_days * 24 * 60 * 60 * 1000))
      };
      
      console.log('Submitting registration:', submissionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page or dashboard
      navigate('/registration-success', { 
        state: { 
          eventName: registrationData?.application.event_name,
          applicationType: registrationData?.application.application_type,
          requiresPayment: registrationData?.requirements.requires_payment,
          paymentMethod: formData.payment_method
        }
      });
    } catch (error) {
      console.error('Error submitting registration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const requiresAgreement = () => {
    if (!registrationData) return false;
    const type = registrationData.application.application_type;
    return ['artist', 'piercer', 'trader', 'caterer'].includes(type) && 
           registrationData.requirements.agreement_text.trim() !== '';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return Banknote;
      case 'bank_transfer': return Building;
      case 'stripe_full': return CreditCard;
      case 'stripe_3_installments': return Calendar;
      case 'stripe_6_installments': return Clock;
      default: return CreditCard;
    }
  };

  const getPaymentMethodTitle = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash Payment';
      case 'bank_transfer': return 'Bank Transfer';
      case 'stripe_full': return 'Pay Full Amount Online';
      case 'stripe_3_installments': return 'Pay in 3 Installments';
      case 'stripe_6_installments': return 'Pay in 6 Installments';
      default: return method;
    }
  };

  const getInstallmentAmount = (total: number, installments: number) => {
    return (total / installments).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!registrationData) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Registration Link</h1>
          <p className="text-gray-300 mb-6">
            This registration link is invalid or has expired. Please contact the event organizer for assistance.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate total steps based on requirements
  let totalSteps = 1; // Always have step 1 (details)
  if (requiresAgreement()) totalSteps++; // Add agreement step if required
  if (registrationData.requirements.requires_payment) totalSteps++; // Add payment step if required

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Registration Approved!</h1>
                <p className="text-gray-300">
                  Complete your registration for <span className="text-purple-400 font-medium">{registrationData.application.event_name}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                Your application as a <strong>{getApplicationTypeTitle(registrationData.application.application_type)}</strong> has been approved. 
                Please complete the registration process below within 7 days.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < totalSteps && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-purple-600' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Details</span>
            {requiresAgreement() && <span>Agreement</span>}
            {registrationData.requirements.requires_payment && <span>Payment</span>}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Confirm Your Details</h2>
              
              {/* Pre-filled Information */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-3">Application Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-400 text-sm">Name</span>
                      <p className="text-white">{registrationData.application.applicant_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-400 text-sm">Email</span>
                      <p className="text-white">{registrationData.application.applicant_email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">Emergency Contact Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Emergency Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.emergency_contact_name ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter emergency contact name"
                  />
                  {errors.emergency_contact_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Emergency Contact Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.emergency_contact_phone ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter emergency contact phone"
                  />
                  {errors.emergency_contact_phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    value={formData.medical_conditions}
                    onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="List any medical conditions we should be aware of"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Allergies
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="List any allergies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Medications
                  </label>
                  <textarea
                    value={formData.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="List any current medications"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Agreement (only if required) */}
          {currentStep === 2 && requiresAgreement() && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Terms & Agreement</h2>
              
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <h3 className="text-white font-medium">Participation Agreement</h3>
                </div>
                <div className="bg-white/5 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-line">
                    {registrationData.requirements.agreement_text}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreement_accepted}
                    onChange={(e) => handleInputChange('agreement_accepted', e.target.checked)}
                    className="mt-1 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span className="text-gray-300">
                    I have read and agree to the terms and conditions above. I understand my responsibilities as a participant.
                  </span>
                </label>
                {errors.agreement_accepted && (
                  <p className="text-red-400 text-sm">{errors.agreement_accepted}</p>
                )}
              </div>

              {/* Profile Deadline Notice */}
              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-medium">Profile Completion Required</span>
                </div>
                <p className="text-blue-200 text-sm">
                  You must complete your profile with portfolio images and business information within{' '}
                  <strong>{registrationData.requirements.profile_deadline_days} days</strong> of registration.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Payment (only if required) */}
          {((currentStep === 3 && requiresAgreement()) || (currentStep === 2 && !requiresAgreement())) && 
           registrationData.requirements.requires_payment && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Payment Options</h2>
              
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Registration Fee:</span>
                  <span className="text-2xl font-bold text-white">£{registrationData.requirements.payment_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Cash Payment */}
                {registrationData.payment_settings.cash_enabled && (
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={formData.payment_method === 'cash'}
                      onChange={(e) => handleInputChange('payment_method', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border rounded-lg p-4 transition-all ${
                      formData.payment_method === 'cash'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}>
                      <div className="flex items-center space-x-3 mb-2">
                        <Banknote className="w-6 h-6 text-green-400" />
                        <span className="text-white font-medium">Cash Payment</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {registrationData.payment_settings.cash_details}
                      </p>
                    </div>
                  </label>
                )}

                {/* Bank Transfer */}
                {registrationData.payment_settings.bank_transfer_enabled && (
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={formData.payment_method === 'bank_transfer'}
                      onChange={(e) => handleInputChange('payment_method', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border rounded-lg p-4 transition-all ${
                      formData.payment_method === 'bank_transfer'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}>
                      <div className="flex items-center space-x-3 mb-2">
                        <Building className="w-6 h-6 text-blue-400" />
                        <span className="text-white font-medium">Bank Transfer</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {registrationData.payment_settings.bank_details}
                      </p>
                    </div>
                  </label>
                )}

                {/* Stripe Options */}
                {registrationData.payment_settings.stripe_enabled && (
                  <>
                    {/* Full Payment */}
                    <label className="block cursor-pointer">
                      <input
                        type="radio"
                        name="payment_method"
                        value="stripe_full"
                        checked={formData.payment_method === 'stripe_full'}
                        onChange={(e) => handleInputChange('payment_method', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`border rounded-lg p-4 transition-all ${
                        formData.payment_method === 'stripe_full'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-6 h-6 text-purple-400" />
                            <span className="text-white font-medium">Pay Full Amount Online</span>
                          </div>
                          <span className="text-white font-bold">£{registrationData.requirements.payment_amount.toFixed(2)}</span>
                        </div>
                        <p className="text-gray-300 text-sm mt-2">
                          Secure online payment with credit/debit card
                        </p>
                      </div>
                    </label>

                    {/* 3 Installments */}
                    {registrationData.payment_settings.allow_installments && (
                      <label className="block cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value="stripe_3_installments"
                          checked={formData.payment_method === 'stripe_3_installments'}
                          onChange={(e) => handleInputChange('payment_method', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`border rounded-lg p-4 transition-all ${
                          formData.payment_method === 'stripe_3_installments'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-6 h-6 text-teal-400" />
                              <span className="text-white font-medium">Pay in 3 Installments</span>
                            </div>
                            <span className="text-white font-bold">£{getInstallmentAmount(registrationData.requirements.payment_amount, 3)} each</span>
                          </div>
                          <p className="text-gray-300 text-sm mt-2">
                            3 monthly payments of £{getInstallmentAmount(registrationData.requirements.payment_amount, 3)}
                          </p>
                        </div>
                      </label>
                    )}

                    {/* 6 Installments */}
                    {registrationData.payment_settings.allow_installments && (
                      <label className="block cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value="stripe_6_installments"
                          checked={formData.payment_method === 'stripe_6_installments'}
                          onChange={(e) => handleInputChange('payment_method', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`border rounded-lg p-4 transition-all ${
                          formData.payment_method === 'stripe_6_installments'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-6 h-6 text-orange-400" />
                              <span className="text-white font-medium">Pay in 6 Installments</span>
                            </div>
                            <span className="text-white font-bold">£{getInstallmentAmount(registrationData.requirements.payment_amount, 6)} each</span>
                          </div>
                          <p className="text-gray-300 text-sm mt-2">
                            6 monthly payments of £{getInstallmentAmount(registrationData.requirements.payment_amount, 6)}
                          </p>
                        </div>
                      </label>
                    )}
                  </>
                )}

                {errors.payment_method && (
                  <p className="text-red-400 text-sm">{errors.payment_method}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Completing Registration...</span>
                  </>
                ) : (
                  <span>Complete Registration</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}