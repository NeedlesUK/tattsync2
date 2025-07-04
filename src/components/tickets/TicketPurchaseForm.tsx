import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, User, Mail, Phone, CheckCircle, Tag, AlertCircle } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price_gbp: number;
  capacity: number | null;
  available: number | null;
  sold: number;
}

interface TicketPurchaseFormProps {
  eventId: number;
  eventName: string;
  eventDates: string[];
  ticketTypes: TicketType[];
  onPurchase: (formData: any) => Promise<void>;
}

export function TicketPurchaseForm({
  eventId,
  eventName,
  eventDates,
  ticketTypes,
  onPurchase
}: TicketPurchaseFormProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
  } | null>(null);
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    marketing_consent: false,
    platform_consent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set first ticket type as default
  useEffect(() => {
    if (ticketTypes.length > 0 && !selectedTicket) {
      setSelectedTicket(ticketTypes[0].id);
    }
  }, [ticketTypes, selectedTicket]);

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsCheckingDiscount(true);
    
    try {
      // Mock discount check - in real implementation, this would validate against the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (discountCode.toUpperCase() === 'INVALID') {
        setErrors(prev => ({
          ...prev,
          discountCode: 'Invalid discount code'
        }));
        setDiscountApplied(null);
      } else {
        setDiscountApplied({
          code: discountCode.toUpperCase(),
          type: discountCode.toUpperCase() === 'SUMMER10' ? 'percentage' : 'fixed',
          value: discountCode.toUpperCase() === 'SUMMER10' ? 10 : 5
        });
        setErrors(prev => ({
          ...prev,
          discountCode: ''
        }));
      }
    } catch (error) {
      console.error('Error checking discount:', error);
      setErrors(prev => ({
        ...prev,
        discountCode: 'Error checking discount code'
      }));
    } finally {
      setIsCheckingDiscount(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedTicket) return 0;
    
    const ticket = ticketTypes.find(t => t.id === selectedTicket);
    if (!ticket) return 0;
    
    let total = ticket.price_gbp * quantity;
    
    if (discountApplied) {
      if (discountApplied.type === 'percentage') {
        total = total * (1 - discountApplied.value / 100);
      } else {
        total = Math.max(0, total - discountApplied.value);
      }
    }
    
    return total;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!selectedTicket) {
      newErrors.ticket = 'Please select a ticket type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const purchaseData = {
        eventId,
        ticketTypeId: selectedTicket,
        quantity,
        discountCode: discountApplied?.code,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        consent: {
          marketing: formData.marketing_consent,
          platform: formData.platform_consent
        },
        total: calculateTotal()
      };
      
      await onPurchase(purchaseData);
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'An error occurred while processing your purchase. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const getSelectedTicket = () => {
    return ticketTypes.find(t => t.id === selectedTicket);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Purchase Tickets</h2>
      
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ticket Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Select Ticket Type</h3>
          
          <div className="space-y-3">
            {ticketTypes.map((ticket) => (
              <label key={ticket.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name="ticket_type"
                  value={ticket.id}
                  checked={selectedTicket === ticket.id}
                  onChange={() => setSelectedTicket(ticket.id)}
                  className="sr-only"
                />
                <div className={`border rounded-lg p-4 transition-all ${
                  selectedTicket === ticket.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{ticket.name}</h4>
                      <p className="text-gray-300 text-sm">{ticket.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{formatCurrency(ticket.price_gbp)}</p>
                      {ticket.capacity && (
                        <p className="text-sm text-gray-400">
                          {ticket.available} remaining
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          {errors.ticket && (
            <p className="text-red-400 text-sm mt-2">{errors.ticket}</p>
          )}
        </div>
        
        {/* Quantity and Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num} className="bg-gray-800">
                  {num}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Discount Code (optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                disabled={!!discountApplied}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="Enter code"
              />
              {discountApplied ? (
                <button
                  type="button"
                  onClick={() => setDiscountApplied(null)}
                  className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={!discountCode.trim() || isCheckingDiscount}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isCheckingDiscount ? 'Checking...' : 'Apply'}
                </button>
              )}
            </div>
            
            {errors.discountCode && (
              <p className="text-red-400 text-sm mt-2">{errors.discountCode}</p>
            )}
            
            {discountApplied && (
              <div className="flex items-center space-x-2 mt-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>
                  {discountApplied.type === 'percentage' 
                    ? `${discountApplied.value}% discount applied` 
                    : `£${discountApplied.value.toFixed(2)} discount applied`}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
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
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.email ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.phone ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.marketing_consent}
                onChange={(e) => handleInputChange('marketing_consent', e.target.checked)}
                className="mt-1 text-purple-600 focus:ring-purple-500 rounded"
              />
              <span className="text-gray-300 text-sm">
                I consent to receive marketing communications about this event and similar events from the organizer.
              </span>
            </label>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.platform_consent}
                onChange={(e) => handleInputChange('platform_consent', e.target.checked)}
                className="mt-1 text-purple-600 focus:ring-purple-500 rounded"
              />
              <span className="text-gray-300 text-sm">
                I consent to receive marketing communications from TattSync about other events and services.
              </span>
            </label>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-300">
                {getSelectedTicket()?.name} x {quantity}
              </span>
              <span className="text-white">
                {formatCurrency((getSelectedTicket()?.price_gbp || 0) * quantity)}
              </span>
            </div>
            
            {discountApplied && (
              <div className="flex justify-between text-green-400">
                <span>Discount ({discountApplied.code})</span>
                <span>
                  {discountApplied.type === 'percentage'
                    ? `-${discountApplied.value}%`
                    : `-${formatCurrency(discountApplied.value)}`}
                </span>
              </div>
            )}
            
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Payment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}