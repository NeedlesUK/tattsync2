import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CreditCard, MessageCircle, Gift, Shield, Award, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export function HomePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create and manage tattoo conventions with ease'
    },
    {
      icon: Users,
      title: 'Application System',
      description: 'Handle applications for artists, piercers, and performers'
    },
    {
      icon: CreditCard,
      title: 'Payment Processing',
      description: 'Integrated payment processing with multiple plans'
    },
    {
      icon: MessageCircle,
      title: 'Communication',
      description: 'Built-in messaging system for all participants'
    },
    {
      icon: Gift,
      title: 'Deals & Offers',
      description: 'Promotional system for exclusive event offers'
    },
    {
      icon: Shield,
      title: 'Consent Management',
      description: 'Comprehensive consent forms with QR code generation'
    }
  ];

  const additionalFeatures = [
    {
      icon: Award,
      title: 'TattScore',
      description: 'Professional competition judging system for tattoo events',
      link: '/tattscore/admin'
    },
    {
      icon: Building,
      title: 'Studio Management',
      description: 'Complete studio management system for day-to-day operations',
      link: '/studio/dashboard'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch from API
      // For now, we'll just simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set loading to false without setting mock data
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Ready to manage your next tattoo convention?
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-gradient-to-r from-purple-600 to-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Event Management</h3>
              <p className="text-gray-300 mb-4">Manage your tattoo conventions and events</p>
              <Link
                to="/events"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors flex items-center"
              >
                View Events
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">TattScore</h3>
              <p className="text-gray-300 mb-4">Professional competition judging system</p>
              <Link
                to="/tattscore/admin"
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors flex items-center"
              >
                Manage Competitions
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Studio Management</h3>
              <p className="text-gray-300 mb-4">Day-to-day studio operations and booking</p>
              <Link
                to="/studio/dashboard"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center"
              >
                Studio Dashboard
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              TattSync
              <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                {' '}Complete Platform
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate platform for managing tattoo conventions, studios, and competitions. 
              Streamline your entire tattoo business with our integrated solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                to="/events"
                className="border border-purple-500 text-purple-400 px-8 py-3 rounded-lg font-medium hover:bg-purple-500/10 transition-all"
              >
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything you need to run successful events
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              From event creation to payment processing, TattSync handles every aspect of your convention management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:bg-white/10 transition-all transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Products Section */}
      <section className="py-16 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Specialized Solutions
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Discover our specialized products designed for the tattoo industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 hover:bg-white/10 transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 mb-6">{feature.description}</p>
                <Link
                  to={feature.link}
                  className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-teal-600/20 border border-purple-500/30 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to transform your tattoo business?
            </h2>
            <p className="text-gray-300 mb-6">
              Join thousands of professionals who trust TattSync for their events, studios, and competitions.
            </p>
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-purple-600 to-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
            >
              Sign In to Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}