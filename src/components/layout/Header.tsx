import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Crown, Calendar, Award, Building } from 'lucide-react';
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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Events', href: '/events' },
    // Only show Applications for Event Managers and regular users (not Master Admins)
    ...(user?.role !== 'admin' ? [{ name: 'Applications', href: '/applications' }] : []),
    { name: 'Messages', href: '/messages' },
    { name: 'Deals', href: '/deals' },
  ];

  // For Master Admin, direct links instead of dropdowns
  const adminDirectLinks = [
    { name: 'TattScore', href: '/tattscore/admin' },
    { name: 'Studio', href: '/studio/dashboard' },
    { name: 'Tickets', href: '/ticket-management' },
    { name: 'Users', href: '/admin/users' }
  ];

  // TattScore navigation items - filter based on role
  const tattscoreNavigation = [
    { name: 'TattScore Admin', href: '/tattscore/admin', roles: ['event_manager', 'event_admin'] },
    { name: 'TattScore Judging', href: '/tattscore/judging', roles: ['event_manager', 'event_admin', 'judge'] },
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

  // Filter navigation items based on user role
  const filteredTattscoreNavigation = tattscoreNavigation.filter(item => 
    !item.roles || (user && (userRoles.some(role => item.roles.includes(role)) || user.email === 'gary@tattscore.com'))
  );

  const filteredStudioNavigation = studioNavigation.filter(item => 
    !item.roles || (user && (userRoles.some(role => item.roles.includes(role)) || user.email === 'gary@tattscore.com'))
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
              {navigation.map((item) => (
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
              
              {/* For Master Admin, show direct links */}
              {(user.role === 'admin' || userRoles.includes('admin')) && adminDirectLinks.map((item) => (
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
                    {(roleDisplay || user.email === 'gary@tattscore.com') && (
                      <div className="flex items-center space-x-1 text-xs">
                        {user.email === 'gary@tattscore.com' ? (
                          <>
                            <Crown className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-purple-400">Master Admin</span>
                          </>
                        ) : (
                          <>
                            <roleDisplay.icon className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400">{roleDisplay.label}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
                {(roleDisplay || user.email === 'gary@tattscore.com') && (
                  <span className={`${roleDisplay?.color} text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1`}>
                    {user.role === 'admin' ? (
                      <>
                        <Crown className="w-3 h-3" />
                        <span className="hidden sm:inline">{roleDisplay?.label || 'Master Admin'}</span>
                      </>
                    ) : (
                      <>
                        <roleDisplay.icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{roleDisplay.label}</span>
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
              <Link
                to={user.role === 'admin' ? '/dashboard' : '/profile'}
                className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && user && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
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
              
              {/* For Master Admin, show direct links in mobile menu too */}
              {(user.role === 'admin' || userRoles.includes('admin')) && adminDirectLinks.map((item) => (
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
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}