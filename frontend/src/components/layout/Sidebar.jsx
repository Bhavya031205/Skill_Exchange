import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Compass, Calendar, MessageCircle,
  ShoppingBag, Trophy, Gamepad2, Sparkles, Settings,
  Coins, Flame, Zap, ChevronRight
} from 'lucide-react';
 
const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/sessions', icon: Calendar, label: 'Sessions' },
  { path: '/chat', icon: MessageCircle, label: 'Messages' },
  { path: '/games', icon: Gamepad2, label: 'Games', highlight: true },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/shop', icon: ShoppingBag, label: 'Shop' },
];
 
const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
 
  const xpThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const curr = xpThresholds[Math.min(level - 1, 9)];
  const next = xpThresholds[Math.min(level, 9)];
  const progress = next > curr ? Math.round(((xp - curr) / (next - curr)) * 100) : 100;
 
  return (
    <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex-col bg-gray-950 border-r border-white/5 overflow-y-auto">
      {/* User mini-card */}
      <Link to="/profile" className="flex items-center gap-3 p-4 mx-3 mt-3 rounded-2xl hover:bg-white/5 transition-colors border border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            <span className="text-xs text-gray-600">Lv.{level}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
      </Link>
 
      {/* Quick stats */}
      <div className="flex gap-2 px-4 py-3 mx-1">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-yellow-400/10 border border-yellow-400/15 rounded-lg flex-1 justify-center">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{user?.coins || 0}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1.5 bg-orange-500/10 border border-orange-500/15 rounded-lg flex-1 justify-center">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-bold text-orange-400">{user?.streakDays || 0}d</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1.5 bg-sky-500/10 border border-sky-500/15 rounded-lg flex-1 justify-center">
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-bold text-sky-400">{(user?.xp || 0).toLocaleString()}</span>
        </div>
      </div>
 
      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
              ${isActive
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                : item.highlight
                ? 'text-gray-400 hover:text-white bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }
            `}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.highlight && <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
          </NavLink>
        ))}
      </nav>
 
      {/* Daily spin CTA */}
      <div className="px-3 pb-2">
        <Link to="/games">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-3.5 bg-gradient-to-r from-yellow-400/15 to-orange-500/10 border border-yellow-400/20 rounded-2xl cursor-pointer mb-2"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎡</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-yellow-400">Daily Spin!</p>
                <p className="text-xs text-gray-500">Win coins every day</p>
              </div>
            </div>
          </motion.div>
        </Link>
 
        {/* Settings link */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border
            ${isActive ? 'bg-sky-500/15 text-sky-400 border-sky-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-transparent'}`
          }
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
};
 
export default Sidebar;
