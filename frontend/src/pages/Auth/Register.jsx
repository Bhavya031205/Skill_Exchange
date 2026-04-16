import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
 
const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
 
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);
 
  const validate = () => {
    const e = {};
    if (formData.username.length < 3) e.username = 'At least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) e.username = 'Letters, numbers, underscores only';
    if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Valid email required';
    if (formData.password.length < 6) e.password = 'At least 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.username);
      toast.success('Account created! +100 coins bonus 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };
 
  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <input
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50 transition-colors ${errors[key] ? 'border-red-500/50' : 'border-white/8'}`}
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );
 
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl" />
      </div>
 
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            SkillSwap
          </span>
        </Link>
 
        <div className="bg-gray-900 border border-white/8 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the skill exchange community</p>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('username', 'Username', 'text', 'CoolUser123')}
            {field('email', 'Email', 'email', 'you@example.com')}
 
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full bg-gray-800 border rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50 transition-colors ${errors.password ? 'border-red-500/50' : 'border-white/8'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
 
            {field('confirmPassword', 'Confirm Password', 'password', '••••••••')}
 
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>
 
          <div className="mt-5 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign in</Link>
            </p>
          </div>
 
          <div className="mt-4 p-3 bg-yellow-400/8 border border-yellow-400/15 rounded-xl text-center">
            <p className="text-yellow-400 text-xs font-semibold">🎁 Get 100 bonus coins when you join!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
 
export default Register;