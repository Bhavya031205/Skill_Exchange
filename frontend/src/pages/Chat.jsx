import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Calendar, Video, MessageCircle } from 'lucide-react';
import { sessionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Chat = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const loadSessions = useCallback(async () => {
    try {
      const response = await sessionsApi.getAll({ status: 'confirmed' });
      setSessions(response.data.data);
    } catch (error) {
      // Silently fail
    } finally {
      if (sessionId) {
        loadCurrentSession();
      } else {
        setLoading(false);
      }
    }
  }, [sessionId]);

  const loadCurrentSession = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    try {
      const response = await sessionsApi.getOne(sessionId);
      setCurrentSession(response.data.data);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSessions();
    
    if (sessionId) {
      pollingRef.current = setInterval(() => {
        loadCurrentSession();
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [sessionId, loadSessions, loadCurrentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentSession]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);
    setNewMessage('');

    try {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        senderId: user?.id,
        sender: { username: user?.username },
        createdAt: new Date().toISOString(),
        pending: true
      };
      setMessages(prev => [...prev, tempMessage]);

      await sessionsApi.update(sessionId, { 
        message: messageContent 
      });

      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? { ...m, pending: false } : m
      ));
      
      await loadCurrentSession();
    } catch (error) {
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
      setNewMessage(messageContent);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 flex gap-6">
        {/* Sessions List */}
        <div className="w-80 card overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold p-4 border-b border-gray-700">Chats</h2>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No active sessions</p>
                <Link to="/sessions" className="text-primary-400 text-sm hover:underline">
                  Schedule one first
                </Link>
              </div>
            ) : (
              sessions.map((session) => {
                const isTeacher = session.teacherId === user?.id;
                const otherUser = isTeacher ? session.learner : session.teacher;
                
                return (
                  <Link
                    key={session.id}
                    to={`/chat/${session.id}`}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-700/50 transition-colors ${
                      sessionId === session.id ? 'bg-primary-500/20' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      {otherUser?.avatarUrl ? (
                        <img src={otherUser.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <span className="text-xl font-bold">{otherUser?.username?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{otherUser?.username}</p>
                      <p className="text-sm text-gray-400 truncate">{session.skillName}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 card flex flex-col overflow-hidden">
          {currentSession ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <Link to="/sessions" className="md:hidden text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    {currentSession.teacher?.id === user?.id ? (
                      <span className="text-lg font-bold">
                        {currentSession.learner?.username?.[0]?.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-lg font-bold">
                        {currentSession.teacher?.username?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {currentSession.teacher?.id === user?.id
                        ? currentSession.learner?.username
                        : currentSession.teacher?.username}
                    </p>
                    <p className="text-sm text-gray-400">{currentSession.skillName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {new Date(currentSession.scheduledAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No messages yet</p>
                      <p className="text-sm text-gray-500">Send a message to start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`chat-bubble ${isMine ? 'chat-bubble-sent' : 'chat-bubble-received'} ${message.pending ? 'opacity-50' : ''}`}>
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                            {formatTime(message.createdAt)}
                            {isMine && message.pending && <span className="text-[8px]">•</span>}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="px-4 py-2 text-sm text-gray-400">
                  {typingUsers.join(', ')} is typing...
                  <div className="typing-indicator mt-1">
                    <div className="typing-dot" style={{ animationDelay: '0s' }} />
                    <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                    <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleTyping}
                    onBlur={handleStopTyping}
                    className="input-field flex-1"
                  />
                  <button type="submit" className="btn-primary px-6">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a chat</h3>
                <p className="text-gray-400">Choose a session to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
