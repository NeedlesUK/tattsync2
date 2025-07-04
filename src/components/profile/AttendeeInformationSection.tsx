import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface InformationItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface AttendeeInformationProps {
  informationItems: InformationItem[];
}

export function AttendeeInformationSection({ informationItems }: AttendeeInformationProps) {
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (informationItems.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Event Information</h2>
        </div>
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">No information available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Info className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Event Information</h2>
      </div>

      <div className="space-y-4">
        {informationItems.map((item) => {
          const isExpanded = expandedItemId === item.id;
          
          return (
            <div 
              key={item.id} 
              className="border border-white/10 rounded-lg overflow-hidden transition-all"
            >
              <div 
                className="p-4 bg-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-medium">{item.title}</h3>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 whitespace-pre-line">
                      {item.content}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-right">
                    <span className="text-gray-400 text-xs">
                      Last updated: {formatDate(item.updated_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}