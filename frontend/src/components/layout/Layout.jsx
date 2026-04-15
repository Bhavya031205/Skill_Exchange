import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { ArrowLeft } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-900">
      {!isHomePage && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-20 left-4 z-50 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-full border border-gray-700 transition-all duration-200 group"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      )}
      <Navbar />
      <div className="flex">
        {!isHomePage && <Sidebar />}
        <main className={`flex-1 ${!isHomePage ? 'ml-64 mt-16' : ''} p-6`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
