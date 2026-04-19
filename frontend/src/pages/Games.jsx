import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Coins, Target, Timer, Trophy, Clock, RotateCcw, CheckCircle } from 'lucide-react';
import { gamesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
 
// ─── XP BOOST HELPER ────────────────────────────────────────────
const BOOST_KEY = 'xpBoostExpiry';
 
export const getBoostStatus = () => {
  const expiry = localStorage.getItem(BOOST_KEY);
  if (!expiry) return { active: false, remaining: 0 };
  const remaining = Math.max(0, parseInt(expiry) - Date.now());
  return { active: remaining > 0, remaining };
};
 
export const activateBoost = (durationMs = 60 * 60 * 1000) => {
  localStorage.setItem(BOOST_KEY, String(Date.now() + durationMs));
};
 
// ─── MAIN GAMES PAGE ────────────────────────────────────────────
const Games = () => {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white">🎮 Mini Games</h1>
        <p className="text-gray-400 text-sm mt-1">Play games to earn XP and coins!</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <SpinWheel />
        <SpeedMatch />
      </div>
    </div>
  );
};
 
// ─── SPIN WHEEL ─────────────────────────────────────────────────
const SEGMENTS = [
  { label: '5 Coins',    amount: 5,       item: 'coins',       color: '#fbbf24' },
  { label: '10 Coins',   amount: 10,      item: 'coins',       color: '#f59e0b' },
  { label: 'Try Again',  amount: 0,       item: 'nothing',     color: '#6b7280' },
  { label: '20 Coins',   amount: 20,      item: 'coins',       color: '#d97706' },
  { label: 'XP Boost',   amount: 1,       item: 'xp_boost',    color: '#8b5cf6' },
  { label: '30 Coins',   amount: 30,      item: 'coins',       color: '#ea580c' },
  { label: '10 Coins',   amount: 10,      item: 'coins',       color: '#ca8a04' },
  { label: '50 Coins',   amount: 50,      item: 'coins',       color: '#16a34a' },
];
 
