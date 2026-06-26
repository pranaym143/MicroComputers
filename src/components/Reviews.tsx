import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, Heart } from 'lucide-react';

export default function Reviews() {
  const reviewsList = [
    {
      id: 'rev-1',
      name: 'Karunakar Sarabu',
      title: 'Certified Alumnus',
      rating: 5,
      review: 'Memorable',
      fullReview: 'Attending Micro Computers was a memorable milestone in my educational journey. The training is very systematic, and the practical sessions helped me understand complex programming concepts easily.',
      color: 'from-violet-500/20 to-purple-500/5'
    },
    {
      id: 'rev-2',
      name: 'Sriram Shiva',
      title: 'Tally & Basics Alumnus',
      rating: 5,
      review: 'Positive Communication',
      fullReview: 'Very positive and transparent communication. The staff and tutors here are incredibly helpful. They explain every topic until you fully grasp it. Highly recommended for computer education in Bhongir.',
      color: 'from-blue-500/20 to-indigo-500/5'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden scroll-mt-24" id="reviews">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[20%] left-[-10%] bg-glow-blue" />
      <div className="absolute bottom-[10%] right-[-10%] bg-glow-purple" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20" id="reviews-header">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase font-mono tracking-[0.2em] text-violet-400 font-semibold mb-4"
          >
            STUDENT VOICES
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight"
          >
            Stories of <span className="text-gradient">Student Success</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#e2e8f0] text-sm sm:text-base leading-relaxed"
          >
            Read reviews from our students who graduated and established bright careers using skills acquired at Micro Computers.
          </motion.p>
        </div>

        {/* Testimonials layout */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto" id="reviews-grid">
          {reviewsList.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="glass-card p-8 md:p-10 rounded-3xl relative overflow-hidden group flex flex-col justify-between"
              id={`review-card-${rev.id}`}
            >
              {/* Giant backdrop Quote mark */}
              <Quote className="absolute right-8 top-8 w-16 h-16 text-white/3 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              
              {/* Card top gradient indicator */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rev.color} opacity-40`} />

              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Main Review Phrase */}
                <h3 className="text-xl font-display font-semibold text-white mb-4 italic group-hover:text-violet-300 transition-colors">
                  &ldquo;{rev.review}&rdquo;
                </h3>

                {/* Review Description */}
                <p className="text-[#e2e8f0] text-xs sm:text-sm leading-relaxed font-light mb-8">
                  {rev.fullReview}
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="border-t border-white/5 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500/20 to-blue-500/20 border border-violet-500/30 flex items-center justify-center font-display font-semibold text-violet-400 text-sm">
                    {rev.name.charAt(0)}
                  </div>
                  <div className="text-left">
                     <p className="text-sm font-semibold text-white leading-none">{rev.name}</p>
                     <p className="text-[10px] font-mono text-[#e2e8f0] uppercase tracking-widest mt-1.5">{rev.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <Heart className="w-3 h-3 fill-emerald-400" />
                  Verified
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aggregate trust badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center max-w-md mx-auto p-6 rounded-2xl bg-white/2 border border-white/5"
          id="reviews-aggregate"
        >
          <p className="text-xs text-[#e2e8f0] leading-relaxed font-mono">
            Google Business Rating: <strong className="text-white">3.0 ★★★☆☆</strong> (4 verified local reviews)
          </p>
        </motion.div>
      </div>
    </section>
  );
}
