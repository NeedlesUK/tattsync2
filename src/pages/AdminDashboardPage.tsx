import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, MessageCircle, Settings, Shield, User, Mail, Edit, Key, X, FileText, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AdminDashboardPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [aftercareTemplates, setAftercareTemplates] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalStudios: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && supabase) {
      fetchDashboardData();
    }
  }, [user, supabase]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      if (supabase) {
        console.log('Fetching admin dashboard data...');
        // Fetch stats
        const [usersResult, eventsResult, studiosResult] = await Promise.all([
          supabase.from('users').select('count'),
          supabase.from('events').select('count'),
          supabase.from('studios').select('count')
        ]);

        console.log('Stats results:', { 
          users: usersResult, 
          events: eventsResult, 
          studios: studiosResult
        });

        setStats({
          totalUsers: usersResult.data?.[0]?.count || 0,
          totalEvents: eventsResult.data?.[0]?.count || 0,
          totalStudios: studiosResult.data?.[0]?.count || 0
        });

        // Fetch recent users
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          setRecentUsers(users || []);
        }

        // Fetch events for module management
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            name,
            status,
            event_modules (
              id,
              ticketing_enabled,
              consent_forms_enabled,
              tattscore_enabled
            )
          `)
          .order('created_at', { ascending: false });
          
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        } else {
          setEvents(eventsData || []);
        }
        
        // Fetch consent templates
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = () => {
    if (!supabase) return;
    
    // Fetch consent templates
    supabase
      .from('consent_form_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching consent templates:', error);
        } else {
          console.log('Fetched consent templates:', data);
          setTemplates(data || []);
        }
      });
    
    // Fetch aftercare templates
    supabase
      .from('aftercare_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching aftercare templates:', error);
        } else {
          console.log('Fetched aftercare templates:', data);
          setAftercareTemplates(data || []);
        }
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage your platform and monitor activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Studios</p>
                <p className="text-3xl font-bold text-white">{stats.totalStudios}</p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Recent Users</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-medium">{user.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Event Module Management */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Event Modules</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Modules</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-medium">{event.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {event.event_modules?.[0]?.ticketing_enabled && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                              Ticketing
                            </span>
                          )}
                          {event.event_modules?.[0]?.consent_forms_enabled && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                              Consent
                            </span>
                          )}
                          {event.event_modules?.[0]?.tattscore_enabled && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                              TattScore
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/events/${event.id}/modules`)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Template Management Section */}
        <div className="mt-8 space-y-8">
          {/* Consent Form Templates */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Consent Form Templates</h2>
              <p className="text-gray-300 text-sm mt-1">Master templates for consent forms</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Template</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Medical History</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {templates && templates.length > 0 ? (
                    templates.map((template) => (
                      <tr key={template.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-medium">{template.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {template.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {template.requires_medical_history ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                              Required
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
                              Not Required
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {new Date(template.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => navigate('/admin/consent-templates')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                        No templates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aftercare Templates */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Aftercare Templates</h2>
              <p className="text-gray-300 text-sm mt-1">Email templates for aftercare instructions</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Template</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Procedure Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {aftercareTemplates && aftercareTemplates.length > 0 ? (
                    aftercareTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-medium">{template.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {template.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 capitalize">
                            {template.procedure_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {new Date(template.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => navigate('/admin/aftercare-templates')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                        No templates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}