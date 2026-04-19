import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Coins, Target, Timer, Trophy, RotateCcw, CheckCircle, X, Star } from 'lucide-react';
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
  { label: '5 Coins',    amount: 5,  item: 'coins',        color: '#fbbf24' },
  { label: '10 Coins',   amount: 10, item: 'coins',        color: '#f59e0b' },
  { label: 'Try Again',  amount: 0,  item: 'nothing',      color: '#6b7280' },
  { label: '20 Coins',   amount: 20, item: 'coins',        color: '#d97706' },
  { label: 'XP Boost',   amount: 1,  item: 'xp_boost',     color: '#8b5cf6' },
  { label: '30 Coins',   amount: 30, item: 'coins',        color: '#ea580c' },
  { label: '10 Coins',   amount: 10, item: 'coins',        color: '#ca8a04' },
  { label: '50 Coins',   amount: 50, item: 'coins',        color: '#16a34a' },
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
 
    let outcome;
    try {
      const res = await gamesApi.spin();
      outcome = res.data.data.outcome;
    } catch {
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
 
    let targetIdx = SEGMENTS.findIndex(s =>
      s.item === outcome.item && (outcome.item === 'nothing' || s.amount === outcome.amount || outcome.item === 'xp_boost')
    );
    if (targetIdx < 0) targetIdx = 0;
 
    const numSegments = SEGMENTS.length;
    const segAngle = 360 / numSegments;
    const targetAngle = targetIdx * segAngle + segAngle / 2;
    const spins = 5 + Math.floor(Math.random() * 3);
    const newRotation = finalRotation + spins * 360 + (360 - targetAngle);
 
    setFinalRotation(newRotation);
    setTimeout(() => setRotation(newRotation), 50);
 
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
    return { x: cx + r * Math.cos(midAngle), y: cy + r * Math.sin(midAngle), rotate: (i + 0.5) * segAngle };
  };
 
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-white/5 rounded-2xl p-6">
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
 
      {boostStatus.active && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs">
          <span>🚀</span>
          <span className="text-violet-400 font-semibold">XP Boost Active!</span>
          <span className="text-gray-500 ml-auto">{formatBoostTime(boostStatus.remaining)}</span>
        </motion.div>
      )}
 
      <div className="relative flex items-center justify-center mb-5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ marginTop: '-2px' }}>
          <svg width="24" height="28" viewBox="0 0 24 28">
            <polygon points="12,2 22,26 2,26" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" />
          </svg>
        </div>
 
        <motion.svg
          width={cx * 2} height={cy * 2}
          viewBox={`0 0 ${cx * 2} ${cy * 2}`}
          style={{ display: 'block' }}
          animate={{ rotate: rotation }}
          transition={{ duration: spinning ? 5 : 0, ease: [0.1, 0.9, 0.2, 1.0] }}
        >
          <circle cx={cx} cy={cy} r={radius + 6} fill="none" stroke="#374151" strokeWidth="4" />
          {SEGMENTS.map((seg, i) => {
            const tp = buildTextPosition(i);
            return (
              <g key={i}>
                <path d={buildPath(i)} fill={seg.color} stroke="#1f2937" strokeWidth="1.5" />
                <text
                  x={tp.x} y={tp.y}
                  textAnchor="middle" dominantBaseline="middle"
                  transform={`rotate(${tp.rotate}, ${tp.x}, ${tp.y})`}
                  fontSize="9" fontWeight="bold" fill="white"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {seg.label}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={22} fill="#111827" stroke="#374151" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={18} fill="url(#centerGrad)" />
          <defs>
            <radialGradient id="centerGrad">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
          </defs>
        </motion.svg>
 
        <button
          onClick={handleSpin}
          disabled={spinning || !canSpin}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: spinning || !canSpin ? 'none' : 'auto' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold">
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
const DEMO_PAIRS = [
  { name: 'JavaScript' }, { name: 'Python' }, { name: 'React' },
  { name: 'Guitar' }, { name: 'Spanish' }, { name: 'Piano' },
  { name: 'Figma' }, { name: 'SQL' },
];
 
const buildGameDeck = (pairs) => {
  const deck = [];
  pairs.forEach(({ name }) => {
    deck.push({ uid: `${name}-teach`, name, type: 'teach' });
    deck.push({ uid: `${name}-learn`, name, type: 'learn' });
  });
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};
 
const GAME_DURATION = 30;
 
const SpeedMatch = () => {
  const { fetchUser } = useAuth();
  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const [deck, setDeck] = useState([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [matched, setMatched] = useState(new Set());   // matched skill names
  const [selected, setSelected] = useState([]);         // max 2 cards
  const [flashCorrect, setFlashCorrect] = useState(null);
  const [flashWrong, setFlashWrong] = useState(null);
  const [result, setResult] = useState(null);
 
  // Use refs so the interval can always read current values
  const matchedRef = useRef(new Set());
  const scoreRef = useRef(0);
  const timerRef = useRef(null);
 
  const stopGame = useCallback(() => {
    clearInterval(timerRef.current);
    const finalScore = scoreRef.current;
    const finalMatches = matchedRef.current.size;
    setPhase('done');
    setResult({
      xpEarned: finalScore,
      coinsEarned: Math.floor(finalScore / 3),
      matchesCount: finalMatches,
      maxPossible: DEMO_PAIRS.length,
    });
    gamesApi.submitSpeedMatch({ roundId: `round_${Date.now()}`, matches: [], timeTaken: GAME_DURATION - timeLeft })
      .catch(() => {});
    fetchUser();
  }, [fetchUser, timeLeft]);
 
  const startGame = async () => {
    // Reset all state and refs
    matchedRef.current = new Set();
    scoreRef.current = 0;
 
    let pairs = DEMO_PAIRS;
    try {
      const res = await gamesApi.startSpeedMatch();
      if (res.data.data?.skills?.length >= 4) {
        // Build pairs from API skills
        const skillMap = {};
        res.data.data.skills.forEach(s => {
          const name = s.name || s.skillName;
          skillMap[name] = (skillMap[name] || 0) + 1;
        });
        const apiPairs = Object.keys(skillMap).slice(0, 8).map(name => ({ name }));
        if (apiPairs.length >= 3) pairs = apiPairs;
      }
    } catch { /* use demo */ }
 
    const newDeck = buildGameDeck(pairs.slice(0, 8));
    setDeck(newDeck);
    setMatched(new Set());
    setSelected([]);
    setFlashCorrect(null);
    setFlashWrong(null);
    setResult(null);
    setTimeLeft(GAME_DURATION);
    setPhase('playing');
 
    clearInterval(timerRef.current);
    let t = GAME_DURATION;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
        const finalScore = scoreRef.current;
        const finalMatches = matchedRef.current.size;
        setPhase('done');
        setResult({
          xpEarned: finalScore,
          coinsEarned: Math.floor(finalScore / 3),
          matchesCount: finalMatches,
          maxPossible: pairs.slice(0, 8).length,
        });
        gamesApi.submitSpeedMatch({ roundId: `round_${Date.now()}`, matches: [], timeTaken: GAME_DURATION })
          .catch(() => {});
        fetchUser();
      }
    }, 1000);
  };
 
  useEffect(() => () => clearInterval(timerRef.current), []);
 
  const handleSelect = (card) => {
    if (phase !== 'playing') return;
    if (matched.has(card.name)) return;
    if (flashWrong) return; // block during wrong-flash cooldown
 
    // Toggle deselect
    if (selected.find(s => s.uid === card.uid)) {
      setSelected(prev => prev.filter(s => s.uid !== card.uid));
      return;
    }
    if (selected.length >= 2) return;
 
    const newSel = [...selected, card];
    setSelected(newSel);
 
    if (newSel.length === 2) {
      const [a, b] = newSel;
      if (a.name === b.name && a.type !== b.type) {
        // ✅ Correct match
        setFlashCorrect(a.name);
        const newMatched = new Set([...matched, a.name]);
        setMatched(newMatched);
        matchedRef.current = newMatched;
        scoreRef.current += 15;
        setSelected([]);
        toast.success(`+15 XP — matched ${a.name}!`, { duration: 900, id: `match-${a.name}` });
        setTimeout(() => setFlashCorrect(null), 600);
 
        // Auto-end if all matched
        if (newMatched.size === deck.length / 2) {
          setTimeout(() => {
            clearInterval(timerRef.current);
            const finalScore = scoreRef.current;
            const finalMatches = matchedRef.current.size;
            setPhase('done');
            setResult({
              xpEarned: finalScore,
              coinsEarned: Math.floor(finalScore / 3),
              matchesCount: finalMatches,
              maxPossible: deck.length / 2,
            });
            fetchUser();
          }, 400);
        }
      } else {
        // ❌ Wrong
        setFlashWrong([a.uid, b.uid]);
        setTimeout(() => {
          setFlashWrong(null);
          setSelected([]);
        }, 700);
      }
    }
  };
 
  const getCardClass = (card) => {
    const isMatched = matched.has(card.name);
    const isSel = !!selected.find(s => s.uid === card.uid);
    const isFC = flashCorrect === card.name;
    const isFW = flashWrong?.includes(card.uid);
 
    if (isFC) return 'bg-green-500/40 border-green-400 scale-105 shadow-lg shadow-green-500/20';
    if (isFW) return 'bg-red-500/30 border-red-500/70 scale-95 opacity-80';
    if (isMatched) return 'bg-green-500/15 border-green-500/30 opacity-50 cursor-default';
    if (isSel) return card.type === 'teach'
      ? 'bg-sky-500/40 border-sky-400 shadow-lg shadow-sky-500/25 scale-105'
      : 'bg-violet-500/40 border-violet-400 shadow-lg shadow-violet-500/25 scale-105';
    if (card.type === 'teach') return 'bg-sky-500/10 border-sky-500/25 hover:bg-sky-500/20 hover:border-sky-400/50 hover:scale-105';
    return 'bg-violet-500/10 border-violet-500/25 hover:bg-violet-500/20 hover:border-violet-400/50 hover:scale-105';
  };
 
  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-orange-400' : 'text-white';
  const barColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-orange-500' : 'bg-sky-500';
 
  // ── IDLE ──
  if (phase === 'idle') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Speed Match</h2>
            <p className="text-sm text-gray-400">Match teachers with learners!</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-xs font-semibold text-sky-400">
            <Zap className="w-3.5 h-3.5" /> +15 XP/match
          </div>
        </div>
 
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-gradient-to-br from-sky-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-sky-500/20">
            <Target className="w-10 h-10 text-sky-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">How to Play</h3>
          <div className="space-y-2 text-sm text-gray-400 mb-6 text-left max-w-xs mx-auto">
            <div className="flex items-start gap-2">
              <span className="text-sky-400 font-bold shrink-0">1.</span>
              Click a <span className="text-sky-400 font-medium mx-1">📚 Teacher</span> card and a matching <span className="text-violet-400 font-medium mx-1">🎯 Learner</span> card with the same skill.
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sky-400 font-bold shrink-0">2.</span>
              Each correct pair earns <span className="text-yellow-400 font-medium mx-1">+15 XP</span> and <span className="text-amber-400 font-medium mx-1">+5 coins</span>.
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sky-400 font-bold shrink-0">3.</span>
              Match as many pairs as you can in <span className="text-white font-medium mx-1">30 seconds</span>!
            </div>
          </div>
          <button
            onClick={startGame}
            className="px-10 py-3.5 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 hover:scale-105 active:scale-95"
          >
            Start Game 🚀
          </button>
          <p className="text-xs text-gray-600 mt-3">30 seconds · Up to {DEMO_PAIRS.length} pairs</p>
        </div>
      </motion.div>
    );
  }
 
  // ── PLAYING ──
  if (phase === 'playing') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-white/5 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Speed Match</h2>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-xs font-semibold text-sky-400">
            <Zap className="w-3.5 h-3.5" /> +15 XP/match
          </div>
        </div>
 
        {/* HUD */}
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${timeLeft <= 10 ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800 border-white/5'}`}>
            <Timer className={`w-4 h-4 ${timerColor}`} />
            <span className={`font-black text-xl tabular-nums ${timerColor}`}>{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="font-bold text-green-400 tabular-nums text-sm">{matched.size}/{deck.length / 2}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-yellow-400 tabular-nums text-sm">{scoreRef.current} XP</span>
            </div>
          </div>
        </div>
 
        {/* Timer bar */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${barColor}`}
            style={{ width: `${timerPct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
 
        {/* Legend + selection hint */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
              📚 Teacher
            </span>
            <span className="flex items-center gap-1 text-violet-400">
              <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
              🎯 Learner
            </span>
          </div>
          {selected.length === 1 && (
            <span className="text-gray-400 italic">
              Selected: <span className="text-white font-medium">{selected[0].name}</span> — now pick its pair!
            </span>
          )}
        </div>
 
        {/* Card grid */}
        <div className="grid grid-cols-4 gap-2">
          {deck.map((card) => (
            <motion.button
              key={card.uid}
              whileTap={!matched.has(card.name) ? { scale: 0.93 } : {}}
              onClick={() => handleSelect(card)}
              disabled={matched.has(card.name) || !!flashWrong}
              className={`aspect-square rounded-xl border text-center transition-all duration-150 flex flex-col items-center justify-center gap-0.5 p-1.5 ${getCardClass(card)}`}
            >
              <span className="text-base leading-none">
                {matched.has(card.name) ? '✅' : card.type === 'teach' ? '📚' : '🎯'}
              </span>
              <p className="text-[10px] font-bold text-white leading-tight truncate w-full text-center">
                {card.name}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }
 
  // ── DONE ──
  if (phase === 'done' && result) {
    const pct = result.maxPossible > 0 ? (result.matchesCount / result.maxPossible) * 100 : 0;
    const rating = pct === 100 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
    const messages = [
      { emoji: '😅', title: 'Keep Practicing!', sub: 'Try again to improve your score.' },
      { emoji: '⭐', title: 'Not Bad!', sub: 'You\'re getting the hang of it.' },
      { emoji: '🌟', title: 'Great Job!', sub: 'Solid performance!' },
      { emoji: '🏆', title: 'Perfect Match!', sub: 'You matched everything!' },
    ];
    const msg = messages[rating];
 
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Speed Match</h2>
          <span className="text-xs text-gray-500">Game Over</span>
        </div>
 
        {/* Hero result */}
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="text-6xl mb-3"
          >
            {msg.emoji}
          </motion.div>
          <h3 className="text-2xl font-black text-white mb-1">{msg.title}</h3>
          <p className="text-gray-400 text-sm mb-5">{msg.sub}</p>
 
          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15 * i, type: 'spring', stiffness: 300 }}
              >
                <Star
                  className={`w-8 h-8 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
                />
              </motion.div>
            ))}
          </div>
 
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-gray-800 border border-white/5 rounded-xl p-3"
            >
              <p className="text-2xl font-black text-green-400">{result.matchesCount}<span className="text-sm text-gray-500">/{result.maxPossible}</span></p>
              <p className="text-xs text-gray-500 mt-0.5">Pairs Matched</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3"
            >
              <p className="text-2xl font-black text-yellow-400">+{result.xpEarned}</p>
              <p className="text-xs text-gray-500 mt-0.5">XP Earned</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3"
            >
              <p className="text-2xl font-black text-amber-400">+{result.coinsEarned}</p>
              <p className="text-xs text-gray-500 mt-0.5">Coins Earned</p>
            </motion.div>
          </div>
 
          {/* Accuracy bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Accuracy</span>
              <span className="font-semibold text-white">{Math.round(pct)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
 
          <button
            onClick={startGame}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95"
          >
            Play Again 🔄
          </button>
        </div>
      </motion.div>
    );
  }
 
  return null;
};
 
export default Games;