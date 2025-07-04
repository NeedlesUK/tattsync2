import React, { useState, useEffect } from 'react';
import { Search, Filter, Ticket, QrCode, Plus, Download, Users, CreditCard, Calendar, Tag, BarChart } from 'lucide-react';
import { TicketTypeModal } from '../components/tickets/TicketTypeModal';
import { TicketDiscountModal } from '../components/tickets/TicketDiscountModal';
import { ComplimentaryTicketModal } from '../components/tickets/ComplimentaryTicketModal';
import { TicketScannerModal } from '../components/tickets/TicketScannerModal';
import { TicketStatsCard } from '../components/tickets/TicketStatsCard';
import { useAuth } from '../contexts/AuthContext';

export function TicketManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isTicketTypeModalOpen, setIsTicketTypeModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isComplimentaryModalOpen, setIsComplimentaryModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real implementation, fetch from API
  const [ticketTypes, setTicketTypes] = useState([
    {
      id: '1',
      name: 'Day Pass',
      description: 'Access for one day of your choice',
      price_gbp: 25.00,
      capacity: 500,
      available: 423,
      sold: 77
    },
    {
      id: '2',
      name: 'Weekend Pass',
      description: 'Full access to all days of the event',
      price_gbp: 65.00,
      capacity: 300,
      available: 187,
      sold: 113
    },
    {
      id: '3',
      name: 'VIP Pass',
      description: 'Premium access with exclusive perks',
      price_gbp: 120.00,
      capacity: 50,
      available: 32,
      sold: 18
    }
  ]);

  const [ticketSales, setTicketSales] = useState([
    { date: '2024-01-01', count: 5 },
    { date: '2024-01-02', count: 8 },
    { date: '2024-01-03', count: 12 },
    { date: '2024-01-04', count: 7 },
    { date: '2024-01-05', count: 15 },
    { date: '2024-01-06', count: 10 },
    { date: '2024-01-07', count: 20 }
  ]);

  const [purchasers, setPurchasers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      ticketType: 'Weekend Pass',
      quantity: 2,
      purchaseDate: '2024-01-15T14:30:00Z',
      total: 130.00,
      status: 'completed'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@example.com',
      ticketType: 'Day Pass',
      quantity: 1,
      purchaseDate: '2024-01-14T12:15:00Z',
      total: 25.00,
      status: 'completed'
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma@example.com',
      ticketType: 'VIP Pass',
      quantity: 1,
      purchaseDate: '2024-01-13T10:45:00Z',
      total: 120.00,
      status: 'completed'
    }
  ]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSaveTicketTypes = async (updatedTypes: any[]) => {
    try {
      // In real implementation, save to API
      console.log('Saving ticket types:', updatedTypes);
      setTicketTypes(updatedTypes);
    } catch (error) {
      console.error('Error saving ticket types:', error);
    }
  };

  const handleSaveDiscounts = async (discounts: any[]) => {
    try {
      // In real implementation, save to API
      console.log('Saving discounts:', discounts);
    } catch (error) {
      console.error('Error saving discounts:', error);
    }
  };

  const handleIssueComplimentary = async (recipients: any[]) => {
    try {
      // In real implementation, save to API
      console.log('Issuing complimentary tickets to:', recipients);
    } catch (error) {
      console.error('Error issuing complimentary tickets:', error);
    }
  };

  const handleScanComplete = async (ticketData: any, notes?: string) => {
    try {
      // In real implementation, save to API
      console.log('Ticket scanned:', ticketData, 'Notes:', notes);
    } catch (error) {
      console.error('Error recording ticket scan:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const getTotalSold = () => {
    return ticketTypes.reduce((sum, type) => sum + type.sold, 0);
  };

  const getTotalRevenue = () => {
    return ticketTypes.reduce((sum, type) => sum + (type.sold * type.price_gbp), 0);
  };

  const getCapacityPercentage = () => {
    const totalCapacity = ticketTypes.reduce((sum, type) => sum + (type.capacity || 0), 0);
    const totalSold = getTotalSold();
    return totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mock event data
  const event = {
    id: 1,
    name: 'Ink Fest 2024',
    startDate: '2024-03-15',
    endDate: '2024-03-17'
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Ticket Management</h1>
            <p className="text-gray-300">
              Manage tickets for {event.name}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan Ticket</span>
            </button>
            <button
              onClick={() => setIsComplimentaryModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Ticket className="w-5 h-5" />
              <span>Complimentary</span>
            </button>
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Tag className="w-5 h-5" />
              <span>Discounts</span>
            </button>
            <button
              onClick={() => setIsTicketTypeModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ticket Types</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sales'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => setActiveTab('purchasers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'purchasers'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Purchasers
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TicketStatsCard
                title="Total Tickets Sold"
                value={getTotalSold()}
                icon={Ticket}
                color="purple"
              />
              <TicketStatsCard
                title="Total Revenue"
                value={formatCurrency(getTotalRevenue())}
                icon={CreditCard}
                color="green"
              />
              <TicketStatsCard
                title="Capacity Filled"
                value={`${Math.round(getCapacityPercentage())}%`}
                icon={Users}
                color="blue"
              />
              <TicketStatsCard
                title="Days Until Event"
                value={Math.ceil((new Date(event.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                icon={Calendar}
                color="orange"
              />
            </div>

            {/* Ticket Types */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Ticket Types</h2>
                <button
                  onClick={() => setIsTicketTypeModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  Manage
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Available</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {ticketTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-white font-medium">{type.name}</div>
                            <div className="text-gray-400 text-sm">{type.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {formatCurrency(type.price_gbp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {type.sold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-white mr-2">{type.available}</span>
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full"
                                style={{ width: `${(type.sold / (type.capacity || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {formatCurrency(type.sold * type.price_gbp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Sales</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">Last 7 days</span>
                  <BarChart className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <div className="h-64 flex items-end space-x-2">
                {ticketSales.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-teal-600 rounded-t-lg"
                      style={{ height: `${(day.count / 20) * 100}%` }}
                    />
                    <div className="text-gray-400 text-xs mt-2">
                      {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-white text-xs font-medium">
                      {day.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by ticket type..."
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
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>
              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Tag className="w-5 h-5" />
                <span>Manage Discounts</span>
              </button>
            </div>

            {/* Sales Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Discount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[...Array(10)].map((_, index) => {
                      const ticketType = ticketTypes[index % ticketTypes.length];
                      const quantity = Math.floor(Math.random() * 3) + 1;
                      const hasDiscount = index % 3 === 0;
                      const discountAmount = hasDiscount ? ticketType.price_gbp * quantity * 0.1 : 0;
                      const total = (ticketType.price_gbp * quantity) - discountAmount;
                      
                      return (
                        <tr key={index} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {formatDate(new Date(2024, 0, 15 - index).toISOString())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {ticketType.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {formatCurrency(ticketType.price_gbp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasDiscount ? (
                              <span className="text-green-400">{formatCurrency(discountAmount)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {formatCurrency(total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Sales Report</span>
              </button>
            </div>
          </div>
        )}

        {/* Purchasers Tab */}
        {activeTab === 'purchasers' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={() => setIsComplimentaryModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Ticket className="w-5 h-5" />
                <span>Issue Complimentary</span>
              </button>
            </div>

            {/* Purchasers Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Purchase Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {purchasers.map((purchaser) => (
                      <tr key={purchaser.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {purchaser.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {purchaser.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {purchaser.ticketType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {purchaser.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(purchaser.purchaseDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {formatCurrency(purchaser.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                            {purchaser.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Customer List</span>
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <TicketTypeModal
          eventId={event.id}
          eventName={event.name}
          eventStartDate={event.startDate}
          eventEndDate={event.endDate}
          isOpen={isTicketTypeModalOpen}
          onClose={() => setIsTicketTypeModalOpen(false)}
          onSave={handleSaveTicketTypes}
          initialTicketTypes={ticketTypes}
        />

        <TicketDiscountModal
          eventId={event.id}
          eventName={event.name}
          isOpen={isDiscountModalOpen}
          onClose={() => setIsDiscountModalOpen(false)}
          onSave={handleSaveDiscounts}
        />

        <ComplimentaryTicketModal
          eventId={event.id}
          eventName={event.name}
          ticketTypes={ticketTypes.map(t => ({ id: t.id, name: t.name }))}
          isOpen={isComplimentaryModalOpen}
          onClose={() => setIsComplimentaryModalOpen(false)}
          onSave={handleIssueComplimentary}
        />

        <TicketScannerModal
          eventId={event.id}
          eventName={event.name}
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          onScanComplete={handleScanComplete}
        />
      </div>
    </div>
  );
}