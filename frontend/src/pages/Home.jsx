import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Zap, Users, Trophy, Gamepad2, ArrowRight, Star, Coins, Flame, ChevronDown, Sparkles, CheckCircle } from 'lucide-react';
 
// Animated number counter
const Counter = ({ to, suffix = '', duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
 
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);
 
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};
 
// Floating skill pill
const SkillPill = ({ label, color, delay, x, y }) => (
  <motion.div
    className={`absolute px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${color}`}
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: [0, 1, 1, 0], y: [-10, -20, -30, -40], scale: [0.8, 1, 1, 0.8] }}
    transition={{ duration: 4, delay, repeat: Infinity, repeatDelay: 3 + Math.random() * 4 }}
  >
    {label}
  </motion.div>
);
 
const FLOATING_SKILLS = [
  { label: '⚛️ React', color: 'bg-sky-500/20 border-sky-500/30 text-sky-300', x: 8, y: 30, delay: 0 },
  { label: '🎸 Guitar', color: 'bg-violet-500/20 border-violet-500/30 text-violet-300', x: 75, y: 20, delay: 1.2 },
  { label: '🎨 Figma', color: 'bg-pink-500/20 border-pink-500/30 text-pink-300', x: 85, y: 55, delay: 0.6 },
  { label: '🌍 Spanish', color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', x: 5, y: 65, delay: 1.8 },
  { label: '📊 Excel', color: 'bg-orange-500/20 border-orange-500/30 text-orange-300', x: 65, y: 75, delay: 2.4 },
  { label: '🎬 Video', color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300', x: 20, y: 80, delay: 0.9 },
];
 
const TESTIMONIALS = [
  { name: 'Priya S.', role: 'CS Student', text: 'Learned React in 2 weeks teaching math to 3 people. Insane value.', avatar: 'P', xp: 2840 },
  { name: 'Arjun M.', role: 'Music Grad', text: 'Traded guitar lessons for Python skills. My startup thanks SkillSwap.', avatar: 'A', xp: 4210 },
  { name: 'Neha K.', role: 'Designer', text: 'Found my UI/UX mentor here. Leveled up faster than any bootcamp.', avatar: 'N', xp: 1920 },
];
 
export default function Home() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const heroRef = useRef(null);
 
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);
 
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              SkillSwap
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Sign in / Login in 
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white rounded-xl transition-all shadow-lg shadow-sky-500/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>
 
      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
 
        {/* Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />
 
        {/* Floating skills */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {FLOATING_SKILLS.map((s, i) => <SkillPill key={i} {...s} />)}
        </div>
 
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-semibold mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Gamified Peer-to-Peer Learning
            </div>
 
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              <span className="text-white">Teach what</span>
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-sky-400 bg-clip-text text-transparent bg-[length:200%] animate-[gradient_3s_ease_infinite]">
                you know.
              </span>
              <br />
              <span className="text-white">Learn what</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%] animate-[gradient_3s_ease_infinite_1s]">
                you love.
              </span>
            </h1>
 
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Exchange skills 1-on-1, earn XP, level up, and unlock rewards. Learning has never been this fun.
            </p>
 
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/25 transition-all text-base"
                >
                  Start for free <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/login" className="flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/8 border border-white/10 text-white font-medium rounded-2xl transition-all text-sm">
                I have an account
              </Link>
            </div>
 
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-500">
              {['No credit card', 'Free forever', '100% peer-to-peer'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
 
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </motion.div>
      </section>
 
{/* ─── STATS ─── */}
<section className="py-20 border-y border-white/5 bg-gray-900/40">
  <div className="max-w-5xl mx-auto px-6">
    
    {/* FLEX INSTEAD OF GRID (auto-center no matter item count) */}
    <div className="flex flex-wrap justify-center items-center gap-10">
      
      {[
        { to: 4.9, suffix: '★', label: 'Average Rating', icon: Star, color: 'text-yellow-400', isFloat: true },
        { to: 100, suffix: '%', label: 'Free Forever', icon: Coins, color: 'text-green-400' },
      ].map((s, i) => (
        
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          
          className="text-center min-w-[140px]"
        >
          
          {/* ICON */}
          <s.icon className={`w-7 h-7 ${s.color} mx-auto mb-3`} />
          
          {/* NUMBER */}
          <p className={`text-4xl font-black ${s.color} tabular-nums`}>
            {s.isFloat 
              ? `${s.to}${s.suffix}` 
              : <Counter to={s.to} suffix={s.suffix} />
            }
          </p>
          
          {/* LABEL */}
          <p className="text-gray-400 text-sm mt-1">
            {s.label}
          </p>
          
        </motion.div>
      ))}
      
    </div>
  </div>
</section>
 
      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">How it works</h2>
            <p className="text-gray-500 max-w-md mx-auto">Three steps to your first skill exchange session</p>
          </motion.div>
 
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '🎯', title: 'Add your skills', desc: 'List what you can teach and what you want to learn. Our algorithm finds your perfect match.', color: 'from-sky-500/20 to-sky-600/10 border-sky-500/20' },
              { step: '02', icon: '🤝', title: 'Match & connect', desc: 'Get matched with peers who complement your skills. Accept, schedule, and meet 1-on-1.', color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20' },
              { step: '03', icon: '⚡', title: 'Earn & level up', desc: 'Complete sessions to earn XP, coins, and badges. Climb leaderboards and unlock rewards.', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br border ${item.color} group hover:scale-[1.02] transition-transform`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold text-gray-600 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
 
      {/* ─── FEATURES ─── */}
      <section className="py-24 bg-gray-900/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black mb-6">
                Learning that feels<br />
                <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">like a game</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Zap, title: 'XP & Levels', desc: 'Earn experience points for every session, game win, and daily login.', color: 'text-yellow-400 bg-yellow-400/10' },
                  { icon: Trophy, title: 'Achievements & Badges', desc: 'Unlock 8+ achievement badges as you hit milestones on your journey.', color: 'text-violet-400 bg-violet-400/10' },
                  { icon: Gamepad2, title: 'Mini Games', desc: 'Speed Match and Daily Spin Wheel keep the grind fun and rewarding.', color: 'text-sky-400 bg-sky-400/10' },
                  { icon: Flame, title: 'Daily Streaks', desc: 'Log in every day to maintain your streak and earn bonus coins.', color: 'text-orange-400 bg-orange-400/10' },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-900 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center shrink-0`}>
                      <f.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{f.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
 
            {/* Live "profile" mockup */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-900 border border-white/8 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-xl font-bold">A</div>
                  <div>
                    <p className="font-bold text-white">Alex_Coder</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/20">Level 7</span>
                      <span className="text-xs text-gray-500">Proficient</span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins className="w-3.5 h-3.5" />
                      <span className="font-bold text-sm">850</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400 mt-0.5">
                      <Flame className="w-3 h-3" />
                      <span className="text-xs">15d streak</span>
                    </div>
                  </div>
                </div>
 
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Level 7 → 8</span>
                    <span className="text-sky-400 font-medium">2,450 / 2,800 XP</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '82%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </div>
                </div>
 
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['🏆 Skill Master', '🔥 Streak 15', '⚡ Speed Demon', '🎯 First Steps'].map(b => (
                    <span key={b} className="text-xs px-2.5 py-1 bg-gray-800 border border-white/5 rounded-full text-gray-300">{b}</span>
                  ))}
                </div>
 
                <div className="grid grid-cols-2 gap-2">
                  {[['📚 React.js', 'Teaching', 'sky'], ['🎯 Python', 'Learning', 'violet']].map(([s, t, c]) => (
                    <div key={s} className={`p-3 rounded-xl bg-${c}-500/10 border border-${c}-500/20`}>
                      <p className="text-xs font-medium text-white">{s}</p>
                      <p className={`text-xs text-${c}-400 mt-0.5`}>{t}</p>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Floating notification */}
              <motion.div
                className="absolute -right-4 -top-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎉 +50 XP earned!
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
 
      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-3">Real people, real results</h2>
          <p className="text-gray-500 mb-12">What our community says</p>
 
          <div className="relative h-44">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-xl font-bold mb-4">
                  {TESTIMONIALS[testimonialIdx].avatar}
                </div>
                <p className="text-gray-300 text-lg italic mb-4 max-w-lg">
                  "{TESTIMONIALS[testimonialIdx].text}"
                </p>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-white">{TESTIMONIALS[testimonialIdx].name}</p>
                  <span className="text-gray-600">·</span>
                  <p className="text-gray-500 text-sm">{TESTIMONIALS[testimonialIdx].role}</p>
                  <span className="text-gray-600">·</span>
                  <p className="text-sky-400 text-sm font-medium">{TESTIMONIALS[testimonialIdx].xp.toLocaleString()} XP</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
 
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-sky-400 w-6' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      </section>
 
      {/* ─── CTA ─── */}
      <section className="py-24 bg-gray-900/40">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-sky-500/15 via-violet-500/10 to-sky-500/5 border border-sky-500/20 rounded-3xl p-12"
          >
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-4xl font-black mb-4">Ready to start swapping?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Join thousands of students already learning, teaching, and leveling up together.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold rounded-2xl shadow-2xl shadow-sky-500/30 transition-all text-lg"
              >
                Create Free Account <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <p className="text-gray-600 text-xs mt-5">No credit card · Free forever · 100+ skills available</p>
          </motion.div>
        </div>
      </section>
 
      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">SkillSwap</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            {['Explore', 'Leaderboard', 'Games', 'Shop'].map(l => (
              <Link key={l} to={`/${l.toLowerCase()}`} className="hover:text-gray-400 transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-gray-700 text-xs">© 2025 SkillSwap</p>
        </div>
      </footer>
    </div>
  );
}