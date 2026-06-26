import React, { useState, useEffect } from 'react';
import { Menu, X, Monitor, ShieldCheck, Database } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  isSupabaseConnected: boolean;
}

export default function Navbar({
  activeSection,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn,
  isSupabaseConnected
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Courses', id: 'courses' },
    { label: 'Certificates', id: 'certificates' },
    { label: 'Reviews', id: 'reviews' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'py-4 bg-[#030014]/80 backdrop-blur-md border-b border-white/5'
          : 'py-6 bg-transparent'
      }`}
      id="app-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div 
          onClick={() => handleItemClick('home')}
          className="flex items-center gap-2 lg:gap-3 cursor-pointer group shrink-0"
          id="nav-logo"
        >
          <div className="p-2 lg:p-2.5 rounded-xl bg-gradient-to-tr from-violet-600/20 to-blue-600/20 border border-violet-500/30 group-hover:border-violet-500/60 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <Monitor className="w-4 h-4 lg:w-5 lg:h-5 text-violet-400 group-hover:text-violet-300 transition-colors" />
          </div>
          <div className="text-left">
            <span className="font-display font-bold text-lg lg:text-xl tracking-tight text-white block leading-none">
              MICRO
            </span>
            <span className="text-[9px] lg:text-[10px] uppercase font-mono tracking-[0.25em] text-violet-400 font-semibold block mt-1">
              Computers
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center shrink-0 gap-0.5 bg-black/45 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`px-2.5 lg:px-4 xl:px-5 py-2 rounded-full text-[11px] lg:text-xs xl:text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer liquid-glass-tab-btn ${
                activeSection === item.id ? 'active' : ''
              }`}
              id={`nav-link-${item.id}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Top-Right Side Actions */}
        <div className="hidden md:flex items-center shrink-0 gap-2 lg:gap-4">
          {isSupabaseConnected && (
            <div className="hidden xl:flex items-center gap-1.5 text-[10px] lg:text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 lg:px-3 py-1.5 rounded-full">
              <Database className="w-3 h-3" />
              Supabase Connected
            </div>
          )}
          <button
            onClick={onOpenAdmin}
            className="glass-button px-3 lg:px-5 py-2.5 rounded-full text-[10px] lg:text-xs font-mono font-semibold text-white tracking-wider flex items-center gap-1.5 lg:gap-2 cursor-pointer relative group overflow-hidden"
            id="nav-admin-btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-violet-400 group-hover:text-violet-300 transition-colors shrink-0" />
            <span>
              <span className="hidden lg:inline">{isAdminLoggedIn ? 'ADMIN PANEL' : 'ADMIN LOGIN'}</span>
              <span className="lg:hidden">{isAdminLoggedIn ? 'ADMIN' : 'LOGIN'}</span>
            </span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          {isSupabaseConnected && (
            <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-3.5 h-3.5" />
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl border border-white/10 text-white cursor-pointer"
            id="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop & Panel */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-[77px] bottom-0 bg-[#030014]/95 backdrop-blur-lg z-40 flex flex-col p-6 md:hidden border-t border-white/5 overflow-y-auto"
          id="mobile-nav-panel"
        >
          <div className="flex flex-col gap-4 mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full py-4 px-6 rounded-2xl text-left text-base font-semibold tracking-wide transition-all liquid-glass-tab-btn ${
                  activeSection === item.id ? 'active' : ''
                }`}
                id={`mobile-nav-link-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto pb-8">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAdmin();
              }}
              className="w-full glass-button py-4 rounded-2xl text-sm font-semibold tracking-wider flex items-center justify-center gap-3 text-white"
              id="mobile-nav-admin-btn"
            >
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              {isAdminLoggedIn ? 'OPEN ADMIN DASHBOARD' : 'ADMIN LOGIN'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
