import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Coins, Flame, Trophy, Calendar, Users, 
  TrendingUp, Target, ArrowRight, Star, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { gamesApi, sessionsApi } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, fetchUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        gamesApi.getStats(),
        sessionsApi.getAll()
      ]);
      setStats(statsRes.data.data);
      setSessions(sessionsRes.data.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
  const getLevelName = (level) => {
    const names = ['Newcomer', 'Beginner', 'Apprentice', 'Learner', 'Skilled', 'Proficient', 'Expert', 'Master', 'Grandmaster', 'Legend'];
    return names[Math.min(level - 1, 9)];
  };

  const getLevelColor = (level) => {
    if (level >= 8) return 'from-gold-400 to-gold-600';
    if (level >= 5) return 'from-secondary-400 to-secondary-600';
    if (level >= 3) return 'from-primary-400 to-primary-600';
    return 'from-gray-400 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="text-gradient">{user?.username}!</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">Ready to learn something new today?</p>
        </div>
        <Link to="/games" className="btn-secondary flex items-center gap-2">
          <Zap className="w-5 h-5" /> Play Games
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getLevelColor(user?.level || 1)}`}>
              Level {user?.level || 1}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Experience Points</p>
          <p className="text-2xl font-bold">{user?.xp || 0} XP</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{getLevelName(user?.level || 1)}</span>
              <span>{stats?.nextLevelXp || 0} XP</span>
            </div>
            <div className="xp-bar">
              <div 
                className="xp-bar-fill" 
                style={{ width: `${stats?.levelProgress || 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Coins Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <Link to="/shop" className="text-sm text-gold-400 hover:text-gold-300">Visit Shop →</Link>
          </div>
          <p className="text-gray-400 text-sm mb-1">Your Coins</p>
          <p className="text-2xl font-bold text-gold-400">{user?.coins || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Use coins to unlock rewards!</p>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-orange-400 font-bold text-lg animate-pulse">
              {user?.streakDays || 0} days
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Current Streak</p>
          <p className="text-lg font-semibold">
            {user?.streakDays >= 7 ? '🔥 On fire!' : user?.streakDays >= 3 ? '💪 Keep it up!' : 'Start a streak!'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {user?.streakDays >= 7 ? '7-day bonus active!' : `${7 - (user?.streakDays || 0)} days to bonus`}
          </p>
        </motion.div>

        {/* Sessions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <Link to="/sessions" className="text-sm text-secondary-400 hover:text-secondary-300">View All →</Link>
          </div>
          <p className="text-gray-400 text-sm mb-1">Sessions Completed</p>
          <p className="text-2xl font-bold">{stats?.sessionsCompleted || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            +50 XP per session as teacher
          </p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/explore" className="card-glow flex items-center gap-4 hover:border-primary-500/50 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center">
            <Users className="w-7 h-7 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Find a Match</h3>
            <p className="text-sm text-gray-400">Discover skill partners</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>

        <Link to="/games" className="card-glow flex items-center gap-4 hover:border-secondary-500/50 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-secondary-500/20 flex items-center justify-center">
            <Target className="w-7 h-7 text-secondary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Speed Match Game</h3>
            <p className="text-sm text-gray-400">Win coins & XP</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>

        <Link to="/shop" className="card-glow flex items-center gap-4 hover:border-gold-500/50 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-gold-400/20 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-gold-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Daily Spin</h3>
            <p className="text-sm text-gray-400">Win free rewards!</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>
      </div>

      {/* Recent Sessions & Leaderboard Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Upcoming Sessions</h2>
            <Link to="/sessions" className="text-sm text-primary-400 hover:text-primary-300">View All</Link>
          </div>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No upcoming sessions</p>
              <Link to="/explore" className="text-primary-400 text-sm hover:underline">
                Find a match to schedule one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <span className="text-lg">📚</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{session.skillName}</p>
                    <p className="text-sm text-gray-400">
                      with {session.teacherId === user?.id ? session.learner?.username : session.teacher?.username}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    session.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Leaderboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Learners</h2>
            <Link to="/leaderboard" className="text-sm text-primary-400 hover:text-primary-300">Full Rankings</Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((rank) => (
              <div key={rank} className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  rank === 1 ? 'bg-gold-400 text-gray-900' :
                  rank === 2 ? 'bg-gray-300 text-gray-900' :
                  rank === 3 ? 'bg-amber-600 text-white' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {rank}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  {String.fromCharCode(64 + rank)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">User_{rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-400">{5000 - (rank * 300)} XP</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Achievement Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card bg-gradient-to-r from-primary-500/10 to-secondary-500/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Your Achievements</h2>
            <p className="text-sm text-gray-400">{stats?.achievements || 0} unlocked</p>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="achievement-badge">🎯</div>
          <div className="achievement-badge opacity-50 grayscale">🏆</div>
          <div className="achievement-badge opacity-50 grayscale">⭐</div>
          <div className="achievement-badge opacity-50 grayscale">🔥</div>
          <div className="achievement-badge opacity-50 grayscale">👑</div>
        </div>
        <p className="text-sm text-gray-400 mt-4">Complete more sessions to unlock achievements!</p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
