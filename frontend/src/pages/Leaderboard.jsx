import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame, Star, Coins } from 'lucide-react';
import { gamesApi } from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [type, setType] = useState('xp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await gamesApi.getLeaderboard({ type });
      setLeaderboard(response.data.data.leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'xp', label: 'Top XP', icon: Trophy },
    { value: 'coins', label: 'Most Coins', icon: Coins },
    { value: 'streak', label: 'Best Streak', icon: Flame },
    { value: 'rating', label: 'Highest Rated', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="w-8 h-8 text-gold-400" />
          Leaderboard
        </h1>
        <p className="text-gray-400">See how you rank against other learners</p>
      </div>

      {/* Type Selector */}
      <div className="flex gap-2">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setType(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              type === option.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <option.icon className="w-4 h-4 inline mr-1" />
            {option.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 0, 2].map((index) => {
          const user = leaderboard[index];
          if (!user) return <div key={index} />;
          
          const podiumHeight = index === 1 ? 'h-48' : index === 0 ? 'h-40' : 'h-32';
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card text-center ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}
            >
              <div className="relative">
                <span className="absolute -top-2 -right-2 text-2xl">{medal}</span>
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xl font-bold mb-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.username?.[0]?.toUpperCase()
                  )}
                </div>
                <h3 className="font-bold truncate">{user.username}</h3>
                <p className="text-sm text-gray-400">Level {user.level}</p>
                <div className={`${podiumHeight} mt-4 bg-gradient-to-t from-primary-500/30 to-transparent rounded-b-lg flex items-end justify-center pb-2`}>
                  <span className="text-2xl font-bold text-primary-400">
                    {type === 'xp' && `${user.xp} XP`}
                    {type === 'coins' && `🪙 ${user.coins}`}
                    {type === 'streak' && `🔥 ${user.streakDays}d`}
                    {type === 'rating' && `⭐ ${user.rating?.toFixed(1)}`}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Rankings</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-primary-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-700/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  user.rank <= 3 ? 'bg-gold-400/20 text-gold-400' : 'bg-gray-700 text-gray-400'
                }`}>
                  {user.rank <= 3 ? user.rank : user.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-sm font-bold">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-400">Level {user.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-400">
                    {type === 'xp' && `${user.xp} XP`}
                    {type === 'coins' && `🪙 ${user.coins}`}
                    {type === 'streak' && `🔥 ${user.streakDays}d`}
                    {type === 'rating' && `⭐ ${user.rating?.toFixed(1)}`}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
