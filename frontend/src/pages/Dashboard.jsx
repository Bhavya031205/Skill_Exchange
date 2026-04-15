import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Coins, Flame, Trophy, Calendar, Users,
  ArrowRight, Star, Clock, Plus, BookOpen,
  TrendingUp, Award, Target, ChevronRight,
  Gamepad2, MessageCircle, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { gamesApi, sessionsApi, skillsApi } from '../services/api';
import toast from 'react-hot-toast';
 
const levelNames = [
  'Newcomer', 'Beginner', 'Apprentice', 'Learner',
  'Skilled', 'Proficient', 'Expert', 'Master', 'Grandmaster', 'Legend'
];
 
const xpThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
 
const Dashboard = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    loadDashboardData();
  }, []);
 
  const loadDashboardData = async () => {
    try {
      const [statsRes, sessionsRes, skillsRes] = await Promise.all([
        gamesApi.getStats(),
        sessionsApi.getAll(),
        skillsApi.getMy()
      ]);
      setStats(statsRes.data.data);
      setSessions(sessionsRes.data.data.slice(0, 4));
      setMySkills(skillsRes.data.data.slice(0, 6));
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };
 
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const currThreshold = xpThresholds[Math.min(level - 1, 9)];
  const nextThreshold = xpThresholds[Math.min(level, 9)];
  const levelProgress = nextThreshold > currThreshold
    ? Math.round(((xp - currThreshold) / (nextThreshold - currThreshold)) * 100)
    : 100;
 
  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    confirmed: 'text-green-400 bg-green-400/10 border-green-400/20',
    completed: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  };
 
  const todayActivity = [
    { icon: '🎯', text: 'Complete a session', reward: '+50 XP', done: (stats?.sessionsCompleted || 0) > 0 },
    { icon: '🎡', text: 'Daily spin wheel', reward: '+coins', done: false },
    { icon: '📚', text: 'Add a new skill', reward: '+10 XP', done: mySkills.length > 0 },
    { icon: '⚡', text: 'Play Speed Match', reward: '+30 XP', done: false },
  ];
 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500/20 via-violet-500/10 to-transparent border border-sky-500/20 p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.15),transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-gray-400 text-sm font-medium">Welcome back 👋</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
              {user?.username}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Lv. {level} — {levelNames[Math.min(level - 1, 9)]}
              </span>
              {(user?.streakDays || 0) > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Flame className="w-3 h-3" /> {user.streakDays} day streak
                </span>
              )}
            </div>
          </div>
 
          {/* XP Progress */}
          <div className="md:w-72 bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/5">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-medium text-white">{xp.toLocaleString()} XP</span>
              <span className="text-xs text-gray-400">Next: {nextThreshold.toLocaleString()} XP</span>
            </div>
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, levelProgress)}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.max(0, nextThreshold - xp).toLocaleString()} XP to Level {level + 1}
            </p>
          </div>
        </div>
      </motion.div>
 
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Sessions Done', value: stats?.sessionsCompleted || 0, icon: Calendar, color: 'sky', sub: 'Total completed' },
          { label: 'Coins Earned', value: (user?.coins || 0).toLocaleString(), icon: Coins, color: 'yellow', sub: 'Available to spend' },
          { label: 'Achievements', value: stats?.achievements || 0, icon: Trophy, color: 'violet', sub: 'Badges unlocked' },
          { label: 'Best Streak', value: `${user?.streakDays || 0}d`, icon: Flame, color: 'orange', sub: 'Consecutive days' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-gray-900 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/15 flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>
 
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-400" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: 'Find a Match', sub: 'Connect with peers', path: '/explore', color: 'from-sky-500 to-sky-600', emoji: '🎯' },
                { icon: Gamepad2, label: 'Play Games', sub: 'Win XP & coins', path: '/games', color: 'from-violet-500 to-violet-600', emoji: '🎮' },
                { icon: BookOpen, label: 'My Skills', sub: 'Add or manage', path: '/profile#skills', color: 'from-emerald-500 to-emerald-600', emoji: '📚' },
                { icon: MessageCircle, label: 'My Chats', sub: 'Active sessions', path: '/chat', color: 'from-pink-500 to-pink-600', emoji: '💬' },
              ].map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group flex items-center gap-3 p-4 bg-gray-900 border border-white/5 rounded-2xl hover:border-white/10 hover:bg-gray-800/50 transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform`}>
                    {action.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">{action.label}</p>
                    <p className="text-xs text-gray-500 truncate">{action.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
 
          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" /> Upcoming Sessions
              </h2>
              <Link to="/sessions" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {sessions.length === 0 ? (
              <div className="bg-gray-900 border border-white/5 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📅</div>
                <p className="text-gray-400 font-medium">No sessions yet</p>
                <p className="text-gray-600 text-sm mt-1 mb-4">Find a skill match to get started</p>
                <Link to="/explore" className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">
                  Find a Match <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => {
                  const isTeacher = session.teacherId === user?.id;
                  const other = isTeacher ? session.learner : session.teacher;
                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 p-4 bg-gray-900 border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {other?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{session.skillName}</p>
                        <p className="text-xs text-gray-500">
                          {isTeacher ? 'Teaching' : 'Learning from'} @{other?.username}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusColors[session.status]}`}>
                          {session.status}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(session.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* My Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" /> My Skills
              </h2>
              <Link to="/profile#skills" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
                Manage <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {mySkills.length === 0 ? (
              <div className="bg-gray-900 border border-dashed border-white/10 rounded-2xl p-6 text-center">
                <p className="text-gray-500 text-sm mb-3">No skills added yet. Add what you can teach or want to learn!</p>
                <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300">
                  <Plus className="w-4 h-4" /> Add your first skill
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {mySkills.map((skill) => (
                  <span
                    key={skill.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                      skill.skillType === 'teach'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    }`}
                  >
                    <span className="text-xs">{skill.skillType === 'teach' ? '📚' : '🎯'}</span>
                    {skill.skillName}
                    <span className="opacity-60 text-xs">{'•'.repeat(skill.proficiency || 1)}</span>
                  </span>
                ))}
                <Link
                  to="/profile"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-300 border border-dashed border-white/10 hover:border-white/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add skill
                </Link>
              </div>
            )}
          </div>
        </div>
 
        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Checklist */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-lg">✅</span> Today's Goals
            </h3>
            <div className="space-y-3">
              {todayActivity.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    item.done ? 'bg-green-500/10 border border-green-500/20' : 'bg-gray-800/50 border border-white/5'
                  }`}
                >
                  <span className="text-lg">{item.done ? '✅' : item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.done ? 'text-green-400 line-through opacity-70' : 'text-gray-300'}`}>
                      {item.text}
                    </p>
                    <p className="text-xs text-gray-500">{item.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          {/* Daily Spin CTA */}
          <Link to="/games" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎡</div>
                <div>
                  <p className="font-bold text-yellow-400">Spin the Wheel!</p>
                  <p className="text-xs text-gray-400">Free daily spin — win coins & boosts</p>
                </div>
                <ArrowRight className="w-5 h-5 text-yellow-400 ml-auto" />
              </div>
            </motion.div>
          </Link>
 
          {/* Leaderboard Sneak */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Leaderboard
              </h3>
              <Link to="/leaderboard" className="text-xs text-sky-400">View all</Link>
            </div>
            <div className="space-y-2">
              {[
                { rank: 1, name: 'Priya_Dev', xp: 4820, medal: '🥇' },
                { rank: 2, name: 'Arjun_Music', xp: 4210, medal: '🥈' },
                { rank: 3, name: user?.username || 'You', xp: user?.xp || 0, medal: '🥉', isYou: true },
              ].map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-2.5 rounded-xl ${entry.isYou ? 'bg-sky-500/10 border border-sky-500/20' : 'hover:bg-gray-800/50'} transition-colors`}
                >
                  <span className="text-lg w-6">{entry.medal}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${entry.isYou ? 'text-sky-400' : 'text-gray-300'}`}>
                      {entry.name} {entry.isYou && '(you)'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{entry.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </div>
 
          {/* Achievement preview */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" /> Badges
              </h3>
              <span className="text-xs text-gray-500">{stats?.achievements || 0} earned</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['🎯', '📚', '🏆', '⚡', '🔥', '👑', '🤝', '⭐'].map((badge, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xl ${
                    i < (stats?.achievements || 0)
                      ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30'
                      : 'bg-gray-800 border border-white/5 grayscale opacity-30'
                  }`}
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Dashboard;