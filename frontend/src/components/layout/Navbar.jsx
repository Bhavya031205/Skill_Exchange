import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Settings, LogOut, User, ChevronDown,
  Zap, Coins, Flame, Trophy, LayoutDashboard, Compass,
  Calendar, MessageCircle, ShoppingBag, Gamepad2, X,
  HelpCircle, BookOpen, Star, Shield, CheckCheck
} from 'lucide-react';
import { notificationsApi } from '../../services/api';
 
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
 
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
 
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);
 
  const loadNotifications = async () => {
    if (!user) return;
    try {
      const response = await notificationsApi.getAll();
      setNotifications(response.data.data || []);
    } catch (error) {
      // Keep using mock notifications as fallback
    }
  };
 
  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);
 
  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      // Silently fail
    }
  };
 
  const getLevelColor = (level) => {
    if (level >= 8) return 'from-yellow-400 to-yellow-600';
    if (level >= 5) return 'from-purple-400 to-purple-600';
    if (level >= 3) return 'from-sky-400 to-sky-600';
    return 'from-gray-400 to-gray-600';
  };
 
  // Keep navLinks only for mobile bottom nav
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/sessions', label: 'Sessions', icon: Calendar },
    { path: '/games', label: 'Games', icon: Gamepad2, badge: 'NEW' },
    { path: '/leaderboard', label: 'Rank', icon: Trophy },
  ];
 
  const mockNotifs = [
    { id: 'mock-1', text: 'Welcome to SkillSwap! Add your skills to get started.', time: 'Just now', unread: true, icon: '👋' },
    { id: 'mock-2', text: 'Complete a session to earn XP and coins!', time: 'Just now', unread: true, icon: '💰' },
  ];
 
  const getNotificationIcon = (type) => {
    const icons = { session: '📅', message: '💬', match: '🤝', achievement: '🏆', system: '🔔' };
    return icons[type] || '🔔';
  };
 
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };
 
  const xpToNextLevel = [100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
  const nextLevelXp = xpToNextLevel[Math.min((user?.level || 1) - 1, 8)];
  const prevLevelXp = xpToNextLevel[Math.max((user?.level || 1) - 2, 0)] || 0;
  const progress = nextLevelXp > 0 ? Math.round(((user?.xp || 0) - prevLevelXp) / (nextLevelXp - prevLevelXp) * 100) : 0;
 
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-gray-950/95 backdrop-blur-md border-b border-white/5 z-50">
        <div className="h-full px-4 md:px-6 flex items-center gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent hidden sm:block">
              SkillSwap
            </span>
          </Link>
 
          {/* ── Desktop nav links REMOVED — navigation is in the Sidebar ── */}
 
          <div className="flex-1" />
 
          {/* Search */}
          <AnimatePresence>
            {searchOpen ? (
              <motion.form
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                onSubmit={handleSearch}
                className="relative flex items-center"
              >
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills, users..."
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
 
          {/* XP/Level - Desktop */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getLevelColor(user?.level || 1)} flex items-center justify-center text-xs font-bold text-white`}>
              {user?.level || 1}
            </div>
            <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">{user?.xp || 0} XP</span>
          </div>
 
          {/* Coins */}
          <Link to="/shop" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full hover:bg-yellow-400/15 transition-colors">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{user?.coins || 0}</span>
          </Link>
 
          {/* Streak */}
          {(user?.streakDays || 0) > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-orange-500 font-bold text-sm">{user.streakDays}</span>
            </div>
          )}
 
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); if (!notifOpen) loadNotifications(); }}
              className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {(notifications.some(n => n.read === false) || mockNotifs.some(n => n.unread)) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-gray-950" />
              )}
            </button>
 
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {(notifications.length > 0 ? notifications : mockNotifs).slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 ${notif.read === false ? 'bg-sky-500/5' : ''}`}
                      >
                        <span className="text-xl shrink-0">{notif.icon || getNotificationIcon(notif.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200 leading-snug">{notif.text || notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString() : notif.time}</p>
                        </div>
                        {notif.read === false && <div className="w-2 h-2 bg-sky-500 rounded-full mt-1 shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/5">
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block text-center text-sm text-sky-400 hover:text-sky-300 py-1"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
 
          {/* Profile Menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 hover:bg-white/5 rounded-xl px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  user?.username?.[0]?.toUpperCase()
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-none">{user?.username}</p>
                <p className="text-xs text-gray-500 mt-0.5">Level {user?.level || 1}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden md:block ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
 
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-white/5 bg-gradient-to-br from-sky-500/10 to-violet-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white overflow-hidden">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : user?.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user?.username}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Coins className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">{user?.coins || 0} coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
 
                  {/* Menu Items */}
                  <div className="p-2">
                    {[
                      { icon: User, label: 'My Profile', path: '/profile' },
                      { icon: Settings, label: 'Account Settings', path: '/settings' },
                      { icon: BookOpen, label: 'My Skills', path: '/profile#skills' },
                      { icon: Star, label: 'Achievements', path: '/profile#achievements' },
                      { icon: ShoppingBag, label: 'Shop', path: '/shop' },
                      { icon: HelpCircle, label: 'Help & Support', path: '/help' },
                    ].map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
 
                  <div className="p-2 border-t border-white/5">
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
 
      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-white/5 z-50 px-2 py-2 flex items-center justify-around">
        {navLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              location.pathname === item.path ? 'text-sky-400' : 'text-gray-500'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
            location.pathname === '/profile' ? 'text-sky-400' : 'text-gray-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </>
  );
};
 
export default Navbar;