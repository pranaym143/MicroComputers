import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, GraduationCap, Award, BookOpen, ChevronRight, FileDown } from 'lucide-react';

interface HeroProps {
  onExploreCourses: () => void;
  onSearchCertificates: () => void;
}

export default function Hero({ onExploreCourses, onSearchCertificates }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const contentY = useTransform(scrollY, [0, 600], [0, 100]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-transparent" 
      id="home"
    >
      {/* Background Decorative Blobs */}
      <div className="absolute top-[10%] left-[5%] bg-glow-purple pointer-events-none opacity-40 z-1" />
      <div className="absolute bottom-[10%] right-[5%] bg-glow-blue pointer-events-none opacity-40 z-1" />
      
      {/* Radial overlay to dim corners */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#030014] pointer-events-none z-1" />

      {/* Floating Particle Stars */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-1">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `pulse ${Math.random() * 4 + 3}s infinite alternate`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: Headline & Description */}
        <motion.div 
          style={{ y: contentY }}
          className="lg:col-span-7 flex flex-col items-start text-left"
        >
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 hover:border-violet-500/30 transition-colors shadow-inner"
            id="hero-badge"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-[11px] font-mono tracking-wider text-violet-300 uppercase font-bold">
              ISO 9001:2015 CERTIFIED IT INSTITUTE
            </span>
          </motion.div>

          {/* Headline (Updated to prompt instruction) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-white mb-4 leading-none"
            id="hero-title"
          >
            MICRO COMPUTERS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-lg sm:text-xl md:text-2xl font-mono text-violet-400 font-semibold uppercase tracking-wider mb-8"
            id="hero-subheadline-inst"
          >
            Professional Computer Training Institute
          </motion.p>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#e2e8f0] text-base sm:text-lg leading-relaxed max-w-2xl mb-10"
            id="hero-subheading"
          >
            Micro Computers has been empowering students with industry-relevant IT skills, hands-on labs, and recognized professional certifications to build successful global tech careers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
            id="hero-actions"
          >
            <button
              onClick={onExploreCourses}
              className="glass-button-orange px-8 py-4 rounded-full text-sm font-semibold tracking-wide text-white flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 transform active:scale-95"
              id="hero-explore-btn"
            >
              Explore Courses
              <BookOpen className="w-4 h-4" />
            </button>
             <button
              onClick={onSearchCertificates}
              className="glass-button-gold px-8 py-4 rounded-full text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              id="hero-cert-btn"
            >
              Download Certificates
              <FileDown className="w-4 h-4 text-[#fef3c7] group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Right: Glass Floating Interactive Card Display */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <div className="relative w-full max-w-[420px] aspect-square flex justify-center items-center">
            {/* Background circular gradients representing high-end 3D artwork */}
            <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 opacity-25 blur-3xl animate-pulse" />

            {/* Central Master Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              whileHover={{ rotateY: 10, rotateX: -5, scale: 1.02 }}
              style={{ perspective: 1000 }}
              className="absolute w-full p-8 rounded-3xl glass-card-slider-purple flex flex-col justify-between cursor-pointer"
              id="hero-feature-card"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-blue-500/20 border border-violet-500/30">
                  <GraduationCap className="w-8 h-8 text-violet-400" />
                </div>
                <div className="text-[10px] font-mono tracking-widest text-violet-400 font-bold uppercase bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
                  ESTD 2005
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-2xl text-white mb-2 leading-snug">
                  Micro Computers
                </h3>
                <p className="text-gray-400 text-xs font-mono tracking-wide leading-relaxed">
                  BHUVANAGIRI, TELANGANA
                </p>
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                  <span>Registered IT Certification Center</span>
                  <Award className="w-5 h-5 text-amber-500/80" />
                </div>
              </div>
            </motion.div>

            {/* Floating Mini-Card 1: Year Indicator */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 30 }}
              animate={{ opacity: 1, x: -50, y: -70 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl glass-card-slider-purple z-20"
              id="hero-stat-card-1"
            >
              <div className="h-2 w-2 rounded-full bg-violet-400 animate-ping" />
              <div className="text-left">
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Experience</p>
                <p className="text-sm font-semibold text-white">20+ Years</p>
              </div>
            </motion.div>

            {/* Floating Mini-Card 2: Course Count */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -30 }}
              animate={{ opacity: 1, x: 70, y: 80 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="absolute hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl glass-card-slider-purple z-20"
              id="hero-stat-card-2"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Award className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">ISO Certified</p>
                <p className="text-sm font-semibold text-white">100% Genuine</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
