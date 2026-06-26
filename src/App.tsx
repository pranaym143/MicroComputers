import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Courses from './components/Courses';
import CertificatePortal from './components/CertificatePortal';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { getSavedSupabaseConfig } from './lib/supabase';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('micro_computers_admin_session') === 'active';
  });
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(!!getSavedSupabaseConfig());

  // Scroll Section Spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'courses', 'certificates', 'reviews', 'contact'];
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      try {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } catch (e) {
        // Fallback for sandboxed iframes or older engines
        el.scrollIntoView({ behavior: 'auto' });
      }
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030014] text-white selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* GLOBAL FULL-SCREEN BACKGROUND VIDEO */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover pointer-events-none select-none"
        >
          <source 
            src="https://res.cloudinary.com/dqpsyh7yu/video/upload/v1782461159/18069232-uhd_3840_2160_24fps_m7jkfv.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
        {/* Highly transparent dark overlay with extreme clarity and minimal blur for high readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030014]/12 via-[#030014]/15 to-[#030014]/22 pointer-events-none select-none" />
      </div>

      {/* Background Grid Accent */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f1a3a_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.05] pointer-events-none z-1" />

      {/* Primary Navigation */}
      <Navbar
        activeSection={activeSection}
        onNavigate={navigateToSection}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Sections */}
      <main>
        {/* HERO SECTION */}
        <Hero
          onExploreCourses={() => navigateToSection('courses')}
          onSearchCertificates={() => navigateToSection('certificates')}
        />

        {/* ABOUT SECTION */}
        <About />

        {/* COURSES SECTION */}
        <Courses />

        {/* STUDENT CERTIFICATE PORTAL */}
        <CertificatePortal />

        {/* REVIEW TESTIMONIALS SECTION */}
        <Reviews />

        {/* CONTACT SECTION */}
        <Contact />
      </main>

      {/* FOOTER */}
      <Footer onNavigate={navigateToSection} />

      {/* ADMIN DASHBOARD CONSOLE (MODAL) */}
      {isAdminOpen && (
        <AdminPanel
          onClose={() => {
            setIsAdminOpen(false);
            setIsAdminLoggedIn(false);
            localStorage.removeItem('micro_computers_admin_session');
          }}
          onLoginStateChange={(isLoggedIn) => setIsAdminLoggedIn(isLoggedIn)}
          onSupabaseStateChange={(isConnected) => setIsSupabaseConnected(isConnected)}
        />
      )}
    </div>
  );
}
