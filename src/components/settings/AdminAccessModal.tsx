import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, Trash2, Mail, Shield, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AdminAccessModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (admins: AdminUser[]) => Promise<void>;
}

export function AdminAccessModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: AdminAccessModalProps) {
  const { supabase } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
    }
  }, [isOpen, eventId]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (supabase) {
        // In a real implementation, fetch event admins from database
        // For now, use mock data
        const mockAdmins: AdminUser[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'event_admin',
            permissions: ['manage_applications', 'manage_tickets', 'manage_content']
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'event_admin',
            permissions: ['manage_applications', 'manage_tickets']
          }
        ];
        
        setAdmins(mockAdmins);
      }
    } catch (err) {
      console.error('Exception fetching admins:', err);
      setError('Failed to load admin users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      
      if (supabase) {
        // In a real implementation, search for users in the database
        // For now, use mock data
        const mockResults = [
          { id: 'u1', name: 'Sarah Johnson', email: 'sarah@example.com' },
          { id: 'u2', name: 'Mike Chen', email: 'mike@example.com' }
        ].filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setSearchResults(mockResults);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    } finally {
      setIsLoading(false);
    }
  };

  const addAdmin = (user: any) => {
    // Check if user is already an admin
    if (admins.some(admin => admin.email === user.email)) {
      setError('This user is already an admin for this event');
      return;
    }
    
    const newAdmin: AdminUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'event_admin',
      permissions: ['manage_applications', 'manage_tickets', 'manage_content']
    };
    
    setAdmins([...admins, newAdmin]);
    setSearchResults([]);
    setSearchTerm('');
  };

  const addAdminByEmail = () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if user is already an admin
    if (admins.some(admin => admin.email === newAdminEmail)) {
      setError('This user is already an admin for this event');
      return;
    }
    
    const newAdmin: AdminUser = {
      id: `temp-${Date.now()}`,
      name: newAdminEmail.split('@')[0],
      email: newAdminEmail,
      role: 'event_admin',
      permissions: ['manage_applications', 'manage_tickets', 'manage_content']
    };
    
    setAdmins([...admins, newAdmin]);
    setNewAdminEmail('');
  };

  const removeAdmin = (adminId: string) => {
    setAdmins(admins.filter(admin => admin.id !== adminId));
  };

  const togglePermission = (adminId: string, permission: string) => {
    setAdmins(admins.map(admin => {
      if (admin.id === adminId) {
        const hasPermission = admin.permissions.includes(permission);
        const newPermissions = hasPermission
          ? admin.permissions.filter(p => p !== permission)
          : [...admin.permissions, permission];
        
        return { ...admin, permissions: newPermissions };
      }
      return admin;
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      await onSave(admins);
      setSuccess('Admin access settings saved successfully');
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception saving admin access:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const permissionOptions = [
    { value: 'manage_applications', label: 'Manage Applications' },
    { value: 'manage_tickets', label: 'Manage Tickets' },
    { value: 'manage_content', label: 'Manage Content' },
    { value: 'manage_payments', label: 'Manage Payments' },
    { value: 'manage_admins', label: 'Manage Admins' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Admin Access</h2>
            <p className="text-gray-300 text-sm">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}
          
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-blue-300 font-medium mb-2">Admin Access Control</h3>
            <p className="text-blue-200 text-sm">
              Add administrators to this event and control their permissions. Admins will have access to manage the event based on the permissions you grant them.
            </p>
          </div>

          {/* Add Admin Section */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Administrator</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Users
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Search by name or email"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Search
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white/5 border border-white/20 rounded-lg overflow-hidden">
                    {searchResults.map(user => (
                      <div 
                        key={user.id}
                        className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                          <button 
                            onClick={() => addAdmin(user)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Add by Email
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  <button
                    onClick={addAdminByEmail}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  If the user doesn't have an account yet, they will receive an invitation email.
                </p>
              </div>
            </div>
          </div>

          {/* Admin List */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Event Administrators</h3>
            
            {admins.length > 0 ? (
              <div className="space-y-4">
                {admins.map(admin => (
                  <div key={admin.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium">{admin.name}</h4>
                        <p className="text-gray-400 text-sm">{admin.email}</p>
                      </div>
                      <button
                        onClick={() => removeAdmin(admin.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
                        Permissions
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissionOptions.map(permission => (
                          <label key={permission.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={admin.permissions.includes(permission.value)}
                              onChange={() => togglePermission(admin.id, permission.value)}
                              className="text-purple-600 focus:ring-purple-500 rounded"
                            />
                            <span className="text-gray-300 text-sm">{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300">No administrators added yet</p>
                <p className="text-gray-400 text-sm mt-1">Add administrators using the form above</p>
              </div>
            )}
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
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}