import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, Coins, Target, Timer, Trophy, Flame } from 'lucide-react';
import { gamesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Games = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🎮 Mini Games</h1>
        <p className="text-gray-400">Play games to earn XP and coins!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SpinWheel />
        <SpeedMatch />
      </div>
    </div>
  );
};

const SpinWheel = () => {
  const { fetchUser } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const segments = [
    { label: '5 Coins', value: 5, color: '#fbbf24', icon: '🪙' },
    { label: '10 Coins', value: 10, color: '#f59e0b', icon: '🪙' },
    { label: '20 Coins', value: 20, color: '#d97706', icon: '💰' },
    { label: 'Try Again', value: 0, color: '#6b7280', icon: '🍀' },
    { label: '30 Coins', value: 30, color: '#ea580c', icon: '💎' },
    { label: '10 Coins', value: 10, color: '#ca8a04', icon: '🪙' },
    { label: 'XP Boost', value: 'boost', color: '#8b5cf6', icon: '🚀' },
    { label: '50 Coins', value: 50, color: '#16a34a', icon: '🏆' },
  ];

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setLastResult(null);

    try {
      const response = await gamesApi.spin();
      const wonItem = response.data.data.outcome;
      
      // Calculate winning segment index
      const winningIndex = segments.findIndex(s => 
        s.value === wonItem.amount || (wonItem.item === 'xp_boost' && s.value === 'boost')
      );
      
      // Calculate rotation (multiple full spins + target segment)
      const segmentAngle = 360 / segments.length;
      const targetAngle = 360 - (winningIndex * segmentAngle) - (segmentAngle / 2);
      const spins = 5 + Math.random() * 3; // 5-8 full rotations
      const finalRotation = rotation + (spins * 360) + targetAngle;
      
      setRotation(finalRotation);
      setLastResult(wonItem);
      
      toast.success(response.data.message);
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Spin failed');
      setSpinning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">🎡 Daily Spin</h2>
          <p className="text-sm text-gray-400">Spin once per day for rewards!</p>
        </div>
        <div className="flex items-center gap-2 text-gold-400">
          <Coins className="w-5 h-5" />
          <span className="font-bold">Free Daily</span>
        </div>
      </div>

      {/* Wheel */}
      <div className="relative w-72 h-72 mx-auto mb-6">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-primary-500" 
               style={{ borderTopWidth: '20px' }} />
        </div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-8 border-gray-700 relative overflow-hidden"
          style={{
            background: `conic-gradient(from 0deg, ${segments.map((s, i) => 
              `${s.color} ${(i * 100) / segments.length}% ${((i + 1) * 100) / segments.length}%`
            ).join(', ')})`,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
          }}
          animate={{ rotate: rotation }}
          transition={{ duration: spinning ? 5 : 0, ease: [0.17, 0.67, 0.12, 0.99] }}
          onAnimationComplete={() => setSpinning(false)}
        >
          {segments.map((segment, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 origin-bottom"
              style={{
                transform: `rotate(${i * (360 / segments.length)}deg) translateY(-50%)`,
                width: '50%',
                height: '50%'
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
                   style={{ transform: 'rotate(90deg) translateX(40%)', transformOrigin: 'left bottom' }}>
                <span className="text-xl">{segment.icon}</span>
                <span className="text-xs font-bold text-white drop-shadow-lg">{segment.label}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Center button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSpin}
            disabled={spinning}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 
                       flex items-center justify-center text-white font-bold shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? (
              <RotateCcw className="w-8 h-8 animate-spin" />
            ) : (
              <span className="text-sm">SPIN</span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {lastResult && !spinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-4 bg-gold-400/20 rounded-xl border border-gold-400/30"
          >
            <p className="text-gold-400 font-bold text-lg">
              {lastResult.item === 'coins' && `+${lastResult.amount} Coins! 🪙`}
              {lastResult.item === 'xp_boost' && 'XP Boost Activated! 🚀'}
              {lastResult.item === 'streak_freeze' && 'Streak Freeze Earned! ❄️'}
              {lastResult.item === 'nothing' && 'Better luck next time! 🍀'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SpeedMatch = () => {
  const { fetchUser } = useAuth();
  const [gameActive, setGameActive] = useState(false);
  const [skills, setSkills] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const startGame = async () => {
    try {
      const response = await gamesApi.startSpeedMatch();
      setSkills(response.data.data.skills);
      setGameActive(true);
      setGameStarted(true);
      setScore(0);
      setMatches([]);
      setSelected([]);
      setTimeLeft(30);
      setResult(null);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to start game. Add more skills first!');
    }
  };

  const endGame = async () => {
    clearInterval(timerRef.current);
    setGameActive(false);

    try {
      const response = await gamesApi.submitSpeedMatch({
        roundId: `round_${Date.now()}`,
        matches,
        timeTaken: 30 - timeLeft
      });
      setResult(response.data.data);
      toast.success(response.data.message);
      fetchUser();
    } catch (error) {
      console.error('Failed to submit game:', error);
    }
  };

  const handleSelect = (skill) => {
    if (!gameActive) return;
    
    const newSelected = [...selected, skill];
    setSelected(newSelected);

    // Check if match (teach + learn same skill)
    if (newSelected.length === 2) {
      if (newSelected[0].name === newSelected[1].name && newSelected[0].type !== newSelected[1].type) {
        setMatches(prev => [...prev, newSelected[0].name]);
        setScore(prev => prev + 15);
        toast.success(`Match! +15 points`);
      }
      setSelected([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">⚡ Speed Match</h2>
          <p className="text-sm text-gray-400">Match teachers with learners!</p>
        </div>
        <div className="flex items-center gap-2 text-primary-400">
          <Zap className="w-5 h-5" />
          <span className="font-bold">+15 XP/win</span>
        </div>
      </div>

      {!gameStarted ? (
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Test Your Matching Skills!</h3>
          <p className="text-gray-400 mb-4">Match teachers with learners as fast as you can.</p>
          <button onClick={startGame} className="btn-primary">
            Start Game
          </button>
        </div>
      ) : gameActive ? (
        <>
          {/* Timer */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-secondary-400" />
              <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-400" />
              <span className="font-bold text-gold-400">{score} pts</span>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {skills.map((skill) => {
              const isMatched = matches.includes(skill.name);
              const isSelected = selected.find(s => s.id === skill.id);
              
              return (
                <motion.button
                  key={skill.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(skill)}
                  disabled={isMatched}
                  className={`p-3 rounded-xl text-center transition-all ${
                    isMatched 
                      ? 'bg-green-500/30 border-2 border-green-500' 
                      : isSelected
                      ? 'bg-primary-500/30 border-2 border-primary-500'
                      : skill.type === 'teach'
                      ? 'bg-primary-500/20 hover:bg-primary-500/30 border-2 border-transparent'
                      : 'bg-secondary-500/20 hover:bg-secondary-500/30 border-2 border-transparent'
                  }`}
                >
                  <p className="text-xs font-medium truncate">{skill.name}</p>
                  <p className="text-[10px] text-gray-400">{skill.type === 'teach' ? '👨‍🏫' : '👨‍🎓'}</p>
                  {isMatched && <span className="text-green-400 text-xs">✓</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Selected */}
          <div className="flex items-center justify-center gap-2 p-2 bg-gray-700/50 rounded-lg">
            {selected.length === 0 && <span className="text-gray-500 text-sm">Select two skills to match</span>}
            {selected.map(s => (
              <span key={s.id} className="px-2 py-1 bg-primary-500/30 rounded text-sm">
                {s.name}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold mb-2">Game Over!</h3>
          <p className="text-2xl font-bold text-gold-400 mb-2">
            Score: {score} points
          </p>
          {result && (
            <p className="text-gray-400 mb-4">
              +{result.xpEarned} XP, +{result.coinsEarned} coins
            </p>
          )}
          <button onClick={startGame} className="btn-primary mt-4">
            Play Again
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Games;
