import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Crown, Calendar, Award, Building, MessageCircle, Ticket, Users, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  
  useEffect(() => {
    if (user?.roles) {
      setUserRoles(user.roles);
    } else if (user?.role) {
      setUserRoles([user.role]);
    } else {
      setUserRoles([]);
    }
  }, [user]);

  // Define navigation based on user role
  const getNavigation = (): any[] => {
    // Default navigation for all users
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard' }
    ];
    
    // For event managers, show specific navigation
    if (userRoles.includes('event_manager') || userRoles.includes('event_admin')) {
      return [
        ...baseNavigation,
        { 
          name: 'Messages', 
          href: '/messages',
          badge: {
            count: 0, // Replace with actual unread count
            color: 'bg-green-500 text-white'
          }
        },
        { 
          name: 'Tickets', 
          href: '/ticket-management',
          requiresModule: 'ticketing_enabled'
        },
        { 
         name: 'Applications', 
          href: '/applications'
        },
        { 
          name: 'Attendees', 
          href: '/attendees'
        },
      ];
    }
    
    // For regular users
    return [
      ...baseNavigation,
      { name: 'Events', href: '/events' },
      { name: 'Messages', href: '/messages' },
      { name: 'Deals', href: '/deals' },
    ];
  };

  const navigationItems = getNavigation();

  // For Master Admin, direct links instead of dropdowns
  const adminDirectLinks = [
    { name: 'TattScore', href: '/tattscore/admin' },
    { name: 'Studio', href: '/studio/dashboard' },
    { name: 'Tickets', href: '/ticket-management' },
  ];

  // TattScore navigation items - filter based on role
  const tattscoreNavigation = [
    { name: 'TattScore Admin', href: '/tattscore/admin', roles: ['event_manager', 'event_admin'] },
    { name: 'Leaderboard', href: '/tattscore/judging', roles: ['event_manager', 'event_admin', 'judge'] }
  ];

  // Studio navigation items
  const studioNavigation = [
    { name: 'Studio Dashboard', href: '/studio/dashboard', roles: ['studio_manager', 'artist', 'piercer'] },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Master Admin', icon: Crown, color: 'bg-purple-600' };
      case 'event_manager':
        return { label: 'Event Manager', icon: Calendar, color: 'bg-teal-600' };
      case 'studio_manager':
        return { label: 'Studio Manager', icon: Building, color: 'bg-blue-600' };
      case 'judge':
        return { label: 'Judge', icon: Award, color: 'bg-orange-600' };
      default:
        return null;
    }
  };

  const roleDisplay = user ? getRoleDisplay(user.role) : null;
  
  // Check if a module is enabled for the current user
  const isModuleEnabled = (moduleName: string) => {
    // This is a placeholder - in a real implementation, you would check if the module is enabled
    // for the current user's event
    if (!user) return false;
    
    // For demo purposes, enable all modules for admin users
    if (user.role === 'admin' || user.email === 'admin@tattsync.com') {
      return true;
    }
    
    // For event managers, check if the module is enabled in their event
    // This would typically be fetched from the database
    // For now, we'll just return true for all modules
    return true;
  };

  // Filter navigation items based on user role
  const filteredTattscoreNavigation = tattscoreNavigation.filter(item => 
    !item.roles || (user && (userRoles.some(role => item.roles.includes(role)) || user?.email === 'gary@tattscore.com'))
  );

  const filteredStudioNavigation = studioNavigation.filter(item => 
    !item.roles || (user && (userRoles.some(role => item.roles.includes(role)) || user?.email === 'gary@tattscore.com'))
  );

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/IMG_0953.png" 
                alt="TattSync Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-white font-bold text-xl">TattSync</span>
            </Link>
          </div>

          {user && (
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                // Skip items that require a module if the module is not enabled
                if (item.requiresModule && !isModuleEnabled(item.requiresModule)) {
                  return null;
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href} 
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-purple-400 bg-purple-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                    {item.badge && (
                      <span className={`ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full ${
                        item.badge.count > 0 
                          ? 'bg-red-500 text-white' 
                          : item.badge.color
                      }`}>
                        {item.badge.count}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* For Master Admin, show direct links */}
              {user && (user.role === 'admin' || userRoles.includes('admin')) && adminDirectLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-purple-400 bg-purple-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* TattScore Navigation - only for non-admin users */}
              {!userRoles.includes('admin') && filteredTattscoreNavigation.length > 0 && (
                <div className="relative group">
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1">
                    <span>TattScore</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {filteredTattscoreNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Studio Navigation - only for non-admin users */}
              {!userRoles.includes('admin') && filteredStudioNavigation.length > 0 && (
                <div className="relative group">
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1">
                    <span>Studio</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {filteredStudioNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center overflow-hidden">
                      {user.name ? (
                        <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                      ) : (
                        <User className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <span className="block font-medium">{user.name || 'User'}</span>
                  </div>
                </Link>
                {user && roleDisplay && (
                  <span className={`${roleDisplay?.color || 'bg-purple-600'} text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1`}>
                    {user.role === 'admin' || user.email === 'admin@tattsync.com' ? (
                      <>
                        <Crown className="w-3 h-3" />
                        <span className="hidden sm:inline">{roleDisplay?.label || 'Master Admin'}</span>
                      </>
                    ) : (
                      <>
                        {roleDisplay && <roleDisplay.icon className="w-3 h-3" />}
                        <span className="hidden sm:inline">{roleDisplay?.label || ''}</span>
                      </>
                    )}
                  </span>
                )}
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:block">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && user && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                // Skip items that require a module if the module is not enabled
                if (item.requiresModule && !isModuleEnabled(item.requiresModule)) {
                  return null;
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href} 
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-purple-400 bg-purple-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                    {item.badge && (
                      <span className={`ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full ${
                        item.badge.count > 0 
                          ? 'bg-red-500 text-white' 
                          : item.badge.color
                      }`}>
                        {item.badge.count}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* For Master Admin, show direct links in mobile menu too */}
              {user && (user.role === 'admin' || userRoles.includes('admin')) && adminDirectLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-purple-400 bg-purple-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* TattScore Mobile Navigation - only for non-admin users */}
              {!userRoles.includes('admin') && filteredTattscoreNavigation.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    TattScore
                  </div>
                  {filteredTattscoreNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
              
              {/* Studio Mobile Navigation - only for non-admin users */}
              {!userRoles.includes('admin') && filteredStudioNavigation.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Studio
                  </div>
                  {filteredStudioNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
        {isCreateModalOpen && (
                </>
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
        
        {/* Global Deals Modal */}
        {isGlobalDealsModalOpen && (
          <GlobalDealsModal
            isOpen={isGlobalDealsModalOpen}
            onClose={() => setIsGlobalDealsModalOpen(false)}
            onSave={(data) => {
              console.log('Saving global deals:', data);
              setIsGlobalDealsModalOpen(false);
            }}
          </div>
        )}
      </div>
    </header>
  );
}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors"
          >
            <Calendar className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Event Modules</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-slate-700 hover:bg-slate-600 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors"
          >
            <Users className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">User Management</span>
          </button>
          
          <button
            className="bg-slate-700 hover:bg-slate-600 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors"
          >
            <FileIcon className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Statistics</span>
          </button>
          
          <button
            className="bg-slate-700 hover:bg-slate-600 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors"
          >
            <Settings className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">System Status</span>
          </button>
          
          <button
            onClick={() => setIsGlobalDealsModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors"
          >
            <Gift className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Global Deals</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <button
            onClick={() => navigate('/admin/consent-templates')}
            className="bg-slate-700 hover:bg-slate-600 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors"
          >
            <Heart className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Consent Form Templates</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/aftercare-templates')}
            className="bg-slate-700 hover:bg-slate-600 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors"
          >
            <FileIcon className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Aftercare Templates</span>
          </button>
          
          <button
            className="bg-slate-700 hover:bg-slate-600 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors"
          >
            <Shield className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Master Admin Controls</span>
          </button>
        </div>
