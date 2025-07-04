import React from 'react';
import { Trophy, Medal, Award, Download, Eye } from 'lucide-react';

interface Result {
  placement: number;
  entry_id: number;
  entry_title: string;
  artist_name: string;
  entry_type: string;
  total_score: number;
  category_name?: string;
}

interface ResultsTableProps {
  results: Result[];
  onViewEntry: (entryId: number) => void;
  onExportResults?: () => void;
  isCategoryResults?: boolean;
}

export function ResultsTable({ 
  results, 
  onViewEntry, 
  onExportResults,
  isCategoryResults = false
}: ResultsTableProps) {
  const getPlacementIcon = (placement: number) => {
    switch (placement) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-purple-400" />;
    }
  };

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

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">
          {isCategoryResults ? 'Category Results' : 'Overall Results'}
        </h2>
        {onExportResults && (
          <button
            onClick={onExportResults}
            className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Placement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
              {isCategoryResults && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {results.map((result) => (
              <tr key={`${result.entry_id}-${result.placement}`} className="hover:bg-white/5">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getPlacementIcon(result.placement)}
                    <span className="text-white font-medium">{result.placement}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {result.entry_title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {result.artist_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEntryTypeColor(result.entry_type)}`}>
                    {result.entry_type}
                  </span>
                </td>
                {isCategoryResults && (
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {result.category_name}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-purple-400 font-bold">{result.total_score.toFixed(1)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewEntry(result.entry_id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {results.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No results yet</h3>
          <p className="text-gray-400">
            Results will appear here once judging is complete
          </p>
        </div>
      )}
    </div>
  );
}