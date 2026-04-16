import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
 
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/explore': 'Explore Skills',
  '/profile': 'My Profile',
  '/sessions': 'My Sessions',
  '/chat': 'Messages',
  '/shop': 'Shop',
  '/leaderboard': 'Leaderboard',
  '/games': 'Games',
  '/settings': 'Settings',
};
 
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};
 
const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.pathname !== '/dashboard';
  const title = Object.entries(pageTitles).find(([p]) => location.pathname.startsWith(p))?.[1];
 
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 mt-16 min-h-[calc(100vh-4rem)]">
          {showBack && title && (
            <div className="sticky top-16 z-30 bg-gray-950/90 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 py-3 flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 -ml-1 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">{title}</h2>
            </div>
          )}
 
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-4 md:p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
 
      {/* Mobile bottom nav padding */}
      <div className="lg:hidden h-16" />
    </div>
  );
};
 
export default Layout;