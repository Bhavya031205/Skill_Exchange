import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Edit2, Star, Trophy, Flame, Calendar, Plus, X, 
  BookOpen, GraduationCap, Gamepad2, Award, Settings, 
  Mail, MessageCircle, Clock, ChevronRight, Save, Trash2
} from 'lucide-react';
import { authApi, skillsApi, sessionsApi, gamesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, fetchUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState({ teach: [], learn: [] });
  const [sessions, setSessions] = useState({ taught: [], learned: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newSkill, setNewSkill] = useState({ skillName: '', skillType: 'teach', proficiency: 3, description: '' });
  const [editProfile, setEditProfile] = useState({ username: '', bio: '' });
  const [gameStats, setGameStats] = useState(null);

  const isOwn = !id || id === currentUser?.id;

  useEffect(() => {
    loadProfile();
    if (isOwn) {
      loadSkills();
      loadSessions();
      loadGameStats();
    }
  }, [id]);

  const loadProfile = async () => {
    try {
      const response = isOwn 
        ? await authApi.getMe()
        : await authApi.getUser(id);
      setProfile(response.data.data);
      setEditProfile({
        username: response.data.data.username || '',
        bio: response.data.data.bio || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await skillsApi.getMy();
      const allSkills = response.data.data;
      setSkills({
        teach: allSkills.filter(s => s.skillType === 'teach'),
        learn: allSkills.filter(s => s.skillType === 'learn')
      });
    } catch (error) {
      console.error('Failed to load skills');
    }
  };

  const loadSessions = async () => {
    try {
      const response = await sessionsApi.getAll({ status: 'completed' });
      const allSessions = response.data.data;
      const userId = currentUser?.id;
      setSessions({
        taught: allSessions.filter(s => s.teacherId === userId),
        learned: allSessions.filter(s => s.learnerId === userId)
      });
    } catch (error) {
      console.error('Failed to load sessions');
    }
  };

  const loadGameStats = async () => {
    try {
      const response = await gamesApi.getStats();
      setGameStats(response.data.data);
    } catch (error) {
      console.error('Failed to load game stats');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await skillsApi.add(newSkill);
      toast.success('Skill added!');
      loadSkills();
      setShowAddSkill(false);
      setNewSkill({ skillName: '', skillType: 'teach', proficiency: 3, description: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await skillsApi.delete(skillId);
      toast.success('Skill removed');
      loadSkills();
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    toast.success('Profile updated!');
    setShowEditProfile(false);
  };

  const getLevelName = (level) => {
    const names = ['Newcomer', 'Beginner', 'Apprentice', 'Learner', 'Skilled', 'Proficient', 'Expert', 'Master', 'Grandmaster', 'Legend'];
    return names[Math.min((level || 1) - 1, 9)];
  };

  const getLevelColor = (level) => {
    if (level >= 8) return 'from-gold-400 to-gold-600';
    if (level >= 5) return 'from-secondary-400 to-secondary-600';
    if (level >= 3) return 'from-primary-400 to-primary-600';
    return 'from-gray-400 to-gray-600';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'skills', label: 'My Skills', icon: BookOpen },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'games', label: 'Games & Stats', icon: Gamepad2 },
    ...(isOwn ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-5xl font-bold overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.username?.[0]?.toUpperCase()
              )}
            </div>
            {isOwn && (
              <button 
                onClick={() => setShowEditProfile(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700 hover:border-primary-500 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile?.username}</h1>
            <p className="text-gray-400 mt-1">{profile?.bio || 'No bio yet. Add one in settings!'}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/20 rounded-full">
                <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${getLevelColor(profile?.level)} flex items-center justify-center text-xs font-bold`}>
                  {profile?.level || 1}
                </span>
                <span className="text-primary-400 font-medium">{getLevelName(profile?.level)}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gold-400/20 rounded-full">
                <Star className="w-4 h-4 text-gold-400" />
                <span className="text-gold-400 font-medium">{profile?.rating?.toFixed(1) || 'New'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500 font-medium">{profile?.streakDays || 0} day streak</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-400">{profile?.xp || 0}</p>
              <p className="text-xs text-gray-400">Total XP</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold-400">{profile?.coins || 0}</p>
              <p className="text-xs text-gray-400">Coins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-400">{profile?._count?.achievements || 0}</p>
              <p className="text-xs text-gray-400">Badges</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <GraduationCap className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{sessions.taught.length}</p>
                <p className="text-sm text-gray-400">Skills Shared</p>
              </div>
              <div className="card text-center">
                <BookOpen className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{sessions.learned.length}</p>
                <p className="text-sm text-gray-400">Skills Learned</p>
              </div>
              <div className="card text-center">
                <Calendar className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{sessions.taught.length + sessions.learned.length}</p>
                <p className="text-sm text-gray-400">Total Sessions</p>
              </div>
              <div className="card text-center">
                <Award className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{profile?._count?.achievements || 0}</p>
                <p className="text-sm text-gray-400">Achievements</p>
              </div>
            </div>

            {/* Skills Preview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                    Can Teach ({skills.teach.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.teach.length > 0 ? skills.teach.slice(0, 5).map((skill) => (
                    <span key={skill.id} className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">
                      {skill.skillName}
                    </span>
                  )) : (
                    <p className="text-gray-500 text-sm">No skills to teach yet</p>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-secondary-400" />
                    Want to Learn ({skills.learn.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.learn.length > 0 ? skills.learn.slice(0, 5).map((skill) => (
                    <span key={skill.id} className="px-3 py-1 bg-secondary-500/20 text-secondary-300 rounded-full text-sm">
                      {skill.skillName}
                    </span>
                  )) : (
                    <p className="text-gray-500 text-sm">No skills to learn yet</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Can Teach Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                  Skills I Can Teach
                </h3>
                {isOwn && (
                  <button
                    onClick={() => { setNewSkill({ ...newSkill, skillType: 'teach' }); setShowAddSkill(true); }}
                    className="btn-primary text-sm py-2"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Skill
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {skills.teach.length > 0 ? skills.teach.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-2xl">
                      📚
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-lg">{skill.skillName}</p>
                      <p className="text-sm text-gray-400">{skill.description || 'No description'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Proficiency:</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i < (skill.proficiency || 1) ? 'bg-primary-400' : 'bg-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No skills to teach yet</p>
                    <p className="text-sm">Add skills you're good at!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Want to Learn Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-secondary-400" />
                  Skills I Want to Learn
                </h3>
                {isOwn && (
                  <button
                    onClick={() => { setNewSkill({ ...newSkill, skillType: 'learn' }); setShowAddSkill(true); }}
                    className="btn-secondary text-sm py-2"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Skill
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {skills.learn.length > 0 ? skills.learn.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-secondary-500/20 flex items-center justify-center text-2xl">
                      🎯
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-lg">{skill.skillName}</p>
                      <p className="text-sm text-gray-400">{skill.description || 'No description'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Current Level:</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i < (skill.proficiency || 1) ? 'bg-secondary-400' : 'bg-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No skills to learn yet</p>
                    <p className="text-sm">Add skills you want to learn!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skills Shared (Taught) */}
              <div className="card">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                  Skills I've Shared
                </h3>
                <div className="space-y-3">
                  {sessions.taught.length > 0 ? sessions.taught.map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        📚
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{session.skillName}</p>
                        <p className="text-xs text-gray-400">with {session.learner?.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gold-400">+25 🪙</p>
                        <p className="text-xs text-gray-500">+50 XP</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No sessions taught yet</p>
                  )}
                </div>
              </div>

              {/* Skills Learned */}
              <div className="card">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-secondary-400" />
                  Skills I've Learned
                </h3>
                <div className="space-y-3">
                  {sessions.learned.length > 0 ? sessions.learned.map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-secondary-500/20 flex items-center justify-center">
                        🎓
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{session.skillName}</p>
                        <p className="text-xs text-gray-400">from {session.teacher?.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gold-400">+15 🪙</p>
                        <p className="text-xs text-gray-500">+30 XP</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No sessions learned yet</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'games' && (
          <motion.div
            key="games"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Game Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card text-center">
                <Gamepad2 className="w-10 h-10 text-secondary-400 mx-auto mb-2" />
                <p className="text-3xl font-bold">{gameStats?.sessionsCompleted || 0}</p>
                <p className="text-gray-400">Games Played</p>
              </div>
              <div className="card text-center">
                <Trophy className="w-10 h-10 text-gold-400 mx-auto mb-2" />
                <p className="text-3xl font-bold">{gameStats?.achievements || 0}</p>
                <p className="text-gray-400">Achievements</p>
              </div>
              <div className="card text-center">
                <Flame className="w-10 h-10 text-orange-400 mx-auto mb-2" />
                <p className="text-3xl font-bold">{gameStats?.streakDays || 0}</p>
                <p className="text-gray-400">Day Streak</p>
              </div>
            </div>

            {/* Level Progress */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Level Progress</h3>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor(profile?.level)} flex items-center justify-center text-2xl font-bold`}>
                  {profile?.level || 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{getLevelName(profile?.level)}</span>
                    <span className="text-gray-400">{profile?.xp || 0} / {gameStats?.nextLevelXp || 100} XP</span>
                  </div>
                  <div className="xp-bar h-4">
                    <div className="xp-bar-fill" style={{ width: `${gameStats?.levelProgress || 0}%` }} />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{gameStats?.xpToNextLevel || 0} XP to next level</p>
                </div>
              </div>
            </div>

            {/* XP Sources */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">XP Sources</h3>
              <div className="space-y-3">
                {gameStats?.xpSources?.length > 0 ? gameStats.xpSources.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                    <span className="capitalize text-gray-300">{source.source.replace(/_/g, ' ')}</span>
                    <div className="text-right">
                      <p className="font-bold text-primary-400">+{source.totalXp} XP</p>
                      <p className="text-xs text-gray-500">{source.count} times</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No XP earned yet. Complete sessions and play games!</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && isOwn && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Edit Profile */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Profile Settings</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={editProfile.username}
                    onChange={(e) => setEditProfile({ ...editProfile, username: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                  <textarea
                    value={editProfile.bio}
                    onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                    className="input-field h-24"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <button type="submit" className="btn-primary">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </button>
              </form>
            </div>

            {/* Account Info */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Email</span>
                  </div>
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Member Since</span>
                  </div>
                  <span>{new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showAddSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowAddSkill(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  Add {newSkill.skillType === 'teach' ? 'Skill to Teach' : 'Skill to Learn'}
                </h3>
                <button onClick={() => setShowAddSkill(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddSkill} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g., JavaScript, Guitar, Photoshop"
                    value={newSkill.skillName}
                    onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Proficiency Level</label>
                  <select
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    <option value={1}>1 - Beginner</option>
                    <option value={2}>2 - Elementary</option>
                    <option value={3}>3 - Intermediate</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description (Optional)</label>
                  <textarea
                    placeholder="Describe your skill level..."
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                    className="input-field h-20"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <Save className="w-4 h-4 mr-2" /> Add Skill
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowEditProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Edit Profile</h3>
                <button onClick={() => setShowEditProfile(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={editProfile.username}
                    onChange={(e) => setEditProfile({ ...editProfile, username: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                  <textarea
                    value={editProfile.bio}
                    onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                    className="input-field h-24"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
