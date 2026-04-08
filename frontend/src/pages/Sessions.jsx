import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Plus, Check, X } from 'lucide-react';
import { sessionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionsApi.getAll();
      setSessions(response.data.data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await sessionsApi.update(id, { status });
      toast.success(`Session ${status}`);
      loadSessions();
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  const filteredSessions = filter === 'all' 
    ? sessions 
    : sessions.filter(s => s.status === filter);

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary-400" />
            My Sessions
          </h1>
          <p className="text-gray-400">Manage your skill exchange sessions</p>
        </div>
        <Link to="/explore" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Find Sessions
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              filter === status
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No sessions found</h3>
          <p className="text-gray-400 mb-4">Find a match to schedule your first session!</p>
          <Link to="/explore" className="btn-primary">
            Find a Match
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session, index) => {
            const isTeacher = session.teacherId === user?.id;
            const otherUser = isTeacher ? session.learner : session.teacher;
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xl">
                      📚
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{session.skillName}</h3>
                      <p className="text-gray-400">
                        {isTeacher ? 'Teaching' : 'Learning from'}{' '}
                        <span className="text-white">{otherUser?.username}</span>
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.duration} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[session.status]}`}>
                      {session.status}
                    </span>
                    
                    {session.status === 'pending' && !isTeacher && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(session.id, 'confirmed')}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                          title="Confirm"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(session.id, 'cancelled')}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                          title="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {session.status === 'confirmed' && (
                      <Link
                        to={`/chat/${session.id}`}
                        className="btn-primary py-2 px-4 flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" /> Chat
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sessions;
