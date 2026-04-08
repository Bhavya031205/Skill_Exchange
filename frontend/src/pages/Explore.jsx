import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Star, TrendingUp } from 'lucide-react';
import { skillsApi, matchesApi } from '../services/api';
import toast from 'react-hot-toast';

const Explore = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [matching, setMatching] = useState(false);

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
              className="card-glow p-4"
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
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-400">@{skill.user?.username}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                      <span className="text-sm">{skill.user?.rating?.toFixed(1) || 'New'}</span>
                    </div>
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
            </motion.div>
          ))}
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
