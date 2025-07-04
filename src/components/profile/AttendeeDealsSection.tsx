import React, { useState } from 'react';
import { Gift, Percent, DollarSign, Calendar, Copy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface Deal {
  id: number;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'special';
  discount_value: number | null;
  discount_code: string;
  provider: string;
  provider_logo_url: string | null;
  valid_from: string;
  valid_until: string | null;
  is_global: boolean;
}

interface AttendeeDealsProps {
  deals: Deal[];
}

export function AttendeeDealsSection({ deals }: AttendeeDealsProps) {
  const [expandedDealId, setExpandedDealId] = useState<number | null>(null);

  const toggleDeal = (id: number) => {
    setExpandedDealId(expandedDealId === id ? null : id);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed': return DollarSign;
      default: return Gift;
    }
  };

  const formatDiscountValue = (deal: Deal) => {
    if (deal.discount_type === 'percentage' && deal.discount_value) {
      return `${deal.discount_value}% off`;
    } else if (deal.discount_type === 'fixed' && deal.discount_value) {
      return `£${deal.discount_value.toFixed(2)} off`;
    } else {
      return 'Special Offer';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (deals.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Gift className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Deals & Offers</h2>
        </div>
        <div className="text-center py-8">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">No deals or offers available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Gift className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Deals & Offers</h2>
        </div>
        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
          {deals.length} Available
        </span>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => {
          const DiscountIcon = getDiscountTypeIcon(deal.discount_type);
          const isExpanded = expandedDealId === deal.id;
          
          return (
            <div 
              key={deal.id} 
              className="border border-white/10 rounded-lg overflow-hidden transition-all"
            >
              <div 
                className="p-4 bg-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => toggleDeal(deal.id)}
              >
                <div className="flex items-center space-x-3">
                  {deal.provider_logo_url ? (
                    <img 
                      src={deal.provider_logo_url} 
                      alt={deal.provider} 
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-500/20 rounded flex items-center justify-center">
                      <DiscountIcon className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-medium">{deal.title}</h3>
                    <p className="text-gray-400 text-sm">{deal.provider}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm hidden sm:inline-block">
                    {formatDiscountValue(deal)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <p className="text-gray-300 mb-4">{deal.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {deal.valid_until ? `Expires: ${formatDate(deal.valid_until)}` : 'No expiration date'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <DiscountIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{formatDiscountValue(deal)}</span>
                    </div>
                  </div>
                  
                  {deal.discount_code && (
                    <div className="bg-white/5 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-sm">Discount Code</span>
                        <button
                          onClick={() => copyToClipboard(deal.discount_code)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-gray-900 rounded px-3 py-2 font-mono text-purple-400 text-center">
                        {deal.discount_code}
                      </div>
                    </div>
                  )}
                  
                  {deal.is_global && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-blue-300 text-sm">
                      This is a platform-wide offer available to all TattSync users.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}