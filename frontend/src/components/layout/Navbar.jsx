import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Coins, 
  Flame, 
  Bell,
  LogOut,
  User,
  Settings,
  Search,
  MessageCircle,
  Menu,
  X,
  Home,
  Compass,
  Calendar,
  ShoppingBag,
  Gamepad2,
  Award
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'match', title: 'New Match!', message: 'You matched with Sarah_Designs', time: '2m ago', read: false },
    { id: 2, type: 'session', title: 'Session Starting', message: 'Your React.js session starts in 1 hour', time: '1h ago', read: false },
    { id: 3, type: 'achievement', title: 'Achievement Unlocked!', message: 'You earned the "First Steps" badge', time: '1d ago', read: true },
  ]);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const getLevelColor = (level) => {
    if (level >= 8) return 'from-gold-400 to-gold-600';
    if (level >= 5) return 'from-secondary-400 to-secondary-600';
    if (level >= 3) return 'from-primary-400 to-primary-600';
    return 'from-gray-400 to-gray-600';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-40">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <span className="text-xl font-bold text-gradient hidden sm:inline">SkillSwap</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search skills, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-1 lg:gap-4">
          {/* XP/Level */}
          <motion.div 
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/profile')}
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getLevelColor(user?.level || 1)} flex items-center justify-center text-xs font-bold`}>
              {user?.level || 1}
            </div>
            <span className="text-sm text-gray-400">Lv.{user?.level || 1}</span>
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                style={{ width: '45%' }}
              />
            </div>
          </motion.div>

          {/* Coins */}
          <motion.div 
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gold-400/10 border border-gold-400/30 rounded-full cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/shop')}
          >
            <Coins className="w-4 h-4 text-gold-400" />
            <span className="text-gold-400 font-bold text-sm">{user?.coins || 0}</span>
          </motion.div>

          {/* Streak */}
          {user?.streakDays > 0 && (
            <motion.div 
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-orange-500 font-bold text-sm">{user.streakDays}</span>
            </motion.div>
          )}

          {/* Messages */}
          <button 
            onClick={() => navigate('/chat')}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">{unreadCount}</span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <button className="text-xs text-primary-400 hover:text-primary-300">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-3 border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer ${!notif.read ? 'bg-gray-700/20' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                            {notif.type === 'match' ? '🎯' : notif.type === 'session' ? '📚' : '🏆'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className="text-xs text-gray-400">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                          {!notif.read && <div className="w-2 h-2 bg-primary-500 rounded-full"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center">
                    <button className="text-sm text-primary-400 hover:text-primary-300">View All Notifications</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-300 hidden lg:inline">{user?.username}</span>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-700">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${getLevelColor(user?.level || 1)}`}>Level {user?.level || 1}</span>
                      <span className="text-gold-400 text-xs flex items-center gap-1">🪙 {user?.coins || 0}</span>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <User className="w-4 h-4" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">My Achievements</span>
                    </Link>
                    <Link to="/shop" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-sm">My Inventory</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-700">
                    <button 
                      onClick={logout}
                      className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gray-800 border-t border-gray-700"
          >
            <div className="p-4 space-y-2">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search skills, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500"
                  />
                </div>
              </form>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <Home className="w-5 h-5" /> Dashboard
              </Link>
              <Link to="/explore" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <Compass className="w-5 h-5" /> Explore
              </Link>
              <Link to="/sessions" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <Calendar className="w-5 h-5" /> Sessions
              </Link>
              <Link to="/chat" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <MessageCircle className="w-5 h-5" /> Messages
              </Link>
              <Link to="/games" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <Gamepad2 className="w-5 h-5" /> Games
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <Trophy className="w-5 h-5" /> Leaderboard
              </Link>
              <Link to="/shop" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <ShoppingBag className="w-5 h-5" /> Shop
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
