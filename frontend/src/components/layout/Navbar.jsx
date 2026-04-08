import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Coins, 
  Flame, 
  Bell,
  LogOut,
  User,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getLevelColor = (level) => {
    if (level >= 8) return 'from-gold-400 to-gold-600';
    if (level >= 5) return 'from-secondary-400 to-secondary-600';
    if (level >= 3) return 'from-primary-400 to-primary-600';
    return 'from-gray-400 to-gray-600';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <span className="text-xl font-bold text-gradient">SkillSwap</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* XP/Level */}
          <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full"
            whileHover={{ scale: 1.05 }}
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-400/10 border border-gold-400/30 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Coins className="w-4 h-4 text-gold-400" />
            <span className="text-gold-400 font-bold text-sm">{user?.coins || 0}</span>
          </motion.div>

          {/* Streak */}
          {user?.streakDays > 0 && (
            <motion.div 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-orange-500 font-bold text-sm">{user.streakDays}</span>
            </motion.div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-3">
            <Link 
              to="/profile"
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-300">{user?.username}</span>
            </Link>

            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
