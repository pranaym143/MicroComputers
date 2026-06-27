import React from 'react';
import { Monitor, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="py-12 border-t border-white/5 relative z-10 bg-[#030014]/40" id="footer">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer group"
          id="footer-logo"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:border-violet-500/30 transition-all flex items-center justify-center">
            <img 
              src="https://res.cloudinary.com/dqpsyh7yu/image/upload/v1782560428/ChatGPT_Image_Jun_27_2026_05_08_15_PM_poms0i.png" 
              alt="Micro Computers Logo" 
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-white block">
              MICRO COMPUTERS
            </span>
            <span className="text-[8px] uppercase font-mono tracking-[0.2em] text-gray-500 block">
              Bhuvanagiri Academy
            </span>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 font-mono tracking-wide">
          © {new Date().getFullYear()} Micro Computers. All rights reserved. Registered ISO Center.
        </p>

        {/* Credits */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>for Excellence</span>
        </div>
      </div>
    </footer>
  );
}
