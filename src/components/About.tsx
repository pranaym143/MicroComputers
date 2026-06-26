import React from 'react';
import { motion } from 'motion/react';
import { Award, Briefcase, GraduationCap, Users, CheckCircle2 } from 'lucide-react';

export default function About() {
  const cards = [
    {
      icon: <GraduationCap className="w-6 h-6 text-violet-400" />,
      title: '20+ Years Excellence',
      description: 'Serving Bhuvanagiri and surrounding regions with high-quality, practical computer and IT education since 2005.',
      gradient: 'from-violet-500/20 to-indigo-500/10'
    },
    {
      icon: <Briefcase className="w-6 h-6 text-blue-400" />,
      title: 'Professional Training',
      description: 'Hands-on practical training designed around industrial requirements to prepare students for corporate roles and data tasks.',
      gradient: 'from-blue-500/20 to-teal-500/10'
    },
    {
      icon: <Award className="w-6 h-6 text-amber-400" />,
      title: 'Official Certification',
      description: 'Authorized certification support helping students clear technical modules and obtain valid, searchable job-ready certifications.',
      gradient: 'from-amber-500/20 to-orange-500/10'
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      title: 'Student-First Mentorship',
      description: 'Personalized guidance, flexible timing, and dedicated laboratory sessions designed to help each student succeed.',
      gradient: 'from-emerald-500/20 to-teal-500/10'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden scroll-mt-24" id="about">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[20%] right-[-10%] bg-glow-blue" />
      <div className="absolute bottom-[-10%] left-[-10%] bg-glow-purple" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-20" id="about-header">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase font-mono tracking-[0.2em] text-violet-400 font-semibold mb-4"
          >
            WHO WE ARE
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight leading-none"
          >
            Nurturing Digital Creators <br />
            & <span className="text-gradient">Technical Masters</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#e2e8f0] text-sm sm:text-base leading-relaxed"
          >
            Micro Computers is Bhuvanagiri&apos;s leading computer academy, bridging the gap between standard textbooks and practical industry workflows through dedicated mentorship.
          </motion.p>
        </div>

        {/* Bento/Card Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" id="about-grid">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-card p-8 rounded-3xl flex flex-col justify-between group relative overflow-hidden"
              id={`about-card-${idx}`}
            >
              {/* Corner ambient glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`} />

              <div className="mb-8">
                <div className="p-3.5 rounded-2xl bg-white/3 border border-white/8 w-fit group-hover:border-violet-500/30 transition-colors">
                  {card.icon}
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg text-white mb-3 group-hover:text-violet-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[#e2e8f0] text-xs sm:text-sm leading-relaxed font-light">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 p-8 rounded-3xl glass-card border border-white/5 flex flex-col md:flex-row gap-8 justify-around items-center"
          id="about-trust-bar"
        >
          <div className="text-center">
            <h4 className="text-4xl font-display font-bold text-gradient-neon mb-1">20+</h4>
            <p className="text-xs uppercase font-mono tracking-widest text-[#e2e8f0]">Years of Legacy</p>
          </div>
          <div className="h-px w-12 md:h-12 md:w-px bg-white/10" />
          <div className="text-center">
            <h4 className="text-4xl font-display font-bold text-gradient-neon mb-1">5000+</h4>
            <p className="text-xs uppercase font-mono tracking-widest text-[#e2e8f0]">Students Certified</p>
          </div>
          <div className="h-px w-12 md:h-12 md:w-px bg-white/10" />
          <div className="text-center">
            <h4 className="text-4xl font-display font-bold text-gradient-neon mb-1">100%</h4>
            <p className="text-xs uppercase font-mono tracking-widest text-[#e2e8f0]">Practical Syllabus</p>
          </div>
          <div className="h-px w-12 md:h-12 md:w-px bg-white/10" />
          <div className="text-center">
            <h4 className="text-4xl font-display font-bold text-gradient-neon mb-1">4.8★</h4>
            <p className="text-xs uppercase font-mono tracking-widest text-[#e2e8f0]">Averaged Trust</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
