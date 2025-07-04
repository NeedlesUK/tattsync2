import React, { useState } from 'react';
import { Send, Search, Filter, MessageCircle, User, Clock, Paperclip, Star } from 'lucide-react';

export function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Artist',
      lastMessage: 'Thanks for approving my application! When should I arrive for setup?',
      timestamp: '2024-01-15 14:30',
      unread: 2,
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2',
      status: 'online'
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Piercer',
      lastMessage: 'Could you clarify the booth setup requirements?',
      timestamp: '2024-01-15 12:15',
      unread: 0,
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2',
      status: 'offline'
    },
    {
      id: 3,
      name: 'Emma Davis',
      role: 'Performer',
      lastMessage: 'What time is the sound check scheduled for?',
      timestamp: '2024-01-15 10:45',
      unread: 1,
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2',
      status: 'away'
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      role: 'Trader',
      lastMessage: 'Payment has been processed successfully.',
      timestamp: '2024-01-14 16:20',
      unread: 0,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2',
      status: 'offline'
    }
  ];

  const messages = [
    {
      id: 1,
      senderId: 1,
      senderName: 'Sarah Johnson',
      content: 'Hi! I just received the approval email for my artist application. I\'m so excited!',
      timestamp: '2024-01-15 14:25',
      type: 'received'
    },
    {
      id: 2,
      senderId: 'admin',
      senderName: 'Event Admin',
      content: 'Congratulations Sarah! We\'re thrilled to have you at Ink Fest 2024. Your booth assignment is A-15.',
      timestamp: '2024-01-15 14:27',
      type: 'sent'
    },
    {
      id: 3,
      senderId: 1,
      senderName: 'Sarah Johnson',
      content: 'Perfect! When should I arrive for setup? And are there any specific requirements for my booth display?',
      timestamp: '2024-01-15 14:30',
      type: 'received'
    }
  ];

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'away':
        return 'bg-yellow-400';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-gray-300">Communicate with event participants</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-white/10 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-white/10 cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-purple-600/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(conversation.status)} rounded-full border-2 border-slate-800`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-medium truncate">{conversation.name}</h3>
                          <span className="text-xs text-gray-400">{formatDate(conversation.timestamp)}</span>
                        </div>
                        <p className="text-xs text-purple-400 mb-1">{conversation.role}</p>
                        <p className="text-sm text-gray-300 truncate">{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <div className="mt-2">
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unread}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={selectedConv.avatar}
                            alt={selectedConv.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(selectedConv.status)} rounded-full border-2 border-slate-800`} />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{selectedConv.name}</h3>
                          <p className="text-sm text-purple-400">{selectedConv.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Star className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Filter className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'sent'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-300'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'sent' ? 'text-purple-200' : 'text-gray-400'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a conversation</h3>
                    <p className="text-gray-400">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}