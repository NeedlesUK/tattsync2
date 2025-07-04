import React from 'react';
import { User, Award, Eye, Edit, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';

interface EntryCardProps {
  entry: {
    id: number;
    title: string;
    description?: string;
    artist_name: string;
    entry_type: string;
    entry_number?: string;
    image_url?: string;
    categories: string[];
    is_disqualified?: boolean;
    average_score?: number;
    has_been_judged?: boolean;
    placement?: number;
  };
  onView: (entryId: number) => void;
  onEdit?: (entryId: number) => void;
  onDelete?: (entryId: number) => void;
  onJudge?: (entryId: number) => void;
  isJudgeView?: boolean;
}

export function EntryCard({ 
  entry, 
  onView, 
  onEdit, 
  onDelete, 
  onJudge,
  isJudgeView = false 
}: EntryCardProps) {
  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'tattoo':
        return 'bg-purple-500/20 text-purple-400';
      case 'piercing':
        return 'bg-teal-500/20 text-teal-400';
      case 'performance':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getPlacementBadge = (placement?: number) => {
    if (!placement) return null;
    
    const badges = {
      1: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: '1st Place' },
      2: { color: 'bg-gray-400/20 text-gray-400 border-gray-400/30', text: '2nd Place' },
      3: { color: 'bg-amber-600/20 text-amber-600 border-amber-600/30', text: '3rd Place' }
    };
    
    const badge = badges[placement as keyof typeof badges];
    if (!badge) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {placement}th Place
        </span>
      );
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color} border`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all">
      {/* Entry Image */}
      {entry.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={entry.image_url}
            alt={entry.title}
            className="w-full h-full object-cover"
          />
          {entry.entry_number && (
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              #{entry.entry_number}
            </div>
          )}
          {entry.is_disqualified && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-red-500/80 text-white px-4 py-2 rounded-lg font-bold">
                DISQUALIFIED
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEntryTypeColor(entry.entry_type)}`}>
                {entry.entry_type}
              </span>
              {getPlacementBadge(entry.placement)}
              {isJudgeView && (
                entry.has_been_judged ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Judged</span>
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Needs Judging</span>
                  </span>
                )
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">{entry.title}</h3>
            <p className="text-gray-300 text-sm">By {entry.artist_name}</p>
          </div>
          
          {entry.average_score !== undefined && !isJudgeView && (
            <div className="bg-purple-500/20 px-3 py-2 rounded-lg">
              <span className="text-purple-400 font-bold text-lg">{entry.average_score.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {entry.description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{entry.description}</p>
        )}
        
        {entry.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {entry.categories.map((category, index) => (
              <span key={index} className="bg-white/10 text-gray-300 px-2 py-1 rounded-full text-xs">
                {category}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={() => onView(entry.id)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          
          {onJudge && isJudgeView && !entry.is_disqualified && (
            <button
              onClick={() => onJudge(entry.id)}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Star className="w-4 h-4" />
              <span>{entry.has_been_judged ? 'Edit Scores' : 'Judge'}</span>
            </button>
          )}
          
          {onEdit && !isJudgeView && (
            <button
              onClick={() => onEdit(entry.id)}
              className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {onDelete && !isJudgeView && (
            <button
              onClick={() => onDelete(entry.id)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}