import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Edit2, Star, Trophy, Flame, Calendar,
  Plus, Trash2, Save, X, BookOpen, Gamepad2,
  TrendingUp, Award, Clock, Check, ChevronDown,
  ExternalLink, Share2, Copy, CheckCheck
} from 'lucide-react';
import { authApi, skillsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
 
const levelNames = [
  'Newcomer', 'Beginner', 'Apprentice', 'Learner',
  'Skilled', 'Proficient', 'Expert', 'Master', 'Grandmaster', 'Legend'
];
 
const SKILL_CATEGORIES = [
  'Programming', 'Design', 'Music', 'Language', 'Math', 'Science',
  'Art', 'Writing', 'Business', 'Fitness', 'Cooking', 'Photography', 'Other'
];
 
const Profile = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user: currentUser, fetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [copied, setCopied] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillName: '', skillType: 'teach', proficiency: 3, description: '', category: 'Other'
  });
 
  const isOwn = !id || id === currentUser?.id;
 
  useEffect(() => {
    const hash = location.hash;
    if (hash === '#skills') setActiveTab('skills');
    if (hash === '#achievements') setActiveTab('achievements');
  }, [location]);
 
  useEffect(() => {
    loadProfile();
    if (isOwn) loadSkills();
  }, [id]);
 
  const loadProfile = async () => {
    try {
      const res = isOwn ? await authApi.getMe() : await authApi.getUser(id);
      setProfile(res.data.data);
      setBio(res.data.data?.bio || '');
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
 
  const loadSkills = async () => {
    try {
      const res = await skillsApi.getMy();
      setSkills(res.data.data);
    } catch {
      console.error('Skills load failed');
    }
  };
 
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skillName.trim()) return;
    try {
      await skillsApi.add({
        skillName: newSkill.skillName,
        skillType: newSkill.skillType,
        proficiency: newSkill.proficiency,
        description: newSkill.description
      });
      toast.success('Skill added!');
      loadSkills();
      setShowAddSkill(false);
      setNewSkill({ skillName: '', skillType: 'teach', proficiency: 3, description: '', category: 'Other' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    }
  };
 
  const handleDeleteSkill = async (skillId) => {
    try {
      await skillsApi.delete(skillId);
      toast.success('Skill removed');
      loadSkills();
    } catch {
      toast.error('Failed to remove skill');
    }
  };
 
  const handleCopyProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Profile link copied!');
    setTimeout(() => setCopied(false), 2000);
  };
 
  const teachSkills = skills.filter(s => s.skillType === 'teach');
  const learnSkills = skills.filter(s => s.skillType === 'learn');
  const level = profile?.level || 1;
 
  const achievements = [
    { name: 'First Steps', icon: '🎯', desc: 'Complete your first session', earned: (profile?._count?.taughtSessions || 0) >= 1 },
    { name: 'Quick Learner', icon: '📚', desc: 'Complete 5 sessions', earned: (profile?._count?.learnedSessions || 0) >= 5 },
    { name: 'Skill Master', icon: '🏆', desc: 'Complete 25 sessions', earned: false },
    { name: 'Speed Demon', icon: '⚡', desc: 'Win 10 Speed Match games', earned: false },
    { name: 'Streak Starter', icon: '🔥', desc: '7-day login streak', earned: (profile?.streakDays || 0) >= 7 },
    { name: 'Legend', icon: '👑', desc: 'Reach Level 10', earned: level >= 10 },
    { name: 'Helpful Hand', icon: '🤝', desc: 'Teach 10 sessions', earned: (profile?._count?.taughtSessions || 0) >= 10 },
    { name: 'Rising Star', icon: '⭐', desc: 'Get 5 five-star ratings', earned: (profile?.totalRatings || 0) >= 5 },
  ];
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }
 
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gray-900 border border-white/5 rounded-2xl"
      >
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-sky-500/30 via-violet-500/20 to-sky-500/10" />
 
        <div className="px-6 pb-6">
          {/* Avatar + Actions Row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-gray-900 shadow-xl">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                profile?.username?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyProfile}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white hover:border-white/10 transition-colors"
              >
                {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Share Profile'}
              </button>
              {isOwn && (
                <Link
                  to="/settings"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-xl text-sm text-white font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Link>
              )}
            </div>
          </div>
 
          {/* Name + Bio */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{profile?.username}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Lv. {level}
              </span>
            </div>
 
            {/* Bio */}
            {editingBio && isOwn ? (
              <div className="flex gap-2 mt-2">
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tell others about yourself..."
                  className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50 resize-none"
                />
                <div className="flex flex-col gap-1">
                  <button onClick={() => { setEditingBio(false); toast.success('Bio saved!'); }} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingBio(false)} className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p
                className={`text-gray-400 text-sm mt-1 ${isOwn ? 'cursor-pointer hover:text-gray-300 group' : ''}`}
                onClick={() => isOwn && setEditingBio(true)}
              >
                {profile?.bio || (isOwn ? 'Click to add a bio...' : 'No bio')}
                {isOwn && <Edit2 className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />}
              </p>
            )}
          </div>
 
          {/* Stats Row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-white">{profile?.rating?.toFixed(1) || '—'}</span>
              <span className="text-xs text-gray-500">Rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-white">{profile?.streakDays || 0}</span>
              <span className="text-xs text-gray-500">Day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-semibold text-white">
                {(profile?._count?.taughtSessions || 0) + (profile?._count?.learnedSessions || 0)}
              </span>
              <span className="text-xs text-gray-500">Sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-white">{(profile?.xp || 0).toLocaleString()}</span>
              <span className="text-xs text-gray-500">XP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">{achievements.filter(a => a.earned).length}</span>
              <span className="text-xs text-gray-500">Badges</span>
            </div>
          </div>
        </div>
 
        {/* Tabs */}
        <div className="border-t border-white/5 flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'skills', label: 'Skills', count: skills.length },
            { id: 'achievements', label: 'Achievements', count: achievements.filter(a => a.earned).length },
            { id: 'activity', label: 'Activity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-sky-500/20 text-sky-400' : 'bg-gray-700 text-gray-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>
 
      {/* Tab Content  .... */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {/* Stats Cards */}
            {[
              { label: 'Sessions Taught', value: profile?._count?.taughtSessions || 0, icon: '📚', color: 'sky' },
              { label: 'Sessions Learned', value: profile?._count?.learnedSessions || 0, icon: '🎯', color: 'violet' },
              { label: 'Total XP Earned', value: (profile?.xp || 0).toLocaleString(), icon: '⚡', color: 'yellow' },
              { label: 'Skills Listed', value: skills.length, icon: '💡', color: 'green' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
 
            {/* Skill Summary */}
            <div className="md:col-span-2 bg-gray-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-3">Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 8).map((skill) => (
                  <span
                    key={skill.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
                      skill.skillType === 'teach'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    }`}
                  >
                    {skill.skillType === 'teach' ? '📚' : '🎯'} {skill.skillName}
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
 
        {activeTab === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {isOwn && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddSkill(!showAddSkill)}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </div>
            )}
 
            <AnimatePresence>
              {showAddSkill && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleAddSkill} className="bg-gray-900 border border-sky-500/30 rounded-2xl p-5 space-y-4">
                    <h3 className="font-semibold text-white">Add a Skill</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">Skill Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. React.js, Guitar, Spanish..."
                          value={newSkill.skillName}
                          onChange={e => setNewSkill({ ...newSkill, skillName: e.target.value })}
                          className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">Type *</label>
                        <select
                          value={newSkill.skillType}
                          onChange={e => setNewSkill({ ...newSkill, skillType: e.target.value })}
                          className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50"
                        >
                          <option value="teach">I can teach this</option>
                          <option value="learn">I want to learn this</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">Proficiency: {newSkill.proficiency}/5</label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={newSkill.proficiency}
                          onChange={e => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
                          className="w-full accent-sky-500"
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                          <span>Beginner</span><span>Expert</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">Short Description (optional)</label>
                        <input
                          type="text"
                          placeholder="What can you teach / what do you want to learn?"
                          value={newSkill.description}
                          onChange={e => setNewSkill({ ...newSkill, description: e.target.value })}
                          className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowAddSkill(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors">
                        Add Skill
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
 
            {/* Teach Skills */}
            <div>
              <h3 className="font-semibold text-sky-400 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Skills I Can Teach ({teachSkills.length})
              </h3>
              {teachSkills.length === 0 ? (
                <p className="text-gray-600 text-sm bg-gray-900 border border-dashed border-white/10 rounded-xl p-4 text-center">
                  No teaching skills added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {teachSkills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} isOwn={isOwn} onDelete={() => handleDeleteSkill(skill.id)} />
                  ))}
                </div>
              )}
            </div>
 
            {/* Learn Skills */}
            <div>
              <h3 className="font-semibold text-violet-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Skills I Want to Learn ({learnSkills.length})
              </h3>
              {learnSkills.length === 0 ? (
                <p className="text-gray-600 text-sm bg-gray-900 border border-dashed border-white/10 rounded-xl p-4 text-center">
                  No learning goals added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {learnSkills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} isOwn={isOwn} onDelete={() => handleDeleteSkill(skill.id)} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
 
        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {achievements.map((ach) => (
              <div
                key={ach.name}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  ach.earned
                    ? 'bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-yellow-400/30'
                    : 'bg-gray-900 border-white/5 opacity-50 grayscale'
                }`}
              >
                <span className="text-3xl">{ach.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{ach.name}</p>
                  <p className="text-xs text-gray-400">{ach.desc}</p>
                  {ach.earned && (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-400 mt-1 font-medium">
                      <Check className="w-3 h-3" /> Earned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
 
        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { icon: '🎯', text: 'Played Speed Match game', time: '2h ago', points: '+15 XP' },
                  { icon: '🎡', text: 'Spun the daily wheel', time: '1d ago', points: '+20 coins' },
                  { icon: '📚', text: 'Added skill: React.js (Teaching)', time: '2d ago', points: '' },
                  { icon: '🔥', text: 'Reached 3-day login streak', time: '3d ago', points: '+10 XP' },
                  { icon: '👋', text: 'Joined SkillSwap', time: 'Recently', points: '+100 coins' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{item.text}</p>
                      <p className="text-xs text-gray-600">{item.time}</p>
                    </div>
                    {item.points && (
                      <span className="text-xs font-semibold text-green-400 shrink-0">{item.points}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
 
            {/* Games played */}
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-violet-400" /> Games & Activities
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">0</p>
                  <p className="text-xs text-gray-500">Speed Match rounds</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">0</p>
                  <p className="text-xs text-gray-500">Daily spins used</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">0</p>
                  <p className="text-xs text-gray-500">Matches won</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">{profile?.coins || 0}</p>
                  <p className="text-xs text-gray-500">Total coins earned</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
 
const SkillCard = ({ skill, isOwn, onDelete }) => {
  const proficiencyLabels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
 
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-900 border border-white/5 rounded-xl hover:border-white/10 transition-colors group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
        skill.skillType === 'teach' ? 'bg-sky-500/15' : 'bg-violet-500/15'
      }`}>
        {skill.skillType === 'teach' ? '📚' : '🎯'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-white text-sm">{skill.skillName}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            skill.skillType === 'teach'
              ? 'bg-sky-500/10 text-sky-400'
              : 'bg-violet-500/10 text-violet-400'
          }`}>
            {skill.skillType === 'teach' ? 'Teaching' : 'Learning'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-4 h-1.5 rounded-full ${i <= (skill.proficiency || 1) ? 'bg-sky-400' : 'bg-gray-700'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{proficiencyLabels[skill.proficiency || 1]}</span>
        </div>
        {skill.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">{skill.description}</p>
        )}
      </div>
      {isOwn && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
 
export default Profile;