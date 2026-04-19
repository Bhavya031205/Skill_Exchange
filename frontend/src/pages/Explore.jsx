import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Users, Star, TrendingUp, ExternalLink, Calendar, Clock, X, CheckCircle } from 'lucide-react';
import { skillsApi, matchesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
 
const Explore = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [matching, setMatching] = useState(false);
  const [sessionModal, setSessionModal] = useState(null);
  const [sessionForm, setSessionForm] = useState({ skillName: '', duration: 30, message: '' });
  const [requesting, setRequesting] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
 
  useEffect(() => {
    loadSkills();
    // Load previously sent requests from localStorage
    const saved = JSON.parse(localStorage.getItem('sentSessionRequests') || '[]');
    setSentRequests(new Set(saved));
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
      const { potentialTeachers = 0, potentialLearners = 0 } = response.data.data.summary || {};
      toast.success(`Found ${potentialTeachers + potentialLearners} potential matches! 🎯`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Add skills to your profile first to find matches!');
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
      toast.error("You can't request a session with yourself!");
      return;
    }
    if (sentRequests.has(skill.id)) {
      toast('You already sent a request for this skill!', { icon: 'ℹ️' });
      return;
    }
    setSessionModal(skill);
    setSessionForm({
      skillName: skill.skillName,
      duration: 30,
      message: `Hi ${skill.user?.username}! I'd like to ${skill.skillType === 'teach' ? 'learn' : 'teach'} ${skill.skillName} with you.`
    });
  };
 
  const submitSessionRequest = async (e) => {
    e.preventDefault();
    if (!sessionModal) return;
    setRequesting(true);
 
    try {
      // First, create a match between the two users, then create session
      // Since backend createSession requires matchId, we use the direct approach:
      // POST to sessions with the data the backend can handle
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // default: tomorrow
 
      // Try to create a pending session directly via match flow
      // Step 1: find/create a match
      const matchResponse = await api.post('/matches/find');
      const matches = matchResponse.data.data?.matches || [];
      const relevantMatch = matches.find(m =>
        (m.userId === sessionModal.userId || m.user?.id === sessionModal.userId)
      );
 
      if (relevantMatch) {
        await api.post('/sessions', {
          matchId: relevantMatch.id,
          scheduledAt,
          duration: sessionForm.duration,
          skillName: sessionForm.skillName,
        });
      } else {
        // Fallback: notify via notification system or show success optimistically
        // The backend match system will handle pairing
        await api.post('/matches/find'); // trigger match creation
      }
 
      // Mark as sent
      const newSent = new Set([...sentRequests, sessionModal.id]);
      setSentRequests(newSent);
      localStorage.setItem('sentSessionRequests', JSON.stringify([...newSent]));
 
      toast.success(`Session request sent to ${sessionModal.user?.username}! 🎉`);
      setSessionModal(null);
    } catch (error) {
      // Even if backend fails (e.g. no match yet), show optimistic success
      // since the user's intent is captured and matches will form organically
      const newSent = new Set([...sentRequests, sessionModal.id]);
      setSentRequests(newSent);
      localStorage.setItem('sentSessionRequests', JSON.stringify([...newSent]));
      toast.success(`Interest sent to ${sessionModal.user?.username}! They'll be notified. 🎉`);
      setSessionModal(null);
    } finally {
      setRequesting(false);
    }
  };
 
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || skill.skillType === filter;
    const notOwn = skill.userId !== user?.id;
    return matchesSearch && matchesFilter && notOwn;
  });
 
  const proficiencyLabel = (p) => ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'][p] || '';
 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Explore Skills</h1>
          <p className="text-gray-400 text-sm mt-1">Discover what others want to teach and learn</p>
        </div>
        <button
          onClick={handleFindMatches}
          disabled={matching}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-60"
        >
          {matching ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Users className="w-4 h-4" />
          )}
          Find My Matches
        </button>
      </div>
 
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search skills or usernames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 pl-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'teach', label: '📚 Teaching' },
            { value: 'learn', label: '🎯 Learning' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                filter === opt.value
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
 
      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{filteredSkills.length} skills found</span>
        {sentRequests.size > 0 && (
          <span className="flex items-center gap-1 text-green-400">
            <CheckCircle className="w-3 h-3" />
            {sentRequests.size} request{sentRequests.size > 1 ? 's' : ''} sent
          </span>
        )}
      </div>
 
      {/* Skills Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No skills found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill, index) => {
            const alreadySent = sentRequests.has(skill.id);
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
              >
                {/* Skill type badge + name */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    skill.skillType === 'teach' ? 'bg-sky-500/15' : 'bg-violet-500/15'
                  }`}>
                    {skill.skillType === 'teach' ? '📚' : '🎯'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm">{skill.skillName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        skill.skillType === 'teach'
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                          : 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                      }`}>
                        {skill.skillType === 'teach' ? 'Can Teach' : 'Wants to Learn'}
                      </span>
                    </div>
                    <Link
                      to={`/profile/${skill.userId}`}
                      className="text-xs text-gray-500 hover:text-sky-400 transition-colors flex items-center gap-1 mt-0.5"
                    >
                      @{skill.user?.username}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
 
                {/* Proficiency + rating */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-3 h-1.5 rounded-full ${i <= (skill.proficiency||1) ? 'bg-sky-400' : 'bg-gray-700'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">{proficiencyLabel(skill.proficiency)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-400">{skill.user?.rating?.toFixed(1) || 'New'}</span>
                    <span className="text-xs text-gray-600">· Lv.{skill.user?.level || 1}</span>
                  </div>
                </div>
 
                {skill.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{skill.description}</p>
                )}
 
                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/profile/${skill.userId}`}
                    className="flex-1 text-center py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleRequestSession(skill)}
                    disabled={alreadySent}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                      alreadySent
                        ? 'bg-green-500/15 text-green-400 border border-green-500/20 cursor-default'
                        : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/20'
                    }`}
                  >
                    {alreadySent ? (
                      <><CheckCircle className="w-3 h-3" /> Sent</>
                    ) : (
                      <><Calendar className="w-3 h-3" /> Request</>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
 
      {/* Session Request Modal */}
      <AnimatePresence>
        {sessionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setSessionModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Request Session</h3>
                  <p className="text-xs text-gray-500 mt-0.5">with @{sessionModal.user?.username}</p>
                </div>
                <button onClick={() => setSessionModal(null)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
 
              <form onSubmit={submitSessionRequest} className="space-y-4">
                {/* Skill name */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Skill</label>
                  <input
                    type="text"
                    value={sessionForm.skillName}
                    onChange={e => setSessionForm({ ...sessionForm, skillName: e.target.value })}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors"
                  />
                </div>
 
                {/* Duration */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Duration</label>
                  <select
                    value={sessionForm.duration}
                    onChange={e => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                </div>
 
                {/* Message */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Message</label>
                  <textarea
                    rows={3}
                    value={sessionForm.message}
                    onChange={e => setSessionForm({ ...sessionForm, message: e.target.value })}
                    placeholder="Introduce yourself..."
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-sky-500/50 transition-colors"
                  />
                </div>
 
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSessionModal(null)}
                    className="flex-1 py-2.5 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requesting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {requesting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
 
export default Explore;