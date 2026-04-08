import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Users, 
  Trophy, 
  Gamepad2, 
  Coins, 
  ArrowRight,
  Star,
  Clock,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Find Your Match',
    description: 'Connect with peers who want to learn what you teach and teach what you want to learn.',
    color: 'from-primary-400 to-primary-600'
  },
  {
    icon: Gamepad2,
    title: 'Learn Through Play',
    description: 'Earn XP, coins, and badges while exchanging skills. Learning has never been this fun!',
    color: 'from-secondary-400 to-secondary-600'
  },
  {
    icon: Trophy,
    title: 'Compete & Rank',
    description: 'Climb the leaderboards and become the top skill exchanger in your community.',
    color: 'from-gold-400 to-gold-600'
  }
];

const stats = [
  { value: '10K+', label: 'Active Learners' },
  { value: '50K+', label: 'Skills Exchanged' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '100%', label: 'Free Forever' }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" />

        <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-3xl">⚡</span>
            </div>
            <span className="text-2xl font-bold text-gradient">SkillSwap</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/register" className="btn-primary">Get Started Free</Link>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Learn & Teach</span>
              <br />
              <span className="text-white">Through Play</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              The gamified skill exchange platform where you teach what you know, 
              learn what you love, and earn rewards along the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-ghost text-lg px-8 py-4 border border-gray-700">
                I Already Have an Account
              </Link>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div 
            className="mt-16 relative"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="inline-flex items-center gap-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-700">
              <span className="text-2xl">🎮</span>
              <div className="text-left">
                <p className="font-semibold">Ready to play?</p>
                <p className="text-sm text-gray-400">Complete sessions, earn XP, level up!</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-gradient mb-2">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Three simple steps to start your skill exchange journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="game-card group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Level Up Your <span className="text-gradient">Skills</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Earn XP & Coins</h4>
                    <p className="text-gray-400 text-sm">Complete sessions, win games, maintain streaks to earn rewards.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Unlock Achievements</h4>
                    <p className="text-gray-400 text-sm">Collect badges for milestones and show off your progress.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary-500/20 flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-5 h-5 text-secondary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Play Mini-Games</h4>
                    <p className="text-gray-400 text-sm">Speed Match and Daily Spins keep learning fun and engaging.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <p className="font-bold">Alex_Coder</p>
                    <p className="text-sm text-gray-400">Level 7 - Proficient</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-gold-400 font-bold">2,450 XP</p>
                    <p className="text-sm text-gray-400">Next: 2,800 XP</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Level Progress</span>
                      <span>82%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[82%] bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">🏆 Skill Master</span>
                    <span className="px-3 py-1 bg-gold-400/20 text-gold-400 rounded-full text-sm">🔥 15 Day Streak</span>
                    <span className="px-3 py-1 bg-secondary-500/20 text-secondary-300 rounded-full text-sm">⚡ Speed Demon</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 rounded-3xl p-12 border border-primary-500/30"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Start Swapping?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join thousands of students who are already learning, teaching, and having fun together.
            </p>
            <Link to="/register" className="btn-primary text-lg px-10 py-4">
              Create Free Account <ArrowRight className="inline w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>Built for students, by students. 100% Free Forever.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
