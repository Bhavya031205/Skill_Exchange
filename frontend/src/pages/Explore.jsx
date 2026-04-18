import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Star, TrendingUp, ExternalLink, Calendar, Clock, Video } from 'lucide-react';
import { skillsApi, matchesApi, sessionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Explore = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [matching, setMatching] = useState(false);
  const [sessionModal, setSessionModal] = useState(null);
  const [sessionForm, setSessionForm] = useState({ skillName: '', duration: 30, notes: '' });
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await skillsApi.getAll({ limit: 50 });
      setSkills(response.data.data.skills);
    } catch (error) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatches = async () => {
    setMatching(true);
    try {
      const response = await matchesApi.find();
      toast.success(`Found ${response.data.data.summary.potentialTeachers + response.data.data.summary.potentialLearners} potential matches!`);
    } catch (error) {
      toast.error('Failed to find matches');
    } finally {
      setMatching(false);
    }
  };

  const handleRequestSession = (skill) => {
    if (!user) {
      toast.error('Please login to request a session');
      return;
    }
    if (skill.userId === user.id) {
      toast.error("You can't request a session with yourself");
      return;
    }
    setSessionModal(skill);
    setSessionForm({ 
      skillName: skill.skillName, 
      duration: 30, 
      notes: `Hi! I'd like to ${skill.skillType === 'teach' ? 'learn' : 'teach'} ${skill.skillName} with you.` 
    });
  };

  const submitSessionRequest = async (e) => {
    e.preventDefault();
    if (!sessionModal) return;
    
    setRequesting(true);
    try {
      const response = await sessionsApi.create({
        skillName: sessionForm.skillName,
        skillId: sessionModal.id,
        duration: sessionForm.duration,
        notes: sessionForm.notes
      });
      toast.success('Session request sent!');
      setSessionModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.skillName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || skill.skillType === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Explore Skills</h1>
          <p className="text-gray-400">Discover what others want to teach and learn</p>
        </div>
        <button
          onClick={handleFindMatches}
          disabled={matching}
          className="btn-primary flex items-center gap-2"
        >
          {matching ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Users className="w-5 h-5" />
          )}
          Find My Matches
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-40"
        >
          <option value="all">All Types</option>
          <option value="teach">Can Teach</option>
          <option value="learn">Want to Learn</option>
        </select>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-glow p-4 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xl">
                  {skill.skillType === 'teach' ? '📚' : '🎯'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{skill.skillName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      skill.skillType === 'teach' 
                        ? 'bg-primary-500/20 text-primary-400' 
                        : 'bg-secondary-500/20 text-secondary-400'
                    }`}>
                      {skill.skillType === 'teach' ? 'Can Teach' : 'Wants to Learn'}
                    </span>
                  </div>
                  <Link 
                    to={`/profile/${skill.userId}`}
                    className="flex items-center gap-3 mt-1 hover:underline group/link"
                  >
                    <span className="text-sm text-gray-400">@{skill.user?.username}</span>
                    <ExternalLink className="w-3 h-3 text-gray-600 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                    <span className="text-sm">{skill.user?.rating?.toFixed(1) || 'New'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (skill.proficiency || 1) ? 'bg-primary-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">Proficiency</span>
                  </div>
                </div>
              </div>
              {skill.description && (
                <p className="text-xs text-gray-500 mt-3 line-clamp-2">{skill.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <Link
                  to={`/profile/${skill.userId}`}
                  className="flex-1 text-center py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-sm rounded-lg transition-colors"
                >
                  View Profile
                </Link>
                {user && skill.userId !== user.id && (
                  <button
                    onClick={() => handleRequestSession(skill)}
                    className="flex-1 text-center py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Calendar className="w-4 h-4" />
                    Request
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Session Request Modal */}
      {sessionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-white mb-4">Request Session</h3>
            <form onSubmit={submitSessionRequest} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Skill</label>
                <input
                  type="text"
                  value={sessionForm.skillName}
                  onChange={e => setSessionForm({ ...sessionForm, skillName: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Duration</label>
                <select
                  value={sessionForm.duration}
                  onChange={e => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Message</label>
                <textarea
                  rows={3}
                  value={sessionForm.notes}
                  onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })}
                  placeholder="Introduce yourself and explain why you want to learn/teach this skill..."
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSessionModal(null)}
                  className="flex-1 py-2.5 text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {requesting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {filteredSkills.length === 0 && !loading && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No skills found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Explore;
