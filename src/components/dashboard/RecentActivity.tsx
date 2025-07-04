import React from 'react';
import { Clock, User, Calendar, CreditCard } from 'lucide-react';

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'application',
      title: 'New artist application received',
      description: 'Sarah Johnson applied for Ink Fest 2024',
      time: '2 hours ago',
      icon: User,
      color: 'purple'
    },
    {
      id: 2,
      type: 'event',
      title: 'Event published',
      description: 'Body Art Expo 2024 is now live',
      time: '4 hours ago',
      icon: Calendar,
      color: 'teal'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment received',
      description: '$350 from Mike Chen for booth rental',
      time: '6 hours ago',
      icon: CreditCard,
      color: 'orange'
    },
    {
      id: 4,
      type: 'application',
      title: 'Application approved',
      description: 'Emma Davis - Piercer application approved',
      time: '1 day ago',
      icon: User,
      color: 'blue'
    }
  ];

  const colorClasses = {
    purple: 'bg-purple-500',
    teal: 'bg-teal-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500'
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 ${colorClasses[activity.color as keyof typeof colorClasses]} rounded-full flex items-center justify-center flex-shrink-0`}>
              <activity.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium">{activity.title}</p>
              <p className="text-gray-300 text-sm">{activity.description}</p>
              <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
        View all activity
      </button>
    </div>
  );
}