import React, { useState } from 'react';
import { Gift, Plus, Eye, Edit, Trash2, Copy, Calendar, Users, Percent } from 'lucide-react';

export function DealsPage() {
  const [activeTab, setActiveTab] = useState('active');

  const deals = [
    {
      id: 1,
      title: 'Early Bird Special',
      description: '20% off registration for first 50 artists',
      discount: 20,
      type: 'percentage',
      code: 'EARLY2024',
      validUntil: '2024-02-28',
      used: 23,
      limit: 50,
      status: 'active'
    },
    {
      id: 2,
      title: 'Student Discount',
      description: '$50 off booth rental for students',
      discount: 50,
      type: 'fixed',
      code: 'STUDENT50',
      validUntil: '2024-03-15',
      used: 12,
      limit: 100,
      status: 'active'
    },
    {
      id: 3,
      title: 'Group Registration',
      description: '15% off for groups of 5 or more',
      discount: 15,
      type: 'percentage',
      code: 'GROUP15',
      validUntil: '2024-03-01',
      used: 8,
      limit: 25,
      status: 'expired'
    },
    {
      id: 4,
      title: 'Returning Artist',
      description: '10% off for previous participants',
      discount: 10,
      type: 'percentage',
      code: 'RETURN10',
      validUntil: '2024-04-01',
      used: 0,
      limit: 200,
      status: 'draft'
    }
  ];

  const filteredDeals = deals.filter(deal => {
    if (activeTab === 'active') return deal.status === 'active';
    if (activeTab === 'expired') return deal.status === 'expired';
    if (activeTab === 'draft') return deal.status === 'draft';
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return (used / limit) * 100;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Deals & Offers</h1>
            <p className="text-gray-300">Manage promotional codes and special offers</p>
          </div>
          <button className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Deal</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Deals</p>
                <p className="text-2xl font-bold text-white">{deals.filter(d => d.status === 'active').length}</p>
              </div>
              <Gift className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Usage</p>
                <p className="text-2xl font-bold text-white">{deals.reduce((sum, deal) => sum + deal.used, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Discount</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(deals.reduce((sum, deal) => sum + deal.discount, 0) / deals.length)}%
                </p>
              </div>
              <Percent className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Expiring Soon</p>
                <p className="text-2xl font-bold text-white">
                  {deals.filter(d => new Date(d.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {['active', 'draft', 'expired'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab} ({deals.filter(d => d.status === tab).length})
            </button>
          ))}
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div key={deal.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{deal.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{deal.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  deal.status === 'active' 
                    ? 'bg-green-500/20 text-green-400'
                    : deal.status === 'expired'
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {deal.status}
                </span>
              </div>

              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Promo Code</span>
                  <button
                    onClick={() => copyToClipboard(deal.code)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-900 rounded px-3 py-2 font-mono text-purple-400 text-center">
                  {deal.code}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-white font-medium">
                    {deal.type === 'percentage' ? `${deal.discount}%` : `$${deal.discount}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valid Until</span>
                  <span className="text-white">{formatDate(deal.validUntil)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Usage</span>
                  <span className="text-white">{deal.used} / {deal.limit}</span>
                </div>
                
                {/* Usage Progress */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${getUsagePercentage(deal.used, deal.limit)}%` }}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No deals found</h3>
            <p className="text-gray-400">Create your first promotional offer to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}