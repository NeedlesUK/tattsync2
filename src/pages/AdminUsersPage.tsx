import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Search, Filter, User, Mail, Edit, Key, X } from 'lucide-react';
import { ChangeUserPassword } from '../components/admin/ChangeUserPassword';

export function AdminUsersPage() {
  const { user, supabase } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, filterRole, users]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching users from Supabase...');

      if (supabase) {
        console.log('Supabase client available, fetching users...');
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Error fetching users:', error.message, 'Status:', error.code);
          setUsers([]);
          setFilteredUsers([]);
          return;
        }

        console.log('Fetched users:', data?.length, 'users found');
        if (data) {
          setUsers(data);
          setFilteredUsers(data);
          console.log('Users state updated with fetched data');
        } else {
          console.log('No users found or empty data array');
          setUsers([]);
          setFilteredUsers([]);
        }
      } else {
        // Fallback to mock data
        console.log('Supabase client not available, using mock data');
        const mockUsers = [];
        
        // Add admin user
        mockUsers.push({
          id: '1',
          name: 'System Administrator',
          email: 'admin@tattsync.com',
          role: 'admin',
          created_at: new Date().toISOString()
        });
        
        // Add event manager
        mockUsers.push({
          id: '2',
          name: 'Gary Watts',
          email: 'gary@gwts.co.uk',
          role: 'event_manager',
          created_at: new Date().toISOString()
        });
        
        console.log('Using mock data with', mockUsers.length, 'users');
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function that can be called from the UI
  const refreshUsers = () => {
    console.log('Manually refreshing users list...');
    setIsLoading(true);
    
    // Use setTimeout to ensure the loading state is visible
    setTimeout(() => {
      fetchUsers();
    }, 100);
  };

  const handleChangePassword = (selectedUser: any) => {
    setSelectedUser(selectedUser);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChangeComplete = () => {
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
  };

  // Only allow admin access
  if (user?.role !== 'admin' && user?.email !== 'admin@tattsync.com') {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-300">Manage user accounts and permissions ({users.length} users found)</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshUsers}
              className="mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span>Refresh Users</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="event_manager">Event Manager</option>
              <option value="artist">Artist</option>
              <option value="piercer">Piercer</option>
              <option value="trader">Trader</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {user.created_at ? formatDate(user.created_at) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleChangePassword(user)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Key className="w-4 h-4" />
                          <span>Change Password</span>
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded text-sm transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No users found</h3>
            <p className="text-gray-400">
              {searchTerm || filterRole !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No users have been created yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Change Password</h2>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <ChangeUserPassword 
                userId={selectedUser.id} 
                userName={selectedUser.name}
                onComplete={handlePasswordChangeComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}