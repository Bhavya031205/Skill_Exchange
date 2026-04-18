import { useState, useRef, useEffect } from 'react';
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
  const [spinCount, setSpinCount] = useState(0);
  const [canSpin, setCanSpin] = useState(true);

  useEffect(() => {
    const lastSpin = localStorage.getItem('lastSpinDate');
    const today = new Date().toDateString();
    setCanSpin(lastSpin !== today);
    if (lastSpin !== today) {
      setSpinCount(0);
    }
  }, []);

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
    if (spinning || !canSpin) return;
    setSpinning(true);
    setLastResult(null);

    try {
      const response = await gamesApi.spin();
      const wonItem = response.data.data.outcome;
      
      const winningIndex = segments.findIndex(s => 
        s.value === wonItem.amount || (wonItem.item === 'xp_boost' && s.value === 'boost')
      );
      
      const segmentAngle = 360 / segments.length;
      const targetAngle = 360 - (winningIndex * segmentAngle) - (segmentAngle / 2);
      const spins = 5 + Math.random() * 3;
      const finalRotation = rotation + (spins * 360) + targetAngle;
      
      setRotation(finalRotation);
      setLastResult(wonItem);
      setSpinCount(1);
      localStorage.setItem('lastSpinDate', new Date().toDateString());
      setCanSpin(false);
      
      toast.success(response.data.data.message || response.data.message);
      fetchUser();
    } catch (error) {
      const demoItems = [
        { item: 'coins', amount: 10 },
        { item: 'coins', amount: 20 },
        { item: 'coins', amount: 5 },
        { item: 'nothing', amount: 0 },
      ];
      const wonItem = demoItems[Math.floor(Math.random() * demoItems.length)];
      
      const winningIndex = segments.findIndex(s => 
        typeof wonItem.amount === 'number' ? s.value === wonItem.amount : s.value === 'boost'
      );
      
      const segmentAngle = 360 / segments.length;
      const targetAngle = 360 - (winningIndex * segmentAngle) - (segmentAngle / 2);
      const spins = 5 + Math.random() * 3;
      const finalRotation = rotation + (spins * 360) + targetAngle;
      
      setRotation(finalRotation);
      setLastResult(wonItem);
      setSpinCount(1);
      localStorage.setItem('lastSpinDate', new Date().toDateString());
      setCanSpin(false);
    }
  };

  const getResultText = (result) => {
    if (!result) return '';
    if (result.item === 'coins') return `+${result.amount} Coins`;
    if (result.item === 'xp_boost') return 'XP Boost Activated!';
    if (result.item === 'streak_freeze') return 'Streak Freeze Earned!';
    return 'Try Again!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Daily Spin</h2>
          <p className="text-sm text-gray-400">{canSpin ? 'Spin once per day for rewards!' : 'Come back tomorrow!'}</p>
        </div>
        <div className="flex items-center gap-2 text-yellow-400">
          <Coins className="w-5 h-5" />
          <span className="font-bold">{canSpin ? 'Free Daily' : 'Used'}</span>
        </div>
      </div>

      <div className="relative w-64 h-64 mx-auto mb-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-6 border-r-6 border-t-10 border-l-transparent border-r-transparent border-t-yellow-400" />
        </div>

        <motion.div
          className="w-full h-full rounded-full border-4 border-gray-700 relative overflow-hidden"
          style={{
            background: `conic-gradient(from 0deg, ${segments.map((s, i) => 
              `${s.color} ${(i * 100) / segments.length}% ${((i + 1) * 100) / segments.length}%`
            ).join(', ')})`,
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
              <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center"
                   style={{ transform: 'rotate(90deg) translateX(35%)', transformOrigin: 'left bottom' }}>
                <span className="text-lg">{segment.icon}</span>
                <span className="text-[9px] font-bold text-white drop-shadow-md bg-black/30 px-1 rounded">{segment.label}</span>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSpin}
            disabled={spinning || !canSpin}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-violet-600 
                       flex items-center justify-center text-white font-bold text-xs shadow-xl
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {spinning ? (
              <RotateCcw className="w-6 h-6 animate-spin" />
            ) : canSpin ? (
              'SPIN'
            ) : (
              'Done'
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {lastResult && !spinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/30"
          >
            <p className="text-yellow-400 font-bold text-lg">
              {getResultText(lastResult)}
            </p>
            {lastResult.item === 'coins' && <span className="text-2xl">🪙</span>}
            {lastResult.item === 'xp_boost' && <span className="text-2xl">🚀</span>}
            {lastResult.item === 'nothing' && <span className="text-2xl">🍀</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SpeedMatch = () => {
  const { fetchUser } = useAuth();
  const [gameActive, setGameActive] = useState(false);
  const [gameSkills, setGameSkills] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const timerRef = useRef(null);

  const generateGameSkills = () => {
    const allSkills = [
      { id: 1, name: 'JavaScript', type: 'teach' },
      { id: 2, name: 'JavaScript', type: 'learn' },
      { id: 3, name: 'Python', type: 'teach' },
      { id: 4, name: 'Python', type: 'learn' },
      { id: 5, name: 'React', type: 'teach' },
      { id: 6, name: 'React', type: 'learn' },
      { id: 7, name: 'Guitar', type: 'teach' },
      { id: 8, name: 'Guitar', type: 'learn' },
      { id: 9, name: 'Spanish', type: 'teach' },
      { id: 10, name: 'Spanish', type: 'learn' },
      { id: 11, name: 'Piano', type: 'teach' },
      { id: 12, name: 'Piano', type: 'learn' },
    ];
    return allSkills.sort(() => Math.random() - 0.5);
  };

  const startGame = async () => {
    try {
      const response = await gamesApi.startSpeedMatch();
      setGameSkills(response.data.data.skills || generateGameSkills());
      setLoadingError(null);
    } catch (error) {
      setGameSkills(generateGameSkills());
      setLoadingError(null);
    }
    setGameActive(true);
    setGameStarted(true);
    setScore(0);
    setMatches([]);
    setSelected([]);
    setTimeLeft(30);
    setResult(null);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = async () => {
    clearInterval(timerRef.current);
    setGameActive(false);

    const xpEarned = matches.length * 15;
    const coinsEarned = matches.length * 5;

    setResult({
      xpEarned,
      coinsEarned,
      matchesCount: matches.length
    });

    try {
      await gamesApi.submitSpeedMatch({
        roundId: `round_${Date.now()}`,
        matches,
        timeTaken: 30 - timeLeft
      });
    } catch (error) {
      // Continue even if API fails
    }
    fetchUser();
  };

  const handleSelect = (skill) => {
    if (!gameActive) return;
    
    const skillKey = `${skill.name}-${skill.type}`;
    if (matches.includes(skill.name)) return;
    
    const newSelected = [...selected, skillKey];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      const firstKey = first.split('-')[0];
      const secondKey = second.split('-')[0];
      
      if (firstKey === secondKey && !matches.includes(firstKey)) {
        setMatches(prev => [...prev, firstKey]);
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
          <h2 className="text-xl font-bold text-white">Speed Match</h2>
          <p className="text-sm text-gray-400">Match teachers with learners!</p>
        </div>
        <div className="flex items-center gap-2 text-sky-400">
          <Zap className="w-5 h-5" />
          <span className="font-bold text-sm">+15 XP/win</span>
        </div>
      </div>

      {!gameStarted ? (
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-sky-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Test Your Matching Skills!</h3>
          <p className="text-gray-400 mb-4">Match teachers (📚) with learners (🎯) having the same skill.</p>
          <button onClick={startGame} className="btn-primary">
            Start Game
          </button>
        </div>
      ) : gameActive ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-violet-400" />
              <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-lg text-yellow-400">{score}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 max-h-64 overflow-y-auto">
            {gameSkills.map((skill) => {
              const skillName = typeof skill === 'object' ? skill.name : skill;
              const skillType = typeof skill === 'object' ? skill.type : skill.includes('-') ? skill.split('-')[1] : 'teach';
              const isMatched = matches.includes(skillName);
              const isSelected = selected.some(s => s === `${skillName}-${skillType}`);
              
              return (
                <motion.button
                  key={skill.id || skillName}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect({ name: skillName, type: skillType, id: skill.id || skillName })}
                  disabled={isMatched}
                  className={`p-2.5 rounded-lg text-center transition-all ${
                    isMatched 
                      ? 'bg-green-500/30 border-2 border-green-500' 
                      : isSelected
                      ? 'bg-sky-500/30 border-2 border-sky-500'
                      : skillType === 'teach'
                      ? 'bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30'
                      : 'bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30'
                  }`}
                >
                  <p className="text-xs font-medium text-white truncate">{skillName}</p>
                  <p className="text-[10px] text-gray-400">{skillType === 'teach' ? '📚' : '🎯'}</p>
                  {isMatched && <span className="text-green-400 text-xs block">✓</span>}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 p-3 bg-gray-800/50 rounded-lg min-h-[48px]">
            {selected.length === 0 ? (
              <span className="text-gray-500 text-sm">Select two skills to match</span>
            ) : (
              selected.map(s => {
                const [name, type] = s.split('-');
                return (
                  <span key={s} className="px-3 py-1.5 bg-sky-500/30 rounded-lg text-sm text-white flex items-center gap-2">
                    {name} <span className="text-gray-400">{type === 'teach' ? '📚' : '🎯'}</span>
                  </span>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold text-white mb-2">Game Over!</h3>
          <p className="text-2xl font-bold text-yellow-400 mb-2">
            Score: {score}
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
