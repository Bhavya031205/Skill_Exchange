import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Instagram, Mail } from 'lucide-react';
 
const Footer = () => {
  const currentYear = new Date().getFullYear();
 
  return (
    <footer className="bg-gray-950 border-t border-white/5 mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              A peer-to-peer skill exchange platform where students learn from each other.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:hello@skillswap.app" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
 
          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'How it works', href: '/about' },
                { label: 'Explore Skills', href: '/explore' },
                { label: 'Leaderboard', href: '/leaderboard' },
                { label: 'Shop', href: '/shop' },
                { label: 'Games', href: '/games' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
 
          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'Community Guidelines', href: '/guidelines' },
                { label: 'Report a Bug', href: '/feedback' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Safety Tips', href: '/safety' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
 
          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
 
            <div className="mt-6 p-3 bg-gray-900 border border-white/5 rounded-xl">
              <p className="text-xs text-gray-500 leading-relaxed">
                SkillSwap is free to use. We don't charge for matching, sessions, or core features.
              </p>
            </div>
          </div>
        </div>
 
        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {currentYear} SkillSwap. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </span>
            <span className="text-xs text-gray-600">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
 
export default Footer;