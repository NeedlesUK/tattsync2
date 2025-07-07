import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, MessageCircle, Settings, Plus, Clock, User, Mail, Phone, MapPin, Globe, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StudioMemberModal } from '../components/studio/StudioMemberModal';
import { StudioServiceModal } from '../components/studio/StudioServiceModal';

export function StudioDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [studioData, setStudioData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    fetchStudioData();
    fetchMembers();
    fetchServices();
    fetchClients();
    fetchAppointments();
  }, []);

  const fetchStudioData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch studio data
      setStudioData(null);
    } catch (error) {
      console.error('Error fetching studio data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      // TODO: Implement API call to fetch members
      setMembers([]);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchServices = async () => {
    try {
      // TODO: Implement API call to fetch services
      setServices([]);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchClients = async () => {
    try {
      // TODO: Implement API call to fetch clients
      setClients([]);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      // TODO: Implement API call to fetch appointments
      setAppointments([]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleInviteMember = async (memberData: any) => {
    try {
      // In a real implementation, submit to API
      console.log('Inviting member:', memberData);
      
      // Add new member to list
      const newMember = {
        id: Date.now(),
        user_id: Date.now().toString(),
        name: memberData.name,
        email: memberData.email,
        role: memberData.role,
        is_active: true,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
      };
      
      setMembers([...members, newMember]);
      setIsMemberModalOpen(false);
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  };

  const handleSaveService = async (serviceData: any) => {
    try {
      // In a real implementation, submit to API
      console.log('Saving service:', serviceData);
      
      if (selectedService) {
        // Update existing service
        const updatedServices = services.map(service => 
          service.id === selectedService.id ? { ...service, ...serviceData } : service
        );
        setServices(updatedServices);
      } else {
        // Create new service
        const newService = {
          id: Date.now(),
          ...serviceData
        };
        setServices([...services, newService]);
      }
      
      setIsServiceModalOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'studio_manager':
        return 'bg-purple-500/20 text-purple-400';
      case 'artist':
        return 'bg-blue-500/20 text-blue-400';
      case 'piercer':
        return 'bg-teal-500/20 text-teal-400';
      case 'receptionist':
        return 'bg-orange-500/20 text-orange-400';
      case 'apprentice':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Studio Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {studioData.logo_url ? (
              <img
                src={studioData.logo_url}
                alt={studioData.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
              />
            ) : (
              <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center border-4 border-purple-500/30">
                <span className="text-3xl font-bold text-purple-400">{studioData.name.charAt(0)}</span>
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-white">{studioData.name}</h1>
                <button className="mt-2 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Studio</span>
                </button>
              </div>
              
              <p className="text-gray-300 mb-4">{studioData.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{studioData.address}, {studioData.city}, {studioData.postal_code}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{studioData.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{studioData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Appointments */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>View Calendar</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-medium">{appointment.client_name}</h3>
                        <p className="text-gray-400 text-sm">{appointment.service}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-2" />
                        {appointment.time} ({appointment.duration})
                      </div>
                      <div className="flex items-center text-gray-300">
                        <User className="w-4 h-4 mr-2" />
                        {appointment.artist}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {appointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No upcoming appointments</p>
                </div>
              )}
            </div>

            {/* Services */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Services</h2>
                <button 
                  onClick={() => {
                    setSelectedService(null);
                    setIsServiceModalOpen(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div 
                    key={service.id} 
                    className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedService(service);
                      setIsServiceModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">{service.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.service_type === 'tattoo' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-teal-500/20 text-teal-400'
                      }`}>
                        {service.service_type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{service.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {formatCurrency(service.price_from)} - {formatCurrency(service.price_to)}
                      </span>
                      <span className="text-gray-300">{service.duration_minutes} min</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {services.length === 0 && (
                <div className="text-center py-8">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No services defined yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Team Members</span>
                  <span className="text-white font-bold">{members.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Services</span>
                  <span className="text-white font-bold">{services.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Clients</span>
                  <span className="text-white font-bold">{clients.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Upcoming Appointments</span>
                  <span className="text-white font-bold">{appointments.length}</span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Team</h2>
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{member.name}</p>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleColor(member.role)}`}>
                          {member.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Clients */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Clients</h2>
                <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {clients.slice(0, 3).map((client) => (
                  <div key={client.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{client.name}</p>
                      <p className="text-gray-400 text-xs">Last visit: {client.last_visit}</p>
                    </div>
                    <div className="bg-white/10 px-2 py-1 rounded text-xs text-white">
                      {client.total_visits} visits
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <StudioMemberModal
          studioId={studioData.id}
          studioName={studioData.name}
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          onInvite={handleInviteMember}
        />

        <StudioServiceModal
          studioId={studioData.id}
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedService(null);
          }}
          onSave={handleSaveService}
          initialData={selectedService}
        />
      </div>
    </div>
  );
}