import React, { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronUp, FileText, Table as Tabs, Table as Tab, Image, File, Paperclip } from 'lucide-react';

interface InformationItem {
  id: number;
  title: string;
  content: string;
  category?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  media_items?: MediaItem[];
}

interface MediaItem {
  id: string;
  type: 'image' | 'pdf';
  url: string;
  name: string;
  size?: number;
  media_items?: MediaItem[];
}

interface MediaItem {
  id: string;
  type: 'image' | 'pdf';
  url: string;
  name: string;
  size?: number;
}

interface AttendeeInformationProps {
  informationItems: InformationItem[];
}

export function AttendeeInformationSection({ informationItems }: AttendeeInformationProps) {
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    // Extract unique categories from information items
    if (informationItems.length > 0) {
      const uniqueCategories = ['All', ...new Set(informationItems.map(item => item.category || 'General'))];
      setCategories(uniqueCategories);
    }
  }, [informationItems]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    // Extract unique categories from information items
    if (informationItems.length > 0) {
      const uniqueCategories = ['All', ...new Set(informationItems.map(item => item.category || 'General'))];
      setCategories(uniqueCategories);
    }
  }, [informationItems]);

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

  // Filter items by active category
  const filteredItems = activeCategory === 'All' 
    ? informationItems 
    : informationItems.filter(item => (item.category || 'General') === activeCategory);

  // Filter items by active category
  const filteredItems = activeCategory === 'All' 
    ? informationItems 
    : informationItems.filter(item => (item.category || 'General') === activeCategory);

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

      {/* Category tabs */}
      <div className="mb-6 border-b border-white/10">
        <div className="flex overflow-x-auto scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeCategory === category
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-6 border-b border-white/10">
        <div className="flex overflow-x-auto scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeCategory === category
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => {
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
                      <div dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br>') }} />
                    </div>
                  </div>
                  
                  {/* Media items */}
                  {item.media_items && item.media_items.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
                        Attachments
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {item.media_items.map(media => (
                          <div key={media.id} className="bg-white/5 border border-white/20 rounded p-2">
                            {media.type === 'image' ? (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="block">
                                <div className="aspect-video bg-black/20 rounded overflow-hidden">
                                  <img 
                                    src={media.url} 
                                    alt={media.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Error';
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-purple-400 hover:text-purple-300 truncate mt-1">{media.name}</p>
                              </a>
                            ) : (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="block">
                                <div className="aspect-video bg-red-500/10 rounded flex items-center justify-center">
                                  <File className="w-8 h-8 text-red-400" />
                                </div>
                                <p className="text-xs text-purple-400 hover:text-purple-300 truncate mt-1">{media.name}</p>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Media items */}
                  {item.media_items && item.media_items.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
                        Attachments
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {item.media_items.map(media => (
                          <div key={media.id} className="bg-white/5 border border-white/20 rounded p-2">
                            {media.type === 'image' ? (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="block">
                                <div className="aspect-video bg-black/20 rounded overflow-hidden">
                                  <img 
                                    src={media.url} 
                                    alt={media.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Error';
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-purple-400 hover:text-purple-300 truncate mt-1">{media.name}</p>
                              </a>
                            ) : (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="block">
                                <div className="aspect-video bg-red-500/10 rounded flex items-center justify-center">
                                  <File className="w-8 h-8 text-red-400" />
                                </div>
                                <p className="text-xs text-purple-400 hover:text-purple-300 truncate mt-1">{media.name}</p>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
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