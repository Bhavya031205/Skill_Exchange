import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ShoppingBag, Check, Lock, Clock, Zap } from 'lucide-react';
import { shopApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getBoostStatus, activateBoost } from './Games';
import toast from 'react-hot-toast';
 
const Shop = () => {
  const { user, fetchUser } = useAuth();
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [boostStatus, setBoostStatus] = useState(getBoostStatus());
  const boostTimerRef = useRef(null);
 
  // Track boost countdown
  useEffect(() => {
    boostTimerRef.current = setInterval(() => {
      setBoostStatus(getBoostStatus());
    }, 1000);
    return () => clearInterval(boostTimerRef.current);
  }, []);
 
  useEffect(() => {
    loadShopData();
  }, []);
 
  const loadShopData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([
        shopApi.getItems(),
        shopApi.getInventory(),
      ]);
      setItems(itemsRes.data.data);
      setInventory(invRes.data.data);
    } catch (error) {
      toast.error('Failed to load shop');
    } finally {
      setLoading(false);
    }
  };
 
  const handlePurchase = async (item) => {
    if ((user?.coins || 0) < item.price) {
      toast.error(`Need ${item.price - user.coins} more coins! 💰`);
      return;
    }
    setPurchasing(item.id);
    try {
      await shopApi.purchase(item.id);
 
      // If it's an XP boost, activate the local timer
      if (item.type === 'boost' && item.name.toLowerCase().includes('xp boost')) {
        activateBoost(60 * 60 * 1000); // 1 hour
        setBoostStatus(getBoostStatus());
        toast.success(`🚀 XP Boost activated! Double XP for 1 hour!`);
      } else {
        toast.success(`Purchased ${item.name}! ${item.icon}`);
      }
 
      await Promise.all([loadShopData(), fetchUser()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };
 
  const isOwned = (itemId) => inventory.some(i => i.id === itemId);
 
  // Unlock requirement: items with price 100+ need 10 sessions
  // This is a UI hint only (actual check is on backend)
  const getUnlockHint = (item) => {
    if (item.price >= 100 && !isOwned(item.id)) {
      const sessionsNeeded = Math.floor(item.price / 10);
      if ((user?.coins || 0) < item.price) {
        return `Need ${item.price - (user?.coins || 0)} more coins`;
      }
    }
    return null;
  };
 
  const formatBoostTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m left`;
    if (m > 0) return `${m}m ${s}s left`;
    return `${s}s left`;
  };
 
  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);
 
  const categories = [
    { value: 'all',    label: 'All Items', emoji: '🛍️' },
    { value: 'avatar', label: 'Avatars',   emoji: '👤' },
    { value: 'theme',  label: 'Themes',    emoji: '🎨' },
    { value: 'badge',  label: 'Badges',    emoji: '🏅' },
    { value: 'boost',  label: 'Boosts',    emoji: '⚡' },
  ];
 
  const typeIcons = { avatar: '👤', theme: '🎨', badge: '🏅', boost: '⚡' };
 
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <ShoppingBag className="w-7 h-7 text-yellow-400" />
            SkillSwap Shop
          </h1>
          <p className="text-gray-400 text-sm mt-1">Spend your coins on cool rewards!</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-bold text-lg">{user?.coins || 0}</span>
          <span className="text-yellow-600 text-sm">Coins</span>
        </div>
      </div>
 
      {/* Active XP Boost Banner */}
      <AnimatePresence>
        {boostStatus.active && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-xl"
          >
            <Zap className="w-5 h-5 text-violet-400 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-violet-400">XP Boost is Active!</p>
              <p className="text-xs text-gray-500">You're earning 2x XP on all activities</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-bold text-violet-400 tabular-nums">
                {formatBoostTime(boostStatus.remaining)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === cat.value
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>
 
      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => {
            const owned = isOwned(item.id);
            const canAfford = (user?.coins || 0) >= item.price;
            const isXpBoost = item.type === 'boost' && item.name.toLowerCase().includes('xp boost');
            const boostActive = isXpBoost && boostStatus.active;
            const hint = getUnlockHint(item);
 
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-gray-900 border rounded-2xl p-5 flex flex-col transition-all group ${
                  owned
                    ? 'border-green-500/30 hover:border-green-500/50'
                    : boostActive
                    ? 'border-violet-500/30 hover:border-violet-500/50'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                {/* Owned badge */}
                {owned && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
 
                {/* Active boost indicator */}
                {boostActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[10px] text-violet-400 font-bold">ACTIVE</span>
                  </div>
                )}
 
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${
                    owned ? 'bg-green-500/10' : 'bg-gray-800'
                  }`}>
                    {item.icon || typeIcons[item.type] || '📦'}
                  </div>
                </div>
 
                {/* Info */}
                <div className="text-center flex-1">
                  <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
 
                  {/* Boost timer when owned and active */}
                  {isXpBoost && owned && boostStatus.active && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-violet-400">
                      <Clock className="w-3 h-3" />
                      <span className="tabular-nums">{formatBoostTime(boostStatus.remaining)}</span>
                    </div>
                  )}
                </div>
 
                {/* Price + buy */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                    <Coins className="w-3.5 h-3.5" />
                    {item.price}
                  </div>
 
                  {owned ? (
                    <span className="px-3 py-1 bg-green-500/15 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                      Owned
                    </span>
                  ) : boostActive ? (
                    <span className="px-3 py-1 bg-violet-500/15 text-violet-400 text-xs font-semibold rounded-full border border-violet-500/20">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={purchasing === item.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        canAfford
                          ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                      title={canAfford ? `Buy for ${item.price} coins` : `Need ${item.price - (user?.coins||0)} more coins`}
                    >
                      {purchasing === item.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : canAfford ? (
                        'Buy'
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          {item.price - (user?.coins || 0)} more
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
 
      {/* Inventory section */}
      {inventory.length > 0 && (
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <span>🎒</span> Your Inventory
            <span className="text-xs text-gray-500 font-normal">({inventory.length} items)</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {inventory.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-xs font-medium text-white">{item.name}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
 
export default Shop;