import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any error messages when component mounts
    setErrorMessage('');
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous attempts
    if (isLoading) {
      console.log('Sign in already in progress, ignoring...');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('Attempting login with:', formData.email);
      await login(formData.email, formData.password);
      // Don't navigate here - the useEffect will handle it
      console.log('Login request successful');
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Extract error message from response
      let message = 'Login failed. Please check your email and password.';
      
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      console.log('Login attempt completed');
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to access your TattSync dashboard</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors" 
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              onClick={(e) => {
                console.log('Button clicked, loading state:', isLoading);
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Need an Account?</h4>
              <p className="text-blue-200 text-sm">
                Accounts are created by administrators or through event applications. 
                Contact your event organizer for access.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">TattSync Platform</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-1">Event Management</h4>
              <p className="text-gray-300 text-sm">Complete event organization tools</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-1">Application System</h4>
              <p className="text-gray-300 text-sm">Streamlined application process</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-1">Secure Platform</h4>
              <p className="text-gray-300 text-sm">Professional event management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}