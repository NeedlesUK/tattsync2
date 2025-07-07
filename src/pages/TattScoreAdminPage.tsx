import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Award, Trophy, User, Eye, Edit, Trash2, Settings, Calendar, Download, Users, Mail, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EntryCard } from '../components/tattscore/EntryCard';
import { EntryForm } from '../components/tattscore/EntryForm';
import { CategoryModal } from '../components/tattscore/CategoryModal';
import { JudgeInviteModal } from '../components/tattscore/JudgeInviteModal';
import { ResultsTable } from '../components/tattscore/ResultsTable';

export function TattScoreAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'entries' | 'categories' | 'judges' | 'results'>('entries');
  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
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

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  // Check if user is event manager or event admin
  const isEventManager = user?.role === 'event_manager' || user?.role === 'event_admin';
  // Check if user has appropriate access
  const hasAccess = isAdmin || isEventManager;

  useEffect(() => {
    // Only fetch data if user has appropriate access
    if (hasAccess) {
      fetchEventData();
      
      // Only fetch competition data if user is event manager
      if (isEventManager) {
        fetchEntries();
        fetchCategories();
        fetchJudges();
        fetchResults();
      }
    } else {
      setIsLoading(false);
    }
  }, [hasAccess, isEventManager]);

  useEffect(() => {
    let filtered = entries;
    
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.entry_number && entry.entry_number.includes(searchTerm))
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.entry_type === filterType);
    }
    
    setFilteredEntries(filtered);
  }, [searchTerm, filterType, entries]);

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch event data
      setEventData(null);
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      // TODO: Implement API call to fetch entries
      setEntries([]);
      setFilteredEntries([]);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      // TODO: Implement API call to fetch categories
      setCategories([]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchJudges = async () => {
    try {
      // TODO: Implement API call to fetch judges
      setJudges([]);
    } catch (error) {
      console.error('Error fetching judges:', error);
    }
  };

  const fetchResults = async () => {
    try {
      // TODO: Implement API call to fetch results
      setResults([]);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleViewEntry = (entryId: number) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setSelectedEntry(entry);
    }
  };

  const handleEditEntry = (entryId: number) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      setIsEntryFormOpen(true);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }
    
    try {
      // In a real implementation, delete via API
      console.log('Deleting entry:', entryId);
      
      // Update entries list
      setEntries(entries.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleSubmitEntry = async (formData: any) => {
    try {
      // In a real implementation, submit to API
      console.log('Submitting entry:', formData);
      
      if (selectedEntry) {
        // Update existing entry
        const updatedEntries = entries.map(entry => 
          entry.id === selectedEntry.id ? { ...entry, ...formData } : entry
        );
        setEntries(updatedEntries);
      } else {
        // Create new entry
        const newEntry = {
          id: Date.now(),
          ...formData,
          entry_number: `${entries.length + 1}`.padStart(3, '0'),
          has_been_judged: false,
          is_disqualified: false
        };
        setEntries([...entries, newEntry]);
      }
      
      setIsEntryFormOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error submitting entry:', error);
      throw error;
    }
  };

  const handleSaveCategories = async (updatedCategories: any[]) => {
    try {
      // In a real implementation, save to API
      console.log('Saving categories:', updatedCategories);
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  };

  const handleInviteJudge = async (judgeData: any) => {
    try {
      // In a real implementation, submit to API
      console.log('Inviting judge:', judgeData);
      
      // Add new judge to list
      const newJudge = {
        id: Date.now(),
        name: judgeData.name,
        email: judgeData.email,
        entries_judged: 0,
        total_entries: entries.length,
        completion_percentage: 0
      };
      
      setJudges([...judges, newJudge]);
    } catch (error) {
      console.error('Error inviting judge:', error);
      throw error;
    }
  };

  const handleExportResults = () => {
    // In a real implementation, generate and download CSV/PDF
    console.log('Exporting results');
    alert('Results exported successfully!');
  };

  const handlePublishResults = async () => {
    try {
      // In a real implementation, publish via API
      console.log('Publishing results');
      
      // Show success message
      alert('Results published successfully!');
    } catch (error) {
      console.error('Error publishing results:', error);
    }
  };

  // If user doesn't have access, show access denied message
  if (!hasAccess) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
            <p className="text-gray-300 mb-6">
              You don't have permission to access the TattScore admin system. 
              This area is only available to event managers, event admins, and master admins.
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

  // If user is admin, only show the ability to enable TattScore for events
  if (isAdmin) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">TattScore Admin</h1>
            <p className="text-gray-300">
              Manage TattScore competition system for events
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Scoring Areas</h2>
            <p className="text-gray-300 mb-6">
              These scoring areas are used across all TattScore competitions to ensure consistent judging.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Scoring Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {scoringAreas.map((area) => (
                    <tr key={area.key} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {area.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {area.range[0]} to {area.range[1]}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {area.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Events with TattScore</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TattScore Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      Ink Fest 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      Mar 15-17, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                        Enabled
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded text-sm transition-colors">
                        Disable
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      Body Art Expo
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      Apr 10-12, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                        Disabled
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Enable
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      Tattoo Convention
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      May 5-7, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                        Draft
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                        Disabled
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Enable
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
            <h1 className="text-3xl font-bold text-white mb-2">TattScore Admin</h1>
            <p className="text-gray-300">
              {eventData?.name} - Competition Management
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            {activeTab === 'entries' && (
              <button
                onClick={() => {
                  setSelectedEntry(null);
                  setIsEntryFormOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Entry</span>
              </button>
            )}
            
            {activeTab === 'categories' && (
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Manage Categories</span>
              </button>
            )}
            
            {activeTab === 'judges' && (
              <button
                onClick={() => setIsJudgeModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Invite Judge</span>
              </button>
            )}
            
            {activeTab === 'results' && (
              <button
                onClick={handlePublishResults}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Trophy className="w-5 h-5" />
                <span>Publish Results</span>
              </button>
            )}
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
            Entries
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('judges')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'judges'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Judges
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
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
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
            </div>

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onView={handleViewEntry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No entries found</h3>
                <p className="text-gray-400">
                  {searchTerm || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No entries have been submitted yet'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Competition Categories</h2>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Manage Categories</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entries</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Max Entries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {category.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {category.current_entries}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {category.max_entries}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {categories.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No categories defined yet. Click "Manage Categories" to add some.</p>
                </div>
              )}
            </div>
            
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">About Categories</h3>
              <p className="text-blue-200 text-sm">
                Categories define the different types of tattoos that can be entered in the competition, such as styles (Traditional, Japanese, etc.) 
                and sizes (Small, Medium, Large). Each category can have a maximum number of entries.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Scoring System</h2>
              <p className="text-gray-300 mb-4">
                The TattScore system uses standardized scoring areas that are consistent across all competitions. 
                These scoring areas are set by the TattSync Master Admin and cannot be modified.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Scoring Area</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {scoringAreas.map((area) => (
                      <tr key={area.key} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                          {area.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {area.range[0]} to {area.range[1]}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {area.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Judges Tab */}
        {activeTab === 'judges' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Competition Judges</h2>
                <button
                  onClick={() => setIsJudgeModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Invite Judge</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Judge</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {judges.map((judge) => (
                      <tr key={judge.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-white font-medium">{judge.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {judge.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full"
                                style={{ width: `${judge.completion_percentage}%` }}
                              />
                            </div>
                            <span className="text-white">{judge.entries_judged}/{judge.total_entries}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-purple-400 hover:text-purple-300 transition-colors">
                            <Mail className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {judges.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No judges added yet. Click "Invite Judge" to add some.</p>
                </div>
              )}
            </div>
            
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">About Judges</h3>
              <p className="text-blue-200 text-sm">
                Judges are responsible for scoring competition entries. Each judge will receive an email invitation with instructions
                on how to access the judging system. You can track their progress here.
              </p>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Competition Results</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportResults}
                    className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={handlePublishResults}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>Publish</span>
                  </button>
                </div>
              </div>
              
              <ResultsTable
                results={results}
                onViewEntry={handleViewEntry}
                onExportResults={handleExportResults}
              />
            </div>
            
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-yellow-300 font-medium mb-2">Publishing Results</h3>
              <p className="text-yellow-200 text-sm">
                Once all judges have completed their scoring, you can publish the results. Published results will be visible to all participants
                and can be displayed on screens at the event. Make sure all judging is complete before publishing.
              </p>
            </div>
          </div>
        )}

        {/* Entry Form Modal */}
        {isEntryFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedEntry ? 'Edit Entry' : 'Add New Entry'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsEntryFormOpen(false);
                      setSelectedEntry(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <EntryForm
                  eventId={eventData?.id || 1}
                  categories={categories}
                  entryTypes={[
                    { value: 'tattoo', label: 'Tattoo' },
                    { value: 'piercing', label: 'Piercing' },
                    { value: 'performance', label: 'Performance' },
                    { value: 'other', label: 'Other' }
                  ]}
                  onSubmit={handleSubmitEntry}
                  onCancel={() => {
                    setIsEntryFormOpen(false);
                    setSelectedEntry(null);
                  }}
                  initialData={selectedEntry}
                />
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        <CategoryModal
          eventId={eventData?.id || 1}
          eventName={eventData?.name || ''}
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategories}
          initialCategories={categories}
        />

        {/* Judge Invite Modal */}
        <JudgeInviteModal
          eventId={eventData?.id || 1}
          eventName={eventData?.name || ''}
          isOpen={isJudgeModalOpen}
          onClose={() => setIsJudgeModalOpen(false)}
          onInvite={handleInviteJudge}
        />
      </div>
    </div>
  );
}