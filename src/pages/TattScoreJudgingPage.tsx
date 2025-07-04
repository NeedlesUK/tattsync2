import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Award, Trophy, User, Eye, Download, AlertCircle, CheckCircle, XCircle, FileText, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function TattScoreJudgingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterJudged, setFilterJudged] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [judgeData, setJudgeData] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [isJudgingFormOpen, setIsJudgingFormOpen] = useState(false);
  const [isContender, setIsContender] = useState<boolean | null>(null);
  const [scoringAreas] = useState<any[]>([
    {
      key: 'placement',
      label: 'Placement / Flow',
      range: [-20, 15],
      description: 'Scoring Guide: -20 = Extremely poor, 0 = Slightly off, 15 = Excellent.'
    },
    {
      key: 'technique',
      label: 'Technical Application',
      range: [-20, 15],
      description: 'Scoring Guide: -20 = Major issues, 0 = Noticeable flaws, 5 = Inconsistent, 10 = Mostly clean; minor flaws, 15 = Lawless.'
    },
    {
      key: 'qualityScore',
      label: 'Realism / Design Quality',
      range: [0, 30],
      description: 'Realism: 0 = Unrecognisable, 5 = Some clarity, but flat, inconsistent, unrealistic, 15 = Clear subject good depth, minor flaws, 30 = Flawless realism with lifelike shading and depth. Design: creativity & originality - 0 = Poor design, no structure or clarity, 5 = Uninspired, lacks originality, 15 = Solid concept, needs refinement, 30 = Exceptional, artistic and imaginative.'
    },
    {
      key: 'blackworkOrColour',
      label: 'Blackwork / Colour & Contrast',
      range: [0, 30],
      description: 'Colour: colour use & / or contrast - 0 = No understanding, muddy / flat, 5 = Weak contrast or very poor use of tone and colour, 15 = Moderate contrast or palette use, 30 = Perfect colour use and / or contrast; Blackwork: linework & consistency; - 0 = Uneven, distorted, lacks intent or structure, 5 = Inconsistent linework or patchy fill, 15 = Clean overall, with minor breaks or alignment issues, 30 = Precise, balanced, and extremely well saturated. Flawless.'
    },
    {
      key: 'readability',
      label: 'Readability',
      range: [-10, 30],
      description: '-10 = unreadable, 5 = difficult to read, 15 = mostly readable, 30 = perfect clarity.'
    },
    {
      key: 'creativity',
      label: 'Creativity',
      range: [0, 30],
      description: '0 = generic, 5 = minimal variation, 15 = some creativity, 30 = exceptional & unique.'
    },
    {
      key: 'difficulty',
      label: 'Technical Difficulty',
      range: [0, 30],
      description: '0 = basic, 5 = mild challenge, 15 = above average, 30 = very difficult.'
    },
    {
      key: 'styleAccuracy',
      label: 'Style / Category Accuracy',
      range: [-50, 0],
      description: '0 = perfect representation, -50 = does not represent style or category.'
    },
    {
      key: 'judgesScore',
      label: "Judge's Overall Opinion",
      range: [0, 100],
      description: '0 = awful, 60+ = potential winner, 100 = WOW!'
    }
  ]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user has appropriate role to access this page
  const hasAccess = user?.role === 'judge' || user?.role === 'event_manager' || user?.role === 'event_admin';

  useEffect(() => {
    // If user is admin, redirect them away from this page
    if (user?.role === 'admin') {
      navigate('/tattscore/admin');
      return;
    }
    
    // Only fetch data if user has appropriate access
    if (hasAccess) {
      fetchJudgeData();
      fetchEntries();
      fetchResults();
    } else {
      setIsLoading(false);
    }
  }, [user, navigate, hasAccess]);

  useEffect(() => {
    let filtered = entries;
    
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.entry_number && entry.entry_number.includes(searchTerm))
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.entry_type === filterType);
    }
    
    if (filterJudged !== 'all') {
      filtered = filtered.filter(entry => 
        (filterJudged === 'judged' && entry.has_been_judged) ||
        (filterJudged === 'not_judged' && !entry.has_been_judged)
      );
    }
    
    setFilteredEntries(filtered);
  }, [searchTerm, filterType, filterJudged, entries]);

  const fetchJudgeData = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, fetch from API
      // Mock data for now
      const mockJudgeData = {
        id: 1,
        user_id: user?.id,
        event_id: 1,
        event_name: 'Ink Fest 2024',
        is_active: true,
        entries_judged: 5,
        total_entries: 15
      };
      
      setJudgeData(mockJudgeData);
    } catch (error) {
      console.error('Error fetching judge data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      // In a real implementation, fetch from API
      // Mock data for now
      const mockEntries = [
        {
          id: 1,
          title: 'Dragon Sleeve',
          description: 'Traditional Japanese dragon sleeve design',
          artist_name: 'Sarah Johnson',
          entry_type: 'tattoo',
          entry_number: '001',
          image_url: 'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=400',
          categories: ['Large Color', 'Japanese'],
          has_been_judged: true,
          average_score: 8.5
        },
        {
          id: 2,
          title: 'Geometric Back Piece',
          description: 'Modern geometric design covering full back',
          artist_name: 'Mike Chen',
          entry_type: 'tattoo',
          entry_number: '002',
          image_url: 'https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg?auto=compress&cs=tinysrgb&w=400',
          categories: ['Large Black & Grey', 'Geometric'],
          has_been_judged: false
        },
        {
          id: 3,
          title: 'Neo-Traditional Portrait',
          description: 'Vibrant neo-traditional portrait with bold lines',
          artist_name: 'Emma Davis',
          entry_type: 'tattoo',
          entry_number: '003',
          image_url: 'https://images.pexels.com/photos/1435612/pexels-photo-1435612.jpeg?auto=compress&cs=tinysrgb&w=400',
          categories: ['Medium Color', 'Neo-Traditional'],
          has_been_judged: true,
          average_score: 7.8
        }
      ];
      
      setEntries(mockEntries);
      setFilteredEntries(mockEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const fetchResults = async () => {
    try {
      // In a real implementation, fetch from API
      // Mock data for now
      const mockResults = [
        {
          placement: 1,
          entry_id: 1,
          entry_title: 'Dragon Sleeve',
          artist_name: 'Sarah Johnson',
          entry_type: 'tattoo',
          total_score: 9.2
        },
        {
          placement: 2,
          entry_id: 3,
          entry_title: 'Neo-Traditional Portrait',
          artist_name: 'Emma Davis',
          entry_type: 'tattoo',
          total_score: 8.7
        },
        {
          placement: 3,
          entry_id: 2,
          entry_title: 'Geometric Back Piece',
          artist_name: 'Mike Chen',
          entry_type: 'tattoo',
          total_score: 8.1
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleJudgeEntry = (entryId: number) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setCurrentEntry(entry);
      resetJudgingForm();
      setIsJudgingFormOpen(true);
    }
  };

  const resetJudgingForm = () => {
    setIsContender(null);
    setScores({});
    setFeedback('');
    setCurrentStep(0);
    setErrors({});
  };

  const handleContenderChange = (value: boolean) => {
    setIsContender(value);
    
    // If not a contender, set all scores to 0 and skip to feedback
    if (!value) {
      const zeroScores: Record<string, number> = {};
      scoringAreas.forEach(area => {
        zeroScores[area.key] = 0;
      });
      setScores(zeroScores);
      setCurrentStep(scoringAreas.length + 1); // Skip to feedback step
    } else {
      // If it is a contender, initialize scores with middle values
      const initialScores: Record<string, number> = {};
      scoringAreas.forEach(area => {
        const [min, max] = area.range;
        initialScores[area.key] = min === 0 ? max : Math.round((min + max) / 2);
      });
      setScores(initialScores);
      setCurrentStep(1); // Go to first scoring area
    }
  };

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 0) {
      if (isContender === null) {
        newErrors.contender = 'Please select whether this entry is a contender';
      }
    } else if (currentStep <= scoringAreas.length) {
      const area = scoringAreas[currentStep - 1];
      if (scores[area.key] === undefined) {
        newErrors[area.key] = `Please provide a score for ${area.label}`;
      } else {
        const [min, max] = area.range;
        if (scores[area.key] < min || scores[area.key] > max) {
          newErrors[area.key] = `Score must be between ${min} and ${max}`;
        }
      }
    } else if (currentStep === scoringAreas.length + 1) {
      // Feedback step
      if (!isContender && !feedback.trim()) {
        newErrors.feedback = 'Feedback is required for non-contender entries';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < scoringAreas.length + 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitJudging = async () => {
    if (!validateCurrentStep()) return;
    
    try {
      // In a real implementation, submit to API
      console.log('Submitting judging for entry:', currentEntry?.entry_number);
      console.log('Scores:', scores);
      console.log('Feedback:', feedback);
      console.log('Is Contender:', isContender);
      
      // Update entry status
      const updatedEntries = entries.map(entry => 
        entry.id === currentEntry?.id ? { ...entry, has_been_judged: true } : entry
      );
      setEntries(updatedEntries);
      
      // Close form and reset
      setIsJudgingFormOpen(false);
      resetJudgingForm();
      
      // Show success message
      alert('Judging submitted successfully!');
    } catch (error) {
      console.error('Error submitting judging:', error);
    }
  };

  const handleExportResults = () => {
    // In a real implementation, generate and download CSV/PDF
    console.log('Exporting results');
    alert('Results exported successfully!');
  };

  // If user doesn't have access, show access denied message
  if (!hasAccess) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
            <p className="text-gray-300 mb-6">
              You don't have permission to access the TattScore judging system. 
              This area is only available to judges, event managers, and event admins.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-white mb-2">TattScore Judging</h1>
            <p className="text-gray-300">
              {judgeData?.event_name} - Judge Panel
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-gray-400 text-sm">Entries Judged</p>
                <p className="text-2xl font-bold text-white">{judgeData?.entries_judged}/{judgeData?.total_entries}</p>
              </div>
              <div className="h-12 w-0.5 bg-white/10"></div>
              <div>
                <p className="text-gray-400 text-sm">Completion</p>
                <p className="text-2xl font-bold text-purple-400">
                  {Math.round((judgeData?.entries_judged / judgeData?.total_entries) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'entries'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Entries to Judge
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'results'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Results
          </button>
        </div>

        {/* Entries Tab */}
        {activeTab === 'entries' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by entry number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex space-x-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="all">All Types</option>
                    <option value="tattoo">Tattoo</option>
                    <option value="piercing">Piercing</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterJudged}
                    onChange={(e) => setFilterJudged(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="all">All Entries</option>
                    <option value="not_judged">Needs Judging</option>
                    <option value="judged">Already Judged</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all">
                  <div className="relative h-48 overflow-hidden">
                    {entry.image_url && (
                      <img
                        src={entry.image_url}
                        alt={entry.title || `Entry #${entry.entry_number}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {entry.entry_number && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        #{entry.entry_number}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            entry.entry_type === 'tattoo'
                              ? 'bg-purple-500/20 text-purple-400'
                              : entry.entry_type === 'piercing'
                              ? 'bg-teal-500/20 text-teal-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {entry.entry_type}
                          </span>
                          {entry.has_been_judged ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Judged</span>
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>Needs Judging</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-1">Entry #{entry.entry_number}</h3>
                        <p className="text-gray-300 text-sm">Category: {entry.categories.join(', ')}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleJudgeEntry(entry.id)}
                      className={`w-full ${
                        entry.has_been_judged
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1`}
                    >
                      <Star className="w-4 h-4" />
                      <span>{entry.has_been_judged ? 'Edit Scores' : 'Judge Entry'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No entries found</h3>
                <p className="text-gray-400">
                  {searchTerm || filterType !== 'all' || filterJudged !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No entries have been submitted yet'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  Competition Results
                </h2>
                <button
                  onClick={handleExportResults}
                  className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Placement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {results.map((result) => {
                      const getPlacementIcon = (placement: number) => {
                        switch (placement) {
                          case 1:
                            return <Trophy className="w-5 h-5 text-yellow-400" />;
                          case 2:
                            return <Award className="w-5 h-5 text-gray-400" />;
                          case 3:
                            return <Award className="w-5 h-5 text-amber-600" />;
                          default:
                            return <Award className="w-5 h-5 text-purple-400" />;
                        }
                      };
                      
                      return (
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              result.entry_type === 'tattoo'
                                ? 'bg-purple-500/20 text-purple-400'
                                : result.entry_type === 'piercing'
                                ? 'bg-teal-500/20 text-teal-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {result.entry_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-purple-400 font-bold">{result.total_score.toFixed(1)}</span>
                          </td>
                        </tr>
                      );
                    })}
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
          </div>
        )}

        {/* Judging Form Modal */}
        {isJudgingFormOpen && currentEntry && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Judge Entry #{currentEntry.entry_number}</h2>
                  <button
                    onClick={() => setIsJudgingFormOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Progress Steps */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    {Array.from({ length: scoringAreas.length + 2 }, (_, i) => i).map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step <= currentStep 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-white/10 text-gray-400'
                        }`}>
                          {step + 1}
                        </div>
                        {step < scoringAreas.length + 1 && (
                          <div className={`w-full h-1 mx-2 ${
                            step < currentStep ? 'bg-purple-600' : 'bg-white/10'
                          }`} style={{ width: '20px' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Step 1: Contender Selection */}
                {currentStep === 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Is this a contender for an award?</h3>
                    <p className="text-gray-300 mb-6">
                      If this entry is not a contender, all scores will be set to 0 and you'll be asked to provide feedback.
                    </p>
                    
                    <div className="flex justify-center space-x-6 mb-6">
                      <button
                        onClick={() => handleContenderChange(true)}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          isContender === true
                            ? 'bg-green-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        Yes, it's a contender
                      </button>
                      <button
                        onClick={() => handleContenderChange(false)}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          isContender === false
                            ? 'bg-red-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        No, not a contender
                      </button>
                    </div>
                    
                    {errors.contender && (
                      <p className="text-red-400 text-sm text-center">{errors.contender}</p>
                    )}
                  </div>
                )}
                
                {/* Scoring Steps */}
                {currentStep > 0 && currentStep <= scoringAreas.length && (
                  <div>
                    {(() => {
                      const area = scoringAreas[currentStep - 1];
                      const [min, max] = area.range;
                      return (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{area.label}</h3>
                          <p className="text-gray-300 mb-4">{area.description}</p>
                          
                          <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                              <span>{min}</span>
                              <span>{max}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <input
                                type="range"
                                min={min}
                                max={max}
                                value={scores[area.key] || min}
                                onChange={(e) => handleScoreChange(area.key, parseInt(e.target.value))}
                                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
                              />
                              <input
                                type="number"
                                min={min}
                                max={max}
                                value={scores[area.key] || min}
                                onChange={(e) => handleScoreChange(area.key, parseInt(e.target.value))}
                                className="w-16 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-center"
                              />
                            </div>
                          </div>
                          
                          {errors[area.key] && (
                            <p className="text-red-400 text-sm">{errors[area.key]}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {/* Feedback Step */}
                {currentStep === scoringAreas.length + 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Feedback for Artist</h3>
                    <p className="text-gray-300 mb-4">
                      {isContender 
                        ? 'Provide optional feedback for the artist.'
                        : 'Since this is not a contender, please provide feedback explaining why.'}
                    </p>
                    
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={6}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.feedback ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Enter your feedback here..."
                    />
                    
                    {errors.feedback && (
                      <p className="text-red-400 text-sm mt-2">{errors.feedback}</p>
                    )}
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0 || (!isContender && currentStep === scoringAreas.length + 1)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {currentStep < scoringAreas.length + 1 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitJudging}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Submit Judging
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}