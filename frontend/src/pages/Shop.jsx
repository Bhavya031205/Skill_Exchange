import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, ShoppingBag, Check, Lock } from 'lucide-react';
import { shopApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Shop = () => {
  const { user, fetchUser } = useAuth();
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([
        shopApi.getItems(),
        shopApi.getInventory()
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
    if (user.coins < item.price) {
      toast.error(`Not enough coins! You need ${item.price - user.coins} more.`);
      return;
    }

    setPurchasing(item.id);
    try {
      await shopApi.purchase(item.id);
      toast.success(`Purchased ${item.name}! ${item.icon}`);
      await Promise.all([loadShopData(), fetchUser()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const isOwned = (itemId) => inventory.some(i => i.id === itemId);

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(i => i.type === filter);

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'avatar', label: 'Avatars' },
    { value: 'theme', label: 'Themes' },
    { value: 'badge', label: 'Badges' },
    { value: 'boost', label: 'Boosts' },
  ];

  const typeIcons = {
    avatar: '👤',
    theme: '🎨',
    badge: '🏅',
    boost: '⚡'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-gold-400" />
            SkillSwap Shop
          </h1>
          <p className="text-gray-400">Spend your coins on cool rewards!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-gold-400/20 border border-gold-400/30 rounded-full">
            <span className="flex items-center gap-2 text-gold-400 font-bold">
              <Coins className="w-5 h-5" />
              {user?.coins || 0} Coins
            </span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === cat.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => {
            const owned = isOwned(item.id);
            const canAfford = (user?.coins || 0) >= item.price;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card-glow relative ${owned ? 'border-green-500/50' : ''}`}
              >
                {owned && (
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-4xl mb-3">
                    {owned ? item.icon : typeIcons[item.type] || '📦'}
                  </div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gold-400 font-bold">
                    <Coins className="w-4 h-4" />
                    {item.price}
                  </div>
                  
                  {owned ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      Owned
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford || purchasing === item.id}
                      className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                        canAfford
                          ? 'bg-primary-500 hover:bg-primary-600 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {purchasing === item.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : canAfford ? (
                        'Buy'
                      ) : (
                        <>
                          <Lock className="w-3 h-3 inline mr-1" />
                          Need {item.price - user.coins} more
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

      {/* Your Inventory */}
      {inventory.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Your Inventory</h2>
          <div className="flex gap-4 flex-wrap">
            {inventory.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
