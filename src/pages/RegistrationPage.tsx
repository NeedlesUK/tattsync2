import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle, Mail, Lock, Eye, EyeOff, Info, UserPlus, CheckCircle } from 'lucide-react';

export function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'gary@tattscore.com',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTestCredentials, setShowTestCredentials] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login, supabase } = useAuth();
  const navigate = useNavigate();

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
    setIsLoading(true);
    setErrorMessage('');

    try {
      setLoginSuccess(false);
      await login(formData.email, formData.password);
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle different types of authentication errors
      let message = 'Authentication failed. Please check your credentials and try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          message = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else {
          message = error.message;
        }
      }
      
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fill in test credentials
  const useTestCredentials = () => {
    setFormData({
      email: 'gary@tattscore.com',
      password: 'password123' 
    });
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

          {/* Success Message */}
          {loginSuccess && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">Login successful! Redirecting to dashboard...</p>
            </div>
          )}

          {/* Development Notice */}
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-blue-300 font-medium mb-1">Development Environment</h4>
                <p className="text-blue-200 text-sm mb-3">
                  This is a development version. You'll need valid Supabase credentials to sign in.
                </p>
                <p className="text-blue-200 text-sm mb-3">
                  <strong>Note:</strong> The default admin account is pre-filled for you.
                </p>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowTestCredentials(!showTestCredentials)}
                    className="text-blue-300 hover:text-blue-200 text-sm underline"
                  >
                    {showTestCredentials ? 'Hide' : 'Show'} test credentials
                  </button>
                  <button
                    type="button"
                    onClick={useTestCredentials}
                    className="text-blue-300 hover:text-blue-200 text-sm underline"
                  >
                    Use test credentials
                  </button>
                </div>
                {showTestCredentials && (
                  <div className="mt-3 p-3 bg-blue-600/20 rounded border border-blue-500/40">
                    <p className="text-blue-200 text-xs mb-2">Test credentials (if available):</p>
                    <p className="text-blue-100 text-xs font-mono">Email: gary@tattscore.com</p>
                    <p className="text-blue-100 text-xs font-mono">Password: password123</p>
                    <p className="text-amber-300 text-xs font-medium mt-2">
                      The default admin account (gary@tattscore.com) has been pre-configured in the database.
                      Use this account to access all features of the application.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 text-sm">{errorMessage}</p>
                {errorMessage.includes('Invalid email or password') && (
                  <p className="text-red-300 text-xs mt-1">
                    Try using the pre-filled credentials for the admin account.
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
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
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <UserPlus className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-300 font-medium mb-2">Need an Account?</h4>
                  <p className="text-amber-200 text-sm mb-3">
                    For development: Create a user in your Supabase Authentication panel.
                  </p>
                  <p className="text-amber-200 text-sm">
                    For production: Accounts are created by administrators or through event applications.
                  </p>
                </div>
              </div>
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