import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Lock, Bell, Palette, Shield, Trash2,
  Save, ChevronRight, Check, Moon, Sun, Monitor,
  Eye, EyeOff, AlertTriangle
} from 'lucide-react';
 
const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];
 
const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
 
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
  });
 
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
 
  const [notifSettings, setNotifSettings] = useState({
    matchRequests: true,
    sessionReminders: true,
    achievements: true,
    messages: true,
    weeklyDigest: false,
    marketing: false,
  });
 
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showEmail: false,
    showStreak: true,
    showXP: true,
    allowMessages: true,
  });
 
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      updateUser(profileForm);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };
 
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
    setSaving(false);
  };
 
  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences</p>
      </div>
 
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-white/5 last:border-0 ${
                  activeSection === section.id
                    ? section.id === 'danger'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-sky-500/10 text-sky-400'
                    : section.id === 'danger'
                    ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <section.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            ))}
          </div>
        </div>
 
        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSection === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 border border-white/5 rounded-2xl p-6 space-y-5"
              >
                <h2 className="font-semibold text-white">Profile Information</h2>
 
                {/* Avatar */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-medium">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <button className="px-3 py-1.5 bg-gray-800 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:border-white/20 transition-colors">
                        Upload photo
                      </button>
                      <p className="text-xs text-gray-600 mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>
                </div>
 
                {/* Username */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Username</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50"
                  />
                  <p className="text-xs text-gray-600 mt-1">Only letters, numbers, and underscores</p>
                </div>
 
                {/* Email (read only) */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-800/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-600 mt-1">Contact support to change your email</p>
                </div>
 
                {/* Bio */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Bio</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell the community about yourself, your interests, and what you're learning..."
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50 resize-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">{profileForm.bio.length}/200 characters</p>
                </div>
 
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </motion.div>
            )}
 
            {activeSection === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 border border-white/5 rounded-2xl p-6 space-y-5"
              >
                <h2 className="font-semibold text-white">Security</h2>
 
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {[
                    { key: 'current', label: 'Current Password' },
                    { key: 'new', label: 'New Password' },
                    { key: 'confirm', label: 'Confirm New Password' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-400 mb-1.5 font-medium">{field.label}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwords[field.key]}
                          onChange={e => setPasswords({ ...passwords, [field.key]: e.target.value })}
                          className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-sky-500/50"
                        />
                        {field.key === 'new' && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
 
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </form>
 
                <div className="border-t border-white/5 pt-4">
                  <h3 className="font-medium text-white mb-3">Active Sessions</h3>
                  <div className="bg-gray-800 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Current Device</p>
                      <p className="text-xs text-gray-500">Web Browser · Active now</p>
                    </div>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">Current</span>
                  </div>
                </div>
              </motion.div>
            )}
 
            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 border border-white/5 rounded-2xl p-6 space-y-4"
              >
                <h2 className="font-semibold text-white">Notification Preferences</h2>
                {[
                  { key: 'matchRequests', label: 'Match Requests', desc: 'When someone wants to match with you' },
                  { key: 'sessionReminders', label: 'Session Reminders', desc: '30 min before a scheduled session' },
                  { key: 'achievements', label: 'Achievement Unlocked', desc: 'When you earn a new badge' },
                  { key: 'messages', label: 'Chat Messages', desc: 'When you receive a new message' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your week on SkillSwap' },
                  { key: 'marketing', label: 'Product Updates', desc: 'New features and announcements' },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{notif.label}</p>
                      <p className="text-xs text-gray-500">{notif.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifSettings({ ...notifSettings, [notif.key]: !notifSettings[notif.key] })}
                      className={`relative w-10 h-5.5 rounded-full transition-colors focus:outline-none ${notifSettings[notif.key] ? 'bg-sky-500' : 'bg-gray-700'}`}
                      style={{ width: '40px', height: '22px' }}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${notifSettings[notif.key] ? 'translate-x-4.5' : 'translate-x-0'}`}
                           style={{ width: '18px', height: '18px', transform: notifSettings[notif.key] ? 'translateX(18px)' : 'translateX(0)' }} />
                    </button>
                  </div>
                ))}
                <button onClick={() => toast.success('Notification preferences saved!')} className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </motion.div>
            )}
 
            {activeSection === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 border border-white/5 rounded-2xl p-6 space-y-5"
              >
                <h2 className="font-semibold text-white">Appearance</h2>
                <div>
                  <label className="block text-xs text-gray-400 mb-3 font-medium">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                          theme.id === 'dark'
                            ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                            : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <theme.icon className="w-5 h-5" />
                        {theme.label}
                        {theme.id === 'dark' && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-3 font-medium">Accent Color</label>
                  <div className="flex gap-2">
                    {['bg-sky-500', 'bg-violet-500', 'bg-pink-500', 'bg-emerald-500', 'bg-orange-500'].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${color} ${color === 'bg-sky-500' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''} transition-transform hover:scale-110`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
 
            {activeSection === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 border border-white/5 rounded-2xl p-6 space-y-4"
              >
                <h2 className="font-semibold text-white">Privacy Settings</h2>
                {[
                  { key: 'profilePublic', label: 'Public Profile', desc: 'Let others find and view your profile' },
                  { key: 'showEmail', label: 'Show Email', desc: 'Display your email on your public profile' },
                  { key: 'showStreak', label: 'Show Streak', desc: 'Show your login streak to others' },
                  { key: 'showXP', label: 'Show XP & Level', desc: 'Display your level on leaderboards' },
                  { key: 'allowMessages', label: 'Allow Messages', desc: 'Let matched users message you' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => setPrivacySettings({ ...privacySettings, [setting.key]: !privacySettings[setting.key] })}
                      style={{ width: '40px', height: '22px' }}
                      className={`relative rounded-full transition-colors ${privacySettings[setting.key] ? 'bg-sky-500' : 'bg-gray-700'}`}
                    >
                      <div style={{ width: '18px', height: '18px', transform: privacySettings[setting.key] ? 'translateX(18px)' : 'translateX(0)' }}
                           className="absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform" />
                    </button>
                  </div>
                ))}
                <button onClick={() => toast.success('Privacy settings saved!')} className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors">
                  <Save className="w-4 h-4" /> Save Settings
                </button>
              </motion.div>
            )}
 
            {activeSection === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 border border-red-500/20 rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h2 className="font-semibold text-red-400">Danger Zone</h2>
                </div>
                <p className="text-sm text-gray-500">These actions are irreversible. Please proceed with caution.</p>
 
                <div className="space-y-4">
                  <div className="p-4 border border-red-500/20 rounded-xl">
                    <h3 className="font-medium text-white text-sm mb-1">Export My Data</h3>
                    <p className="text-xs text-gray-500 mb-3">Download all your data including skills, sessions, and achievements.</p>
                    <button onClick={() => toast.success('Data export requested. You will receive an email shortly.')} className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 border border-white/10 rounded-lg transition-colors">
                      Request Export
                    </button>
                  </div>
 
                  <div className="p-4 border border-red-500/30 rounded-xl bg-red-500/5">
                    <h3 className="font-medium text-red-400 text-sm mb-1">Delete Account</h3>
                    <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
                    <button
                      onClick={() => toast.error('To delete your account, please contact support.')}
                      className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
 
export default Settings;