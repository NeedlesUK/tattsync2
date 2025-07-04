import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Instagram, Facebook, Twitter, Share2, Eye, Send, Settings, Link } from 'lucide-react';

interface SocialMediaAccount {
  id: string;
  platform: string;
  account_name: string;
  is_active: boolean;
  connected_at: string;
}

interface SocialMediaTemplate {
  id: string;
  template_name: string;
  template_type: string;
  application_types: string[];
  platforms: string[];
  post_text: string;
  hashtags: string[];
  is_active: boolean;
}

interface SocialMediaModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function SocialMediaModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSave
}: SocialMediaModalProps) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'templates' | 'posts'>('accounts');
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([
    {
      id: '1',
      platform: 'instagram',
      account_name: '@inkfest2024',
      is_active: true,
      connected_at: '2024-01-01T00:00:00Z'
    }
  ]);

  const [templates, setTemplates] = useState<SocialMediaTemplate[]>([
    {
      id: '1',
      template_name: 'Artist Announcement',
      template_type: 'individual_announcement',
      application_types: ['artist'],
      platforms: ['instagram', 'facebook'],
      post_text: `We're excited to announce {name} will be joining us at {event_name}! 🎨✨

{bio}

Specializing in: {specialties}
Experience: {years_experience}

Book your appointment now!`,
      hashtags: ['tattoo', 'tattooartist', 'tattooevent', 'bodyart', 'ink'],
      is_active: true
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const platforms = [
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink' },
    { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'blue' },
    { value: 'twitter', label: 'Twitter', icon: Twitter, color: 'sky' }
  ];

  const applicationTypes = [
    { value: 'artist', label: 'Artists' },
    { value: 'piercer', label: 'Piercers' },
    { value: 'trader', label: 'Traders' },
    { value: 'caterer', label: 'Caterers' },
    { value: 'performer', label: 'Performers' }
  ];

  const templateTypes = [
    { value: 'individual_announcement', label: 'Individual Announcement' },
    { value: 'bulk_announcement', label: 'Bulk Announcement' },
    { value: 'artist_spotlight', label: 'Artist Spotlight' },
    { value: 'trader_feature', label: 'Trader Feature' }
  ];

  const addAccount = () => {
    const newAccount: SocialMediaAccount = {
      id: Date.now().toString(),
      platform: 'instagram',
      account_name: '',
      is_active: true,
      connected_at: new Date().toISOString()
    };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (id: string, updates: Partial<SocialMediaAccount>) => {
    setAccounts(accounts.map(account => 
      account.id === id ? { ...account, ...updates } : account
    ));
  };

  const removeAccount = (id: string) => {
    setAccounts(accounts.filter(account => account.id !== id));
  };

  const addTemplate = () => {
    const newTemplate: SocialMediaTemplate = {
      id: Date.now().toString(),
      template_name: '',
      template_type: 'individual_announcement',
      application_types: [],
      platforms: [],
      post_text: '',
      hashtags: [],
      is_active: true
    };
    setTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (id: string, updates: Partial<SocialMediaTemplate>) => {
    setTemplates(templates.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
  };

  const removeTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ accounts, templates });
      onClose();
    } catch (error) {
      console.error('Error saving social media data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.value === platform);
    return platformData ? platformData.icon : Share2;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Social Media Management</h2>
            <p className="text-gray-300 text-sm">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { key: 'accounts', label: 'Connected Accounts', icon: Link },
            { key: 'templates', label: 'Post Templates', icon: Settings },
            { key: 'posts', label: 'Manage Posts', icon: Send }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Connected Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Connected Social Media Accounts</h3>
                <button
                  onClick={addAccount}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Account</span>
                </button>
              </div>

              <div className="space-y-4">
                {accounts.map((account) => {
                  const PlatformIcon = getPlatformIcon(account.platform);
                  
                  return (
                    <div key={account.id} className="bg-white/5 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <PlatformIcon className="w-6 h-6 text-purple-400" />
                          <h4 className="text-white font-medium">
                            {platforms.find(p => p.value === account.platform)?.label || account.platform}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={account.is_active}
                              onChange={(e) => updateAccount(account.id, { is_active: e.target.checked })}
                              className="text-purple-600 focus:ring-purple-500 rounded"
                            />
                            <span className="text-gray-300 text-sm">Active</span>
                          </label>
                          <button
                            onClick={() => removeAccount(account.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Platform</label>
                          <select
                            value={account.platform}
                            onChange={(e) => updateAccount(account.id, { platform: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {platforms.map(platform => (
                              <option key={platform.value} value={platform.value} className="bg-gray-800">
                                {platform.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Account Name/Handle</label>
                          <input
                            type="text"
                            value={account.account_name}
                            onChange={(e) => updateAccount(account.id, { account_name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="@username or page name"
                          />
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          <strong>Note:</strong> In a production environment, you would connect these accounts using OAuth 
                          to automatically post content. For now, this serves as a template for manual posting.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Post Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Post Templates</h3>
                <button
                  onClick={addTemplate}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Template</span>
                </button>
              </div>

              <div className="space-y-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={template.template_name}
                        onChange={(e) => updateTemplate(template.id, { template_name: e.target.value })}
                        className="text-lg font-medium bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                        placeholder="Template Name"
                      />
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={template.is_active}
                            onChange={(e) => updateTemplate(template.id, { is_active: e.target.checked })}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-300 text-sm">Active</span>
                        </label>
                        <button
                          onClick={() => removeTemplate(template.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Template Type</label>
                        <select
                          value={template.template_type}
                          onChange={(e) => updateTemplate(template.id, { template_type: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {templateTypes.map(type => (
                            <option key={type.value} value={type.value} className="bg-gray-800">
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Application Types</label>
                        <div className="flex flex-wrap gap-2">
                          {applicationTypes.map(type => (
                            <label key={type.value} className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={template.application_types.includes(type.value)}
                                onChange={(e) => {
                                  const types = e.target.checked
                                    ? [...template.application_types, type.value]
                                    : template.application_types.filter(t => t !== type.value);
                                  updateTemplate(template.id, { application_types: types });
                                }}
                                className="text-purple-600 focus:ring-purple-500 rounded"
                              />
                              <span className="text-gray-300 text-xs">{type.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                          {platforms.map(platform => (
                            <label key={platform.value} className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={template.platforms.includes(platform.value)}
                                onChange={(e) => {
                                  const platformList = e.target.checked
                                    ? [...template.platforms, platform.value]
                                    : template.platforms.filter(p => p !== platform.value);
                                  updateTemplate(template.id, { platforms: platformList });
                                }}
                                className="text-purple-600 focus:ring-purple-500 rounded"
                              />
                              <span className="text-gray-300 text-xs">{platform.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-1">Post Content</label>
                      <textarea
                        value={template.post_text}
                        onChange={(e) => updateTemplate(template.id, { post_text: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Write your post template here. Use variables like {name}, {event_name}, {bio}, etc."
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-1">Hashtags (one per line)</label>
                      <textarea
                        value={template.hashtags.join('\n')}
                        onChange={(e) => updateTemplate(template.id, { 
                          hashtags: e.target.value.split('\n').filter(tag => tag.trim()) 
                        })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="tattoo&#10;tattooartist&#10;bodyart"
                      />
                    </div>

                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                      <h5 className="text-yellow-300 font-medium mb-2">Available Variables</h5>
                      <div className="text-yellow-200 text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
                        <code>{'{name}'}</code>
                        <code>{'{event_name}'}</code>
                        <code>{'{bio}'}</code>
                        <code>{'{specialties}'}</code>
                        <code>{'{years_experience}'}</code>
                        <code>{'{business_name}'}</code>
                        <code>{'{application_type}'}</code>
                        <code>{'{contact_details}'}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manage Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Post Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Individual Posts</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Post individual attendee announcements to your connected social media accounts.
                  </p>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Create Individual Post
                  </button>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Bulk Announcements</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Create posts featuring all attendees of a specific type (e.g., all artists).
                  </p>
                  <button className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Create Bulk Post
                  </button>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">Coming Soon</h4>
                <p className="text-blue-200 text-sm">
                  Automated posting, scheduled posts, and engagement analytics will be available in future updates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4 p-6 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}