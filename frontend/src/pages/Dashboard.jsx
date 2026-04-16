import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Coins, Flame, Trophy, Calendar, Users,
  ArrowRight, BookOpen, TrendingUp, Award, Target,
  ChevronRight, Gamepad2, MessageCircle, Plus, Bell,
  Activity, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { gamesApi, sessionsApi, skillsApi } from '../services/api';
import toast from 'react-hot-toast';
 
const levelNames = ['Newcomer', 'Beginner', 'Apprentice', 'Learner', 'Skilled', 'Proficient', 'Expert', 'Master', 'Grandmaster', 'Legend'];
const xpThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
 
// Animated ticker for activity feed
const LIVE_ACTIVITY = [
  { user: 'Priya_Dev', action: 'completed a React session', time: '2m ago', icon: '⚡' },
  { user: 'Arjun_M', action: 'earned the Speed Demon badge', time: '5m ago', icon: '🏆' },
  { user: 'Neha_K', action: 'added Figma to teach', time: '8m ago', icon: '📚' },
  { user: 'Rohan_S', action: 'won 50 coins on spin wheel', time: '12m ago', icon: '🎡' },
  { user: 'Sana_T', action: 'reached Level 5', time: '20m ago', icon: '🚀' },
];
 
const StatCard = ({ label, value, icon: Icon, color, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-700 mt-0.5">{sub}</p>}
  </motion.div>
);
 
export default function Dashboard() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityIdx, setActivityIdx] = useState(0);
  const [greeting, setGreeting] = useState('');
 
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);
 
  useEffect(() => {
    const t = setInterval(() => setActivityIdx(i => (i + 1) % LIVE_ACTIVITY.length), 3000);
    return () => clearInterval(t);
  }, []);
 
  useEffect(() => {
    Promise.all([
      gamesApi.getStats(),
      sessionsApi.getAll(),
      skillsApi.getMy(),
    ]).then(([sRes, sessRes, skillRes]) => {
      setStats(sRes.data.data);
      setSessions(sessRes.data.data.slice(0, 3));
      setMySkills(skillRes.data.data.slice(0, 8));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);
 
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const curr = xpThresholds[Math.min(level - 1, 9)];
  const next = xpThresholds[Math.min(level, 9)];
  const progress = next > curr ? ((xp - curr) / (next - curr)) * 100 : 100;
 
  const statusColor = { pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', confirmed: 'text-green-400 bg-green-400/10 border-green-400/20', completed: 'text-sky-400 bg-sky-400/10 border-sky-400/20', cancelled: 'text-red-400 bg-red-400/10 border-red-400/20' };
 
  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-2 border-sky-500/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-sky-500 rounded-full animate-spin" />
      </div>
    </div>
  );
 
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
 
      {/* ── HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-sky-500/15 via-violet-500/8 to-transparent border border-sky-500/15 rounded-2xl p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.12),transparent_60%)] pointer-events-none" />
 
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-gray-400 text-sm">{greeting} 👋</p>
            <h1 className="text-3xl font-black text-white mt-1">{user?.username}</h1>
            <div className="flex items-center flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Lv.{level} — {levelNames[Math.min(level - 1, 9)]}
              </span>
              {(user?.streakDays || 0) > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30"
                >
                  <Flame className="w-3 h-3" /> {user.streakDays} day streak
                </motion.span>
              )}
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/15 text-yellow-400 border border-yellow-400/20">
                <Coins className="w-3 h-3" /> {(user?.coins || 0).toLocaleString()}
              </span>
            </div>
          </div>
 
          {/* XP Bar */}
          <div className="md:w-64 bg-black/20 rounded-xl p-4 border border-white/5 backdrop-blur-sm shrink-0">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-300 font-medium">{xp.toLocaleString()} XP</span>
              <span className="text-gray-500">Next: {next.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1.5">{Math.max(0, next - xp).toLocaleString()} XP to level {level + 1}</p>
          </div>
        </div>
 
        {/* Live activity ticker */}
        <div className="relative mt-4 pt-4 border-t border-white/5 flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">Live</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activityIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-gray-400 truncate"
            >
              <span className="mr-1">{LIVE_ACTIVITY[activityIdx].icon}</span>
              <span className="text-white font-medium">{LIVE_ACTIVITY[activityIdx].user}</span>
              {' '}{LIVE_ACTIVITY[activityIdx].action}
              <span className="text-gray-600 ml-2">{LIVE_ACTIVITY[activityIdx].time}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
 
      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Sessions Done" value={stats?.sessionsCompleted || 0} icon={Calendar} color="bg-sky-500/15 text-sky-400" delay={0.05} />
        <StatCard label="Coins" value={(user?.coins || 0).toLocaleString()} icon={Coins} color="bg-yellow-400/15 text-yellow-400" delay={0.1} />
        <StatCard label="Badges" value={stats?.achievements || 0} icon={Trophy} color="bg-violet-500/15 text-violet-400" delay={0.15} />
        <StatCard label="Streak" value={`${user?.streakDays || 0}d`} icon={Flame} color="bg-orange-500/15 text-orange-400" delay={0.2} />
      </div>
 
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── LEFT / MAIN ── */}
        <div className="lg:col-span-2 space-y-6">
 
          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '🎯', label: 'Find a Match', sub: 'Connect with peers', path: '/explore', gradient: 'from-sky-500/20 to-sky-600/10 border-sky-500/20 hover:border-sky-500/40' },
                { emoji: '🎮', label: 'Play Games', sub: 'Win XP & coins', path: '/games', gradient: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 hover:border-violet-500/40' },
                { emoji: '📚', label: 'My Skills', sub: 'Add or manage', path: '/profile', gradient: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-emerald-500/40' },
                { emoji: '💬', label: 'Messages', sub: 'Active sessions', path: '/chat', gradient: 'from-pink-500/20 to-pink-600/10 border-pink-500/20 hover:border-pink-500/40' },
              ].map((a, i) => (
                <motion.div key={a.path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={a.path} className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br border transition-all group ${a.gradient}`}>
                    <span className="text-2xl group-hover:scale-110 transition-transform">{a.emoji}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{a.label}</p>
                      <p className="text-xs text-gray-500">{a.sub}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
 
          {/* Sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Sessions</h2>
              <Link to="/sessions" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {sessions.length === 0 ? (
              <div className="bg-gray-900 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                <div className="text-3xl mb-3">📅</div>
                <p className="text-gray-500 text-sm mb-3">No sessions yet — find a match to get started</p>
                <Link to="/explore" className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl transition-colors">
                  Find a Match <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((s, i) => {
                  const isTeacher = s.teacherId === user?.id;
                  const other = isTeacher ? s.learner : s.teacher;
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gray-900 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {other?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{s.skillName}</p>
                        <p className="text-xs text-gray-500">{isTeacher ? 'Teaching' : 'Learning from'} @{other?.username}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusColor[s.status]}`}>
                        {s.status}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">My Skills</h2>
              <Link to="/profile" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {mySkills.map((sk) => (
                <motion.span
                  key={sk.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-default hover:scale-105 transition-transform ${sk.skillType === 'teach' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-violet-500/10 text-violet-400 border-violet-500/20'}`}
                >
                  {sk.skillType === 'teach' ? '📚' : '🎯'} {sk.skillName}
                </motion.span>
              ))}
              <Link to="/profile" className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-gray-400 border border-dashed border-white/10 hover:border-white/20 transition-colors">
                <Plus className="w-3 h-3" /> Add skill
              </Link>
            </div>
          </div>
        </div>
 
        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-4">
          {/* Daily checklist */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" /> Today's Goals
            </h3>
            <div className="space-y-2.5">
              {[
                { icon: '🎯', text: 'Complete a session', reward: '+50 XP', done: (stats?.sessionsCompleted || 0) > 0 },
                { icon: '🎡', text: 'Spin the wheel', reward: '+coins', done: false },
                { icon: '📚', text: 'Add a new skill', reward: '+10 XP', done: mySkills.length > 0 },
                { icon: '⚡', text: 'Play Speed Match', reward: '+30 XP', done: false },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${item.done ? 'bg-green-500/8 border border-green-500/15' : 'bg-gray-800/50 border border-white/5'}`}
                >
                  <span className="text-base">{item.done ? '✅' : item.icon}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${item.done ? 'text-green-400 line-through opacity-60' : 'text-gray-300'}`}>{item.text}</p>
                    <p className="text-xs text-gray-600">{item.reward}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
 
          {/* Spin CTA */}
          <Link to="/games">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-400/15 to-orange-500/10 border border-yellow-400/20 rounded-2xl p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >🎡</motion.span>
                <div>
                  <p className="font-bold text-yellow-400 text-sm">Daily Spin!</p>
                  <p className="text-xs text-gray-500">Win coins & boosts</p>
                </div>
                <ArrowRight className="w-4 h-4 text-yellow-500 ml-auto" />
              </div>
            </motion.div>
          </Link>
 
          {/* Mini leaderboard */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Leaderboard
              </h3>
              <Link to="/leaderboard" className="text-xs text-sky-400 hover:text-sky-300">All →</Link>
            </div>
            <div className="space-y-2">
              {[
                { rank: 1, name: 'Priya_Dev', xp: 4820, medal: '🥇' },
                { rank: 2, name: 'Arjun_M', xp: 4210, medal: '🥈' },
                { rank: 3, name: user?.username || 'You', xp: user?.xp || 0, medal: '🥉', isYou: true },
              ].map((e) => (
                <div key={e.rank} className={`flex items-center gap-3 p-2.5 rounded-xl ${e.isYou ? 'bg-sky-500/8 border border-sky-500/15' : 'hover:bg-gray-800/50'} transition-colors`}>
                  <span className="text-base">{e.medal}</span>
                  <p className={`flex-1 text-xs font-medium truncate ${e.isYou ? 'text-sky-400' : 'text-gray-300'}`}>{e.name} {e.isYou && '(you)'}</p>
                  <span className="text-xs text-gray-600 font-mono">{e.xp.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
 
          {/* Badges */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" /> Badges
              </h3>
              <span className="text-xs text-gray-600">{stats?.achievements || 0}/8</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['🎯', '📚', '🏆', '⚡', '🔥', '👑', '🤝', '⭐'].map((b, i) => (
                <motion.div
                  key={i}
                  whileHover={i < (stats?.achievements || 0) ? { scale: 1.15 } : {}}
                  className={`aspect-square rounded-xl flex items-center justify-center text-lg ${i < (stats?.achievements || 0) ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 shadow-lg shadow-yellow-400/10' : 'bg-gray-800 border border-white/5 grayscale opacity-25'}`}
                >
                  {b}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}