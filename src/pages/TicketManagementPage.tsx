import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Ticket, 
  Users, 
  TrendingUp, 
  Calendar, 
  Settings,
  QrCode,
  Gift,
  Percent,
  Download,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { TicketStatsCard } from '../components/tickets/TicketStatsCard';
import { TicketScannerModal } from '../components/tickets/TicketScannerModal';
import { TicketDiscountModal } from '../components/tickets/TicketDiscountModal';
import { ComplimentaryTicketModal } from '../components/tickets/ComplimentaryTicketModal';

interface Event {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface TicketType {
  id: number;
  name: string;
  price_gbp: number;
  capacity: number | null;
  sold: number;
}

interface TicketPurchaser {
  id: number;
  client_name: string;
  client_email: string;
  ticket_type: string;
  purchase_date: string;
  price_gbp: number;
  status: string;
}

export function TicketManagementPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [purchasers, setPurchasers] = useState<TicketPurchaser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isComplimentaryModalOpen, setIsComplimentaryModalOpen] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      fetchTicketTypes();
      fetchPurchasers();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    // Mock data - replace with actual API call
    setEvent({
      id: parseInt(eventId || '0'),
      name: 'London Tattoo Convention 2024',
      start_date: '2024-09-15',
      end_date: '2024-09-17',
      location: 'ExCeL London'
    });
  };

  const fetchTicketTypes = async () => {
    // Mock data - replace with actual API call
    setTicketTypes([
      { id: 1, name: 'Day Pass - Saturday', price_gbp: 25.00, capacity: 500, sold: 342 },
      { id: 2, name: 'Day Pass - Sunday', price_gbp: 25.00, capacity: 500, sold: 298 },
      { id: 3, name: 'Weekend Pass', price_gbp: 45.00, capacity: 300, sold: 156 },
      { id: 4, name: 'VIP Weekend Pass', price_gbp: 85.00, capacity: 50, sold: 23 }
    ]);
  };

  const fetchPurchasers = async () => {
    // Mock data - replace with actual API call
    setPurchasers([
      {
        id: 1,
        client_name: 'Sarah Johnson',
        client_email: 'sarah.j@email.com',
        ticket_type: 'Weekend Pass',
        purchase_date: '2024-08-15T10:30:00Z',
        price_gbp: 45.00,
        status: 'active'
      },
      {
        id: 2,
        client_name: 'Mike Chen',
        client_email: 'mike.chen@email.com',
        ticket_type: 'Day Pass - Saturday',
        purchase_date: '2024-08-20T14:15:00Z',
        price_gbp: 25.00,
        status: 'active'
      },
      {
        id: 3,
        client_name: 'Emma Wilson',
        client_email: 'emma.w@email.com',
        ticket_type: 'VIP Weekend Pass',
        purchase_date: '2024-08-25T09:45:00Z',
        price_gbp: 85.00,
        status: 'active'
      }
    ]);
    setLoading(false);
  };

  const handleScanComplete = (ticketData: any) => {
    console.log('Ticket scanned:', ticketData);
    // Handle ticket scan result
  };

  const handleSaveDiscounts = (discounts: any) => {
    console.log('Discounts saved:', discounts);
    // Handle discount save
  };

  const handleIssueComplimentary = (ticketData: any) => {
    console.log('Complimentary ticket issued:', ticketData);
    // Handle complimentary ticket issuance
  };

  const totalSold = ticketTypes.reduce((sum, type) => sum + type.sold, 0);
  const totalCapacity = ticketTypes.reduce((sum, type) => sum + (type.capacity || 0), 0);
  const totalRevenue = purchasers.reduce((sum, purchase) => sum + purchase.price_gbp, 0);

  const filteredPurchasers = purchasers.filter(purchaser => {
    const matchesSearch = purchaser.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchaser.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || purchaser.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Ticket Management</h1>
            <p className="text-gray-300">{event?.name}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan Tickets</span>
            </button>
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Percent className="w-5 h-5" />
              <span>Manage Discounts</span>
            </button>
            <button
              onClick={() => setIsComplimentaryModalOpen(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Gift className="w-5 h-5" />
              <span>Issue Complimentary</span>
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TicketStatsCard
                title="Total Sold"
                value={totalSold.toString()}
                icon={<Ticket className="w-6 h-6" />}
                trend="+12%"
                trendUp={true}
              />
              <TicketStatsCard
                title="Total Revenue"
                value={`£${totalRevenue.toFixed(2)}`}
                icon={<TrendingUp className="w-6 h-6" />}
                trend="+8%"
                trendUp={true}
              />
              <TicketStatsCard
                title="Capacity Used"
                value={`${Math.round((totalSold / totalCapacity) * 100)}%`}
                icon={<Users className="w-6 h-6" />}
                trend="+5%"
                trendUp={true}
              />
              <TicketStatsCard
                title="Days to Event"
                value="23"
                icon={<Calendar className="w-6 h-6" />}
                trend=""
                trendUp={true}
              />
            </div>

            {/* Ticket Types */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Ticket Types</h2>
                <button className="flex items-center space-x-2 text-purple-300 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Manage in Settings</span>
                </button>
              </div>
              <div className="space-y-4">
                {ticketTypes.map((type) => (
                  <div key={type.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{type.name}</h3>
                        <p className="text-gray-300">£{type.price_gbp.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {type.sold} / {type.capacity || '∞'} sold
                        </p>
                        <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: type.capacity 
                                ? `${Math.min((type.sold / type.capacity) * 100, 100)}%`
                                : '0%'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Sales Analytics</h2>
            <div className="text-gray-300">
              <p>Sales analytics and charts will be displayed here.</p>
              <p className="mt-2">This section can include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Daily/weekly sales trends</li>
                <li>Revenue breakdown by ticket type</li>
                <li>Peak sales periods</li>
                <li>Conversion rates</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'purchasers' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Ticket Purchasers</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search purchasers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Ticket Type</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Purchase Date</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Price</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchasers.map((purchaser) => (
                    <tr key={purchaser.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{purchaser.client_name}</td>
                      <td className="py-3 px-4 text-gray-300">{purchaser.client_email}</td>
                      <td className="py-3 px-4 text-gray-300">{purchaser.ticket_type}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(purchaser.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-white">£{purchaser.price_gbp.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchaser.status === 'active' 
                            ? 'bg-green-500/20 text-green-300'
                            : purchaser.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {purchaser.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPurchasers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No purchasers found matching your criteria.
              </div>
            )}
          </div>
        )}

        <TicketScannerModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          onScanComplete={handleScanComplete}
        />

        <TicketDiscountModal
          eventId={eventId || 0}
          eventName={event?.name || ''}
          isOpen={isDiscountModalOpen}
          onClose={() => setIsDiscountModalOpen(false)}
          onSave={handleSaveDiscounts}
        />

        <ComplimentaryTicketModal
          eventId={eventId || 0}
          eventName={event?.name || ''}
          ticketTypes={ticketTypes.map(t => ({ id: t.id, name: t.name }))}
          isOpen={isComplimentaryModalOpen}
          onClose={() => setIsComplimentaryModalOpen(false)}
          onSave={handleIssueComplimentary}
        />
      </div>
    </div>
  );
}