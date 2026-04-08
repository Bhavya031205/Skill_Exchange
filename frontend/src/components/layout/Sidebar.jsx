import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  Compass,
  Users,
  Calendar,
  MessageCircle,
  ShoppingBag,
  Trophy,
  Gamepad2,
  Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/sessions', icon: Calendar, label: 'Sessions' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/games', icon: Gamepad2, label: 'Games', highlight: true },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/shop', icon: ShoppingBag, label: 'Shop' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900/50 border-r border-gray-800 p-4 overflow-y-auto">
      <div className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
              ${item.highlight ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30' : ''}
            `}
          >
            <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-primary-400' : ''}`} />
            <span className="font-medium">{item.label}</span>
            {item.highlight && (
              <Sparkles className="w-4 h-4 ml-auto text-purple-400" />
            )}
          </NavLink>
        ))}
      </div>

      {/* Quick Stats Card */}
      <div className="mt-8 p-4 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-2xl border border-primary-500/20">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Your Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Level Progress</span>
              <span>45%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-[45%] bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full" />
            </div>
          </div>
          <div className="text-center">
            <span className="text-3xl">🎯</span>
            <p className="text-xs text-gray-500 mt-1">Complete sessions to level up!</p>
          </div>
        </div>
      </div>

      {/* Daily Spin CTA */}
      <motion.div 
        className="mt-4 p-4 bg-gradient-to-br from-gold-400/20 to-gold-600/20 rounded-2xl border border-gold-400/30 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        animate={{ rotate: [0, 1, -1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎡</span>
          <div>
            <p className="font-bold text-gold-400">Daily Spin!</p>
            <p className="text-xs text-gray-400">Try your luck for coins</p>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};

export default Sidebar;
