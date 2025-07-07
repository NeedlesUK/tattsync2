import React, { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Calendar, QrCode, Download, Share2 } from 'lucide-react';
import { TicketCard } from '../components/tickets/TicketCard';
import { TicketPurchaseForm } from '../components/tickets/TicketPurchaseForm';
import { useAuth } from '../contexts/AuthContext';

export function ClientTicketsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Mock data - in real implementation, fetch from API
  const events: any[] = [];

  useEffect(() => {
    // Simulate loading data
    // TODO: Implement API call to fetch tickets
    setTickets([]);
    setIsLoading(false);
  }, []);

  const handleDownloadTicket = (ticketId: number) => {
    console.log('Downloading ticket:', ticketId);
    // In real implementation, generate and download ticket PDF
  };

  const handleShareTicket = (ticketId: number) => {
    console.log('Sharing ticket:', ticketId);
    // In real implementation, show sharing options
  };

  const handlePurchaseTicket = async (formData: any) => {
    try {
      // In real implementation, process purchase via API
      console.log('Processing ticket purchase:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new ticket to list
      const newTicket = {
        id: tickets.length + 1,
        eventName: selectedEvent.name,
        eventLocation: selectedEvent.location,
        eventVenue: selectedEvent.venue,
        ticketType: selectedEvent.ticketTypes.find((t: any) => t.id === formData.ticketTypeId)?.name || 'Ticket',
        purchaseDate: new Date().toISOString(),
        eventDate: selectedEvent.dates[0],
        qrCode: `TICKET-${selectedEvent.id}-${user?.id}-${formData.ticketTypeId}-${Math.floor(Math.random() * 1000000)}`,
        status: 'active'
      };
      
      setTickets([newTicket, ...tickets]);
      setActiveTab('my-tickets');
      setSelectedEvent(null);
      
      // Show success message
      alert('Ticket purchased successfully!');
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      throw error;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
            <p className="text-gray-300">
              Manage your event tickets and purchases
            </p>
          </div>
          
          {activeTab === 'my-tickets' && (
            <button
              onClick={() => setActiveTab('buy-tickets')}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Ticket className="w-5 h-5" />
              <span>Buy Tickets</span>
            </button>
          )}
          
          {activeTab === 'buy-tickets' && !selectedEvent && (
            <button
              onClick={() => setActiveTab('my-tickets')}
              className="mt-4 sm:mt-0 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Back to My Tickets
            </button>
          )}
          
          {selectedEvent && (
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 sm:mt-0 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Events
            </button>
          )}
        </div>

        {/* My Tickets Tab */}
        {activeTab === 'my-tickets' && (
          <div className="space-y-6">
            {/* Filters */}
            {tickets.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="used">Used</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tickets Grid */}
            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onDownload={handleDownloadTicket}
                    onShare={handleShareTicket}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No tickets found</h3>
                <p className="text-gray-400 mb-6">
                  You haven't purchased any tickets yet
                </p>
                <button
                  onClick={() => setActiveTab('buy-tickets')}
                  className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Buy Tickets
                </button>
              </div>
            )}
          </div>
        )}

        {/* Buy Tickets Tab */}
        {activeTab === 'buy-tickets' && (
          <div>
            {selectedEvent ? (
              <div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">{selectedEvent.name}</h2>
                  <div className="flex items-center text-gray-300 text-sm mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(selectedEvent.dates[0]).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                    {selectedEvent.dates.length > 1 && (
                      <> - {new Date(selectedEvent.dates[selectedEvent.dates.length - 1]).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</>
                    )}
                  </div>
                  <p className="text-gray-300">
                    {selectedEvent.venue}, {selectedEvent.location}
                  </p>
                </div>
                
                <TicketPurchaseForm
                  eventId={selectedEvent.id}
                  eventName={selectedEvent.name}
                  eventDates={selectedEvent.dates}
                  ticketTypes={selectedEvent.ticketTypes}
                  onPurchase={handlePurchaseTicket}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Available Events</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
                      <div className="flex items-center text-gray-300 text-sm mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.dates[0]).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                        {event.dates.length > 1 && (
                          <> - {new Date(event.dates[event.dates.length - 1]).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</>
                        )}
                      </div>
                      <p className="text-gray-300 mb-4">
                        {event.venue}, {event.location}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {event.ticketTypes.map((type: any) => (
                          <span key={type.id} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                            {type.name}: £{type.price_gbp}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}