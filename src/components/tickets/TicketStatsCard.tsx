import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface TicketStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'purple' | 'teal' | 'orange' | 'blue' | 'green' | 'red';
  change?: string;
}

export function TicketStatsCard({ title, value, icon: Icon, color, change }: TicketStatsCardProps) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    teal: 'from-teal-500 to-teal-600',
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && <p className="text-sm text-gray-300 mt-1">{change}</p>}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}