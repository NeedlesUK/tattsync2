import React, { useState } from 'react';
import { X, Save, Plus, Trash2, User, Mail, Phone, Calendar, Ticket, Search } from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ticket_type: string;
  notes?: string;
}

interface ComplimentaryTicketModalProps {
  eventId: number;
  eventName: string;
  ticketTypes: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipients: Recipient[]) => void;
}

export function ComplimentaryTicketModal({
  eventId,
  eventName,
  ticketTypes,
  isOpen,
  onClose,
  onSave
}: ComplimentaryTicketModalProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: '1',
      name: '',
      email: '',
      phone: '',
      ticket_type: ticketTypes.length > 0 ? ticketTypes[0].id : '',
      notes: ''
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  if (!isOpen) return null;

  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      ticket_type: ticketTypes.length > 0 ? ticketTypes[0].id : '',
      notes: ''
    };
    setRecipients([...recipients, newRecipient]);
  };

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    setRecipients(recipients.map(recipient => 
      recipient.id === id ? { ...recipient, ...updates } : recipient
    ));
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    // Mock search functionality - in real implementation, this would search the database
    setSearchResults([
      { id: 'u1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+44 7700 900123' },
      { id: 'u2', name: 'Mike Chen', email: 'mike@example.com', phone: '+44 7700 900456' }
    ].filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  };

  const selectSearchResult = (result: any, recipientId: string) => {
    updateRecipient(recipientId, {
      name: result.name,
      email: result.email,
      phone: result.phone
    });
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(recipients);
      onClose();
    } catch (error) {
      console.error('Error issuing complimentary tickets:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Issue Complimentary Tickets</h2>
            <p className="text-gray-300 text-sm">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">Complimentary Tickets</h3>
              <p className="text-blue-200 text-sm">
                Issue free tickets to special guests, staff, or VIPs. Recipients will receive an email with their ticket.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search for existing users by name or email..."
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
              >
                Search
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white/5 border border-white/20 rounded-lg overflow-hidden">
                {searchResults.map(result => (
                  <div 
                    key={result.id}
                    className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                    onClick={() => selectSearchResult(result, recipients[0].id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{result.name}</p>
                        <p className="text-gray-400 text-sm">{result.email}</p>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 text-sm">
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipients List */}
          <div className="space-y-6">
            {recipients.map((recipient, index) => (
              <div key={recipient.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Ticket className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-medium">Recipient {index + 1}</h4>
                  </div>
                  <button
                    onClick={() => removeRecipient(recipient.id)}
                    className="text-red-400 hover:text-red-300"
                    disabled={recipients.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(recipient.id, { name: e.target.value })}
                        className="w-full pl-10 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter recipient's name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={recipient.email}
                        onChange={(e) => updateRecipient(recipient.id, { email: e.target.value })}
                        className="w-full pl-10 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter recipient's email"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone Number (optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={recipient.phone || ''}
                        onChange={(e) => updateRecipient(recipient.id, { phone: e.target.value })}
                        className="w-full pl-10 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter recipient's phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Ticket Type</label>
                    <select
                      value={recipient.ticket_type}
                      onChange={(e) => updateRecipient(recipient.id, { ticket_type: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {ticketTypes.map(type => (
                        <option key={type.id} value={type.id} className="bg-gray-800">
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
                  <textarea
                    value={recipient.notes || ''}
                    onChange={(e) => updateRecipient(recipient.id, { notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Add any notes about this complimentary ticket"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Recipient Button */}
          <button
            onClick={addRecipient}
            className="w-full mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Another Recipient</span>
          </button>
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
            disabled={isSaving || recipients.some(r => !r.name || !r.email || !r.ticket_type)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Issuing...' : 'Issue Tickets'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}