import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
 
const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const showBack = location.pathname !== '/dashboard';
  const title = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1];
 
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 mt-16 min-h-[calc(100vh-4rem)]">
          {/* Page Header with back button */}
          {showBack && title && (
            <div className="sticky top-16 z-30 bg-gray-950/90 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 py-3 flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 -ml-1 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-semibold text-gray-400">{title}</h2>
            </div>
          )}
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
 
export default Layout;