const SpinWheel = () => {
  const { fetchUser } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [finalRotation, setFinalRotation] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [canSpin, setCanSpin] = useState(true);
  const [boostStatus, setBoostStatus] = useState(getBoostStatus());
  const boostTimerRef = useRef(null);
 
  useEffect(() => {
    const lastSpin = localStorage.getItem('lastSpinDate');
    setCanSpin(lastSpin !== new Date().toDateString());
 
    // Start boost countdown if active
    startBoostTimer();
    return () => clearInterval(boostTimerRef.current);
  }, []);
 
  const startBoostTimer = () => {
    clearInterval(boostTimerRef.current);
    boostTimerRef.current = setInterval(() => {
      const status = getBoostStatus();
      setBoostStatus(status);
      if (!status.active) clearInterval(boostTimerRef.current);
    }, 1000);
  };
 
  const formatBoostTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m remaining`;
    if (m > 0) return `${m}m ${s}s remaining`;
    return `${s}s remaining`;
  };
 
  const handleSpin = async () => {
    if (spinning || !canSpin) return;
    setSpinning(true);
    setLastResult(null);
 
    // Determine result
    let outcome;
    try {
      const res = await gamesApi.spin();
      outcome = res.data.data.outcome;
    } catch {
      // Demo fallback
      const weights = [30, 25, 3, 15, 5, 8, 25, 4];
      const total = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      let idx = 0;
      for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) { idx = i; break; }
      }
      outcome = { item: SEGMENTS[idx].item, amount: SEGMENTS[idx].amount };
    }
 
    // Find which segment index matches outcome
    let targetIdx = SEGMENTS.findIndex(s =>
      s.item === outcome.item && (outcome.item === 'nothing' || s.amount === outcome.amount || outcome.item === 'xp_boost')
    );
    if (targetIdx < 0) targetIdx = 0;
 
    const numSegments = SEGMENTS.length;
    const segAngle = 360 / numSegments;
    // Each segment i occupies [i*segAngle, (i+1)*segAngle]
    // We want the needle (top = 270deg in CSS) to point at segment targetIdx's center
    // Wheel rotates clockwise: segment 0 starts at 0deg
    // After rotating by R deg clockwise, the top of the wheel shows segment at angle (360 - R) % 360
    const targetAngle = targetIdx * segAngle + segAngle / 2; // center of segment in wheel coords
    const spins = 5 + Math.floor(Math.random() * 3);
    const newRotation = finalRotation + spins * 360 + (360 - targetAngle);
 
    setFinalRotation(newRotation);
 
    // Animate
    setTimeout(() => {
      setRotation(newRotation);
    }, 50);
 
    // After animation (5s)
    setTimeout(() => {
      setSpinning(false);
      setLastResult(outcome);
      setCanSpin(false);
      localStorage.setItem('lastSpinDate', new Date().toDateString());
 
      if (outcome.item === 'coins' && outcome.amount > 0) {
        toast.success(`🪙 You won ${outcome.amount} coins!`);
        fetchUser();
      } else if (outcome.item === 'xp_boost') {
        activateBoost();
        setBoostStatus(getBoostStatus());
        startBoostTimer();
        toast.success('🚀 XP Boost activated for 1 hour!');
        fetchUser();
      } else if (outcome.item === 'streak_freeze') {
        toast.success('❄️ Streak Freeze earned!');
      } else {
        toast('🍀 Better luck tomorrow!', { icon: '😅' });
      }
    }, 5200);
  };
 
  const getResultDisplay = () => {
    if (!lastResult) return null;
    if (lastResult.item === 'coins' && lastResult.amount > 0) return { emoji: '🪙', text: `+${lastResult.amount} Coins!`, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' };
    if (lastResult.item === 'xp_boost') return { emoji: '🚀', text: 'XP Boost Activated! (1 hour)', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' };
    if (lastResult.item === 'streak_freeze') return { emoji: '❄️', text: 'Streak Freeze Earned!', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' };
    return { emoji: '🍀', text: 'Better luck tomorrow!', color: 'text-gray-400', bg: 'bg-gray-700/50 border-white/10' };
  };
 
  const resultDisplay = getResultDisplay();
  const numSegments = SEGMENTS.length;
  const segAngle = 360 / numSegments;
  const radius = 110;
  const cx = 130, cy = 130;
 
  // Build SVG segments
  const buildPath = (i) => {
    const startAngle = (i * segAngle - 90) * (Math.PI / 180);
    const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180);
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };
 
  const buildTextPosition = (i) => {
    const midAngle = ((i + 0.5) * segAngle - 90) * (Math.PI / 180);
    const r = radius * 0.65;
    return {
      x: cx + r * Math.cos(midAngle),
      y: cy + r * Math.sin(midAngle),
      rotate: (i + 0.5) * segAngle,
    };
  };
 
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Daily Spin</h2>
          <p className="text-sm text-gray-400">
            {canSpin ? 'Spin once per day for rewards!' : 'Come back tomorrow! ⏰'}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          canSpin ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400' : 'bg-gray-700/50 border-white/10 text-gray-500'
        }`}>
          <Coins className="w-3.5 h-3.5" />
          {canSpin ? 'Free Spin!' : 'Used'}
        </div>
      </div>
 
      {/* XP Boost Banner */}
      {boostStatus.active && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs">
          <span>🚀</span>
          <span className="text-violet-400 font-semibold">XP Boost Active!</span>
          <span className="text-gray-500 ml-auto">{formatBoostTime(boostStatus.remaining)}</span>
        </motion.div>
      )}
 
      {/* Wheel */}
      <div className="relative flex items-center justify-center mb-5">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ marginTop: '-2px' }}>
          <svg width="24" height="28" viewBox="0 0 24 28">
            <polygon points="12,2 22,26 2,26" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" />
          </svg>
        </div>
 
        {/* SVG Wheel */}
        <motion.svg
          width={cx * 2} height={cy * 2}
          viewBox={`0 0 ${cx * 2} ${cy * 2}`}
          style={{ display: 'block' }}
          animate={{ rotate: rotation }}
          transition={{ duration: spinning ? 5 : 0, ease: [0.1, 0.9, 0.2, 1.0] }}
        >
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r={radius + 6} fill="none" stroke="#374151" strokeWidth="4" />
 
          {/* Segments */}
          {SEGMENTS.map((seg, i) => {
            const tp = buildTextPosition(i);
            return (
              <g key={i}>
                <path d={buildPath(i)} fill={seg.color} stroke="#1f2937" strokeWidth="1.5" />
                <text
                  x={tp.x}
                  y={tp.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${tp.rotate}, ${tp.x}, ${tp.y})`}
                  fontSize="9"
                  fontWeight="bold"
                  fill="white"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {seg.label}
                </text>
              </g>
            );
          })}
 
          {/* Center circle */}
          <circle cx={cx} cy={cy} r={22} fill="#111827" stroke="#374151" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={18} fill="url(#centerGrad)" />
          <defs>
            <radialGradient id="centerGrad">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
          </defs>
        </motion.svg>
 
        {/* Center spin button (overlaid) */}
        <button
          onClick={handleSpin}
          disabled={spinning || !canSpin}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: spinning || !canSpin ? 'none' : 'auto' }}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[10px] transition-transform ${
            canSpin && !spinning ? 'hover:scale-110 cursor-pointer' : ''
          }`}>
            {spinning ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : canSpin ? (
              <span className="text-[9px] font-black text-white drop-shadow">SPIN</span>
            ) : (
              <CheckCircle className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>
      </div>
 
      {/* Spin button (below wheel) */}
      <button
        onClick={handleSpin}
        disabled={spinning || !canSpin}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
          canSpin && !spinning
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 shadow-lg shadow-yellow-400/20'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5'
        }`}
      >
        {spinning ? 'Spinning...' : canSpin ? '🎡 Spin the Wheel!' : '✅ Already spun today'}
      </button>
 
      {/* Result */}
      <AnimatePresence>
        {resultDisplay && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border ${resultDisplay.bg}`}
          >
            <span className="text-2xl">{resultDisplay.emoji}</span>
            <p className={`font-bold text-sm ${resultDisplay.color}`}>{resultDisplay.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
 
// ─── SPEED MATCH ─────────────────────────────────────────────────
const DEMO_SKILLS = [
  { id: 1, name: 'JavaScript', type: 'teach' }, { id: 2, name: 'JavaScript', type: 'learn' },
  { id: 3, name: 'Python',     type: 'teach' }, { id: 4, name: 'Python',     type: 'learn' },
  { id: 5, name: 'React',      type: 'teach' }, { id: 6, name: 'React',      type: 'learn' },
  { id: 7, name: 'Guitar',     type: 'teach' }, { id: 8, name: 'Guitar',     type: 'learn' },
  { id: 9, name: 'Spanish',    type: 'teach' }, { id: 10, name: 'Spanish',   type: 'learn' },
  { id: 11, name: 'Piano',     type: 'teach' }, { id: 12, name: 'Piano',     type: 'learn' },
];
 
const SpeedMatch = () => {
  const { fetchUser } = useAuth();
  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const [gameSkills, setGameSkills] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState(new Set());   // matched skill names
  const [selected, setSelected] = useState([]);         // [{id, name, type}]
  const [flashCorrect, setFlashCorrect] = useState(null);
  const [flashWrong, setFlashWrong] = useState(null);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
 
  const endGame = useCallback(async (finalScore, finalMatched) => {
    clearInterval(timerRef.current);
    setPhase('done');
    const xpEarned = finalScore;
    const coinsEarned = Math.floor(finalScore / 3);
    setResult({ xpEarned, coinsEarned, matchesCount: finalMatched });
    try {
      await gamesApi.submitSpeedMatch({ roundId: `round_${Date.now()}`, matches: [], timeTaken: 30 - timeLeft });
    } catch { /* silent */ }
    fetchUser();
  }, [timeLeft, fetchUser]);
 
  const startGame = async () => {
    let skills = [...DEMO_SKILLS].sort(() => Math.random() - 0.5);
    try {
      const res = await gamesApi.startSpeedMatch();
      if (res.data.data.skills?.length > 0) skills = res.data.data.skills;
    } catch { /* use demo */ }
 
    setGameSkills(skills);
    setPhase('playing');
    setScore(0);
    setMatched(new Set());
    setSelected([]);
    setFlashCorrect(null);
    setFlashWrong(null);
    setResult(null);
    setTimeLeft(30);
 
    clearInterval(timerRef.current);
    let t = 30;
    let localScore = 0;
    let localMatched = 0;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        endGame(localScore, localMatched);
      }
    }, 1000);
  };
 
  useEffect(() => () => clearInterval(timerRef.current), []);
 
  const handleSelect = (skill) => {
    if (phase !== 'playing') return;
    if (matched.has(skill.name)) return;
 
    const alreadySel = selected.find(s => s.id === skill.id);
    if (alreadySel) {
      setSelected(prev => prev.filter(s => s.id !== skill.id));
      return;
    }
    if (selected.length >= 2) return;
 
    const newSel = [...selected, skill];
    setSelected(newSel);
 
    if (newSel.length === 2) {
      const [a, b] = newSel;
      if (a.name === b.name && a.type !== b.type) {
        // Correct match!
        setFlashCorrect(a.name);
        setTimeout(() => setFlashCorrect(null), 600);
        const newMatched = new Set([...matched, a.name]);
        setMatched(newMatched);
        const newScore = score + 15;
        setScore(newScore);
        setSelected([]);
        toast.success(`+15 XP — matched ${a.name}! 🎉`, { duration: 1000 });
      } else {
        // Wrong
        setFlashWrong([a.id, b.id]);
        setTimeout(() => { setFlashWrong(null); setSelected([]); }, 700);
      }
    }
  };
 
  const getCardStyle = (skill) => {
    const isMatched = matched.has(skill.name);
    const isSel = selected.find(s => s.id === skill.id);
    const isFlashCorrect = flashCorrect === skill.name;
    const isFlashWrong = flashWrong?.includes(skill.id);
 
    if (isFlashCorrect) return 'bg-green-500/40 border-green-500 scale-105';
    if (isFlashWrong) return 'bg-red-500/30 border-red-500/60 scale-95';
    if (isMatched) return 'bg-green-500/20 border-green-500/40 opacity-60';
    if (isSel) return 'bg-sky-500/30 border-sky-500 shadow-lg shadow-sky-500/20';
    if (skill.type === 'teach') return 'bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/40';
    return 'bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40';
  };
 
  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-orange-400' : 'text-white';
 
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Speed Match</h2>
          <p className="text-sm text-gray-400">Match teachers with learners!</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-xs font-semibold text-sky-400">
          <Zap className="w-3.5 h-3.5" /> +15 XP/match
        </div>
      </div>
 
      {phase === 'idle' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-sky-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Test Your Matching Skills!</h3>
          <p className="text-gray-400 text-sm mb-2">
            Match <span className="text-sky-400 font-semibold">📚 teachers</span> with{' '}
            <span className="text-violet-400 font-semibold">🎯 learners</span> having the same skill.
          </p>
          <p className="text-gray-600 text-xs mb-6">30 seconds · 15 XP per match</p>
          <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20">
            Start Game
          </button>
        </div>
      )}
 
      {phase === 'playing' && (
        <>
          {/* HUD */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${timeLeft <= 10 ? 'bg-red-500/10 border border-red-500/20' : 'bg-gray-800'}`}>
                <Timer className="w-4 h-4 text-gray-400" />
                <span className={`font-bold text-lg tabular-nums ${timerColor}`}>{timeLeft}s</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/15 rounded-lg">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-yellow-400 tabular-nums">{score}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/15 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-bold text-green-400 tabular-nums">{matched.size}</span>
              </div>
            </div>
          </div>
 
          {/* Timer bar */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-300 ${timeLeft > 10 ? 'bg-sky-500' : 'bg-red-500'}`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
 
          {/* Legend */}
          <div className="flex gap-3 mb-3 text-xs">
            <span className="flex items-center gap-1 text-sky-400"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> 📚 Teacher</span>
            <span className="flex items-center gap-1 text-violet-400"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> 🎯 Learner</span>
            {selected.length > 0 && (
              <span className="ml-auto text-gray-500">Selected: {selected.map(s => s.name).join(' + ')}</span>
            )}
          </div>
 
          {/* Grid */}
          <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto">
            {gameSkills.map((skill) => {
              const name = typeof skill === 'object' ? (skill.name || skill.skillName) : skill;
              const type = typeof skill === 'object' ? skill.type : 'teach';
              const id = skill.id || `${name}-${type}`;
              const s = { id, name, type };
              const isMatched = matched.has(name);
 
              return (
                <motion.button
                  key={id}
                  whileTap={!isMatched ? { scale: 0.95 } : {}}
                  onClick={() => handleSelect(s)}
                  disabled={isMatched}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-150 ${getCardStyle(s)}`}
                >
                  <p className="text-xs font-bold text-white truncate">{name}</p>
                  <p className="text-[10px] mt-0.5">{type === 'teach' ? '📚' : '🎯'}</p>
                  {isMatched && <p className="text-[10px] text-green-400 font-bold">✓</p>}
                </motion.button>
              );
            })}
          </div>
        </>
      )}
 
      {phase === 'done' && result && (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">{result.matchesCount >= 4 ? '🏆' : result.matchesCount >= 2 ? '⭐' : '🎮'}</div>
          <h3 className="text-xl font-bold text-white mb-1">
            {result.matchesCount >= 4 ? 'Amazing!' : result.matchesCount >= 2 ? 'Good job!' : 'Keep practicing!'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">{result.matchesCount} matches in 30 seconds</p>
 
          <div className="flex justify-center gap-4 mb-6">
            <div className="px-4 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
              <p className="text-2xl font-black text-yellow-400">+{result.xpEarned}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
            <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-2xl font-black text-amber-400">+{result.coinsEarned}</p>
              <p className="text-xs text-gray-500">Coins</p>
            </div>
          </div>
 
          <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20">
            Play Again
          </button>
        </div>
      )}
    </motion.div>
  );
};
 
export default Games;