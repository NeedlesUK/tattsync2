import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';


export function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [createAdminData, setCreateAdminData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [needsInitialSetup, setNeedsInitialSetup] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      // Check if any admin users exist
      const response = await api.get('/api/auth/setup-status');
      setNeedsInitialSetup(response.needsInitialSetup);
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

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

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateAdminData(prev => ({
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
    setSuccessMessage('');

    // Check if Supabase is configured
    if (!supabase) {
      setErrorMessage('Authentication service not configured. Please check your environment variables.');
      setIsLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Extract error message from response
      let message = 'Authentication failed. Please try again.';
      
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Validate inputs
      if (!createAdminData.name || !createAdminData.email || !createAdminData.password) {
        setErrorMessage('All fields are required');
        setIsCreatingAdmin(false);
        return;
      }

      if (createAdminData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters');
        setIsCreatingAdmin(false);
        return;
      }

      // Create initial admin user
      const response = await api.post('/api/auth/create-initial-admin', createAdminData);
      
      setSuccessMessage('Admin user created successfully! You can now log in.');
      setNeedsInitialSetup(false);
      
      // Reset form
      setCreateAdminData({
        name: '',
        email: '',
        password: ''
      });
    } catch (error: any) {
      console.error('Error creating admin:', error);
      
      // Extract error message
      let message = 'Failed to create admin user. Please try again.';
      
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // If we need initial setup, show the admin creation form
  if (needsInitialSetup) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Initial Setup</h1>
              <p className="text-gray-300">Create the first admin user to get started</p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={createAdminData.name}
                  onChange={handleAdminInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={createAdminData.email}
                    onChange={handleAdminInputChange}
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
                    type="password"
                    name="password"
                    value={createAdminData.password}
                    onChange={handleAdminInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingAdmin}
                className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCreatingAdmin ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Admin...</span>
                  </>
                ) : (
                  <span>Create Admin Account</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">{successMessage}</p>
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
            
            {/* Test Credentials */}
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-300 font-medium mb-2">Test Credentials</h4>
              <p className="text-blue-200 text-sm">
                Email: <span className="font-mono">gary@tattscore.com</span><br />
                Password: <span className="font-mono">password123</span>
              </p>
            </div>
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
              <p className="text-blue-200 text-sm mb-2">
                Accounts are created by administrators or through event applications.
              </p> 
              <button 
                onClick={() => setNeedsInitialSetup(true)}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                Create initial admin account
              </button>
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