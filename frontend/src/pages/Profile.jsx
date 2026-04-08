import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Edit2, Star, Trophy, Flame, Calendar, Plus } from 'lucide-react';
import { authApi, skillsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, fetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', type: 'teach', proficiency: 3 });

  const isOwn = !id || id === currentUser?.id;

  useEffect(() => {
    loadProfile();
    if (isOwn) {
      loadSkills();
    }
  }, [id]);

  const loadProfile = async () => {
    try {
      const response = isOwn 
        ? await authApi.getMe()
        : await authApi.getUser(id);
      setProfile(response.data.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await skillsApi.getMy();
      setSkills(response.data.data);
    } catch (error) {
      console.error('Failed to load skills');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await skillsApi.add(newSkill);
      toast.success('Skill added!');
      loadSkills();
      setShowAddSkill(false);
      setNewSkill({ name: '', type: 'teach', proficiency: 3 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const getLevelName = (level) => {
    const names = ['Newcomer', 'Beginner', 'Apprentice', 'Learner', 'Skilled', 'Proficient', 'Expert', 'Master', 'Grandmaster', 'Legend'];
    return names[Math.min((level || 1) - 1, 9)];
  };

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
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-5xl font-bold">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              profile?.username?.[0]?.toUpperCase()
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile?.username}</h1>
            <p className="text-gray-400 mt-1">{profile?.bio || 'No bio yet'}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/20 rounded-full">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold">
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

          <div className="text-center">
            <p className="text-3xl font-bold text-primary-400">{profile?.xp || 0}</p>
            <p className="text-sm text-gray-400">Total XP</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Trophy className="w-8 h-8 text-gold-400 mx-auto mb-2" />
          <p className="text-2xl font-bold">{profile?._count?.taughtSessions || 0}</p>
          <p className="text-sm text-gray-400">Sessions Taught</p>
        </div>
        <div className="card text-center">
          <User className="w-8 h-8 text-primary-400 mx-auto mb-2" />
          <p className="text-2xl font-bold">{profile?._count?.learnedSessions || 0}</p>
          <p className="text-sm text-gray-400">Sessions Learned</p>
        </div>
        <div className="card text-center">
          <Calendar className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
          <p className="text-2xl font-bold">{profile?.totalRatings || 0}</p>
          <p className="text-sm text-gray-400">Ratings Given</p>
        </div>
        <div className="card text-center">
          <Star className="w-8 h-8 text-gold-400 mx-auto mb-2" />
          <p className="text-2xl font-bold">{profile?._count?.achievements || 0}</p>
          <p className="text-sm text-gray-400">Achievements</p>
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Skills</h2>
          {isOwn && (
            <button
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="btn-primary text-sm py-2"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Skill
            </button>
          )}
        </div>

        {showAddSkill && (
          <form onSubmit={handleAddSkill} className="mb-4 p-4 bg-gray-700/50 rounded-xl">
            <div className="grid md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="input-field"
                required
              />
              <select
                value={newSkill.type}
                onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value })}
                className="input-field"
              >
                <option value="teach">Can Teach</option>
                <option value="learn">Want to Learn</option>
              </select>
              <select
                value={newSkill.proficiency}
                onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
                className="input-field"
              >
                {[1, 2, 3, 4, 5].map(p => (
                  <option key={p} value={p}>Proficiency: {p}/5</option>
                ))}
              </select>
              <button type="submit" className="btn-primary">Add</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {(isOwn ? skills : profile?.skills || []).map((skill) => (
            <div key={skill.id} className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                skill.skillType === 'teach' 
                  ? 'bg-primary-500/20' 
                  : 'bg-secondary-500/20'
              }`}>
                {skill.skillType === 'teach' ? '📚' : '🎯'}
              </div>
              <div className="flex-1">
                <p className="font-medium">{skill.skillName}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    skill.skillType === 'teach' 
                      ? 'bg-primary-500/20 text-primary-400' 
                      : 'bg-secondary-500/20 text-secondary-400'
                  }`}>
                    {skill.skillType === 'teach' ? 'Can Teach' : 'Learning'}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (skill.proficiency || 1) ? 'bg-primary-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
