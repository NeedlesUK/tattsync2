import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, CreditCard, User, Clock, ArrowRight, Home } from 'lucide-react';

interface LocationState {
  eventName: string;
  applicationType: string;
  requiresPayment: boolean;
  paymentMethod: string;
}

export function RegistrationSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  if (!state) {
    // Redirect if no state data
    navigate('/');
    return null;
  }

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

  const getPaymentMethodTitle = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash Payment';
      case 'bank_transfer': return 'Bank Transfer';
      case 'stripe_full': return 'Online Payment (Full Amount)';
      case 'stripe_3_installments': return 'Online Payment (3 Installments)';
      case 'stripe_6_installments': return 'Online Payment (6 Installments)';
      default: return method;
    }
  };

  const getNextSteps = () => {
    const steps = [
      {
        icon: User,
        title: 'Complete Your Profile',
        description: 'Add portfolio images, business information, and other required details within 30 days.',
        urgent: true
      }
    ];

    if (state.requiresPayment) {
      if (state.paymentMethod === 'cash') {
        steps.unshift({
          icon: CreditCard,
          title: 'Bring Cash Payment',
          description: 'Remember to bring your registration fee in cash to the event registration desk.',
          urgent: false
        });
      } else if (state.paymentMethod === 'bank_transfer') {
        steps.unshift({
          icon: CreditCard,
          title: 'Complete Bank Transfer',
          description: 'Transfer your registration fee using the bank details provided. Use your application reference.',
          urgent: true
        });
      } else if (state.paymentMethod.startsWith('stripe_')) {
        steps.unshift({
          icon: CreditCard,
          title: 'Payment Processing',
          description: 'Your payment will be processed automatically. You\'ll receive confirmation emails for each payment.',
          urgent: false
        });
      }
    }

    return steps;
  };

  const nextSteps = getNextSteps();

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Registration Complete!</h1>
          <p className="text-gray-300 text-lg">
            You're all set for <span className="text-purple-400 font-medium">{state.eventName}</span>
          </p>
        </div>

        {/* Registration Summary */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Registration Summary</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Event:</span>
              <span className="text-white font-medium">{state.eventName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Role:</span>
              <span className="text-white font-medium">{getApplicationTypeTitle(state.applicationType)}</span>
            </div>
            {state.requiresPayment && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white font-medium">{getPaymentMethodTitle(state.paymentMethod)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Registration Date:</span>
              <span className="text-white font-medium">{new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">What's Next?</h2>
          
          <div className="space-y-4">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className={`border rounded-lg p-4 ${
                  step.urgent 
                    ? 'border-yellow-500/30 bg-yellow-500/10' 
                    : 'border-white/20 bg-white/5'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      step.urgent ? 'bg-yellow-500/20' : 'bg-purple-500/20'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        step.urgent ? 'text-yellow-400' : 'text-purple-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{step.title}</h3>
                      <p className="text-gray-300 text-sm">{step.description}</p>
                      {step.urgent && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-medium">Action Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-blue-300 font-medium mb-3">Important Information</h3>
          <ul className="text-blue-200 text-sm space-y-2">
            <li>• You will receive a confirmation email with all the details</li>
            <li>• Complete your profile within 30 days to maintain your registration</li>
            <li>• Check your email regularly for event updates and important announcements</li>
            <li>• Contact the event organizer if you have any questions or need to make changes</li>
            {state.paymentMethod.startsWith('stripe_') && (
              <li>• Payment confirmations will be sent for each installment</li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Complete Profile</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </button>
        </div>

        {/* Support Contact */}
        <div className="text-center mt-8 p-4 bg-white/5 rounded-lg">
          <p className="text-gray-400 text-sm">
            Need help? Contact the event organizer at{' '}
            <a href="mailto:support@tattsync.com" className="text-purple-400 hover:text-purple-300">
              support@tattsync.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}