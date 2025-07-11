import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Crown, 
  Calendar, 
  Award, 
  Building, 
  MessageCircle, 
  Users, 
  Bell, 
  Heart 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, supabase } = useAuth();
  const location = useLocation();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [moduleAvailability, setModuleAvailability] = useState({
    ticketing_enabled: false,
    consent_forms_enabled: false,
    tattscore_enabled: false
  });
  
  useEffect(() => {
    if (user?.roles) {
      setUserRoles(user.roles);
    } else if (user?.role) {
      setUserRoles([user.role]);
    } else {
      setUserRoles([]);
    }
    
    // Fetch module availability for the current event
    if (user && (user.role === 'event_manager' || user.role === 'event_admin')) {
      fetchModuleAvailability();
    }
  }, [user]);

  const fetchModuleAvailability = async () => {
    try {
      if (supabase) {
        // Get the current event ID - in a real implementation, this would come from context or state
        // For now, we'll try to get it from the URL if it's in the format /event-settings?event=X
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event');
        
        if (!eventId) return;
        
        const { data, error } = await supabase
          .from('event_modules')
          .select('*')
          .eq('event_id', eventId)
          .single();
          
        if (error) {
          console.error('Error fetching event modules:', error);
          return;
        }
        
        if (data) {
          console.log('Fetched event modules for header:', data);
          setModuleAvailability({
            ticketing_enabled: data.ticketing_enabled || false,
            consent_forms_enabled: data.consent_forms_enabled || false,
            tattscore_enabled: data.tattscore_enabled || false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching module availability:', error);
    }
  };

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
          requiresModule: 'ticketing_enabled',
          isEnabled: moduleAvailability.ticketing_enabled
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
    // Check if the module is enabled based on the fetched module availability
    if (!user) {
      return false;
    }
    
    // For demo purposes, enable all modules for admin users
    if (user.role === 'admin' || user.email === 'admin@tattsync.com') {
      return true;
    }
    
    // For event managers, check the module availability
    switch (moduleName) {
      case 'ticketing_enabled':
        return moduleAvailability.ticketing_enabled;
      case 'consent_forms_enabled':
        return moduleAvailability.consent_forms_enabled;
      case 'tattscore_enabled':
        return moduleAvailability.tattscore_enabled;
      default:
        return true;
    }
  };

  // Filter navigation items based on user role
  const filteredTattscoreNavigation = tattscoreNavigation.filter(item => 
    !item.roles || (user && (userRoles.some(role => item.roles.includes(role)) || user?.email === 'gary@tattscore.com'))
  );

  const filteredStudioNavigation = studioNavigation.filter(item => 
    !item.roles || (user && (userRoles.some(role => item.roles.includes(role)) || user?.email === 'gary@tattscore.com'))
  );

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 fixed top-0 left-0 right-0 z-50">
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
                if ((item.requiresModule && !isModuleEnabled(item.requiresModule)) || 
                    (item.isEnabled !== undefined && !item.isEnabled)) {
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
                  <button 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      moduleAvailability.tattscore_enabled 
                        ? "text-gray-300 hover:text-white hover:bg-white/10" 
                        : "text-gray-500 cursor-not-allowed"
                    } transition-colors flex items-center space-x-1`}
                    disabled={!moduleAvailability.tattscore_enabled}
                  >
                    <span>TattScore</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`absolute left-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-md shadow-lg opacity-0 invisible ${
                    moduleAvailability.tattscore_enabled ? "group-hover:opacity-100 group-hover:visible" : ""
                  } transition-all z-50`}>
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2 rounded-md transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-3">
            {user ? (
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationItems.map((item) => {
                  // Skip items that require a module if the module is not enabled
                  if ((item.requiresModule && !isModuleEnabled(item.requiresModule)) || 
                      (item.isEnabled !== undefined && !item.isEnabled)) {
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
                    <div className={`px-3 py-2 text-xs font-semibold ${
                      moduleAvailability.tattscore_enabled ? "text-gray-400" : "text-gray-600"
                    } uppercase tracking-wider`}>
                      TattScore
                      {!moduleAvailability.tattscore_enabled && " (Disabled)"}
                    </div>
                    {moduleAvailability.tattscore_enabled && filteredTattscoreNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {!moduleAvailability.tattscore_enabled && (
                      <p className="px-3 py-2 text-gray-500 text-sm">
                        TattScore module is disabled for this event
                      </p>
                    )}
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
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="px-2 pt-2 pb-3 space-y-4">
                <Link
                  to="/login"
                  className="block w-full text-center bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/events"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Events
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// Helper components for icons that might be missing
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}