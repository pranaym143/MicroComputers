import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending message
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSent(false), 5000);
    }, 1500);
  };

  const phoneNum = '+919640514341';
  const whatsappUrl = `https://wa.me/919640514341?text=Hi%2C%20I%20am%20interested%20in%20courses%20at%20Micro%20Computers%20Institute.`;

  return (
    <section className="py-24 relative overflow-hidden scroll-mt-24" id="contact">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[10%] left-[-10%] bg-glow-purple" />
      <div className="absolute bottom-[10%] right-[-10%] bg-glow-blue" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20" id="contact-header">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase font-mono tracking-[0.2em] text-violet-400 font-semibold mb-4"
          >
            GET IN TOUCH
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight"
          >
            Connect With Our <span className="text-gradient">Admissions Desk</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#e2e8f0] text-sm sm:text-base leading-relaxed"
          >
            Have a question about class timings, batches, or certificates? Contact our registrar directly or drop by the campus.
          </motion.p>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-12" id="contact-grid">
          {/* Left: Contact Info & Action Buttons */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Institution details Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card p-8 rounded-3xl border border-white/5 space-y-6"
                id="contact-info-card"
              >
                <h3 className="font-display font-semibold text-xl text-white">Micro Computers</h3>
                <div className="w-12 h-0.5 bg-violet-500" />

                <div className="space-y-5">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs uppercase font-mono tracking-wider text-[#e2e8f0] font-bold">Address</p>
                      <p className="text-[#e2e8f0] text-sm mt-1 leading-relaxed">
                        Near Bus Stand Main Road,<br />
                        Kiran Road, Bhuvanagiri,<br />
                        Telangana 508116
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs uppercase font-mono tracking-wider text-[#e2e8f0] font-bold">Phone</p>
                      <a href={`tel:${phoneNum}`} className="text-[#e2e8f0] hover:text-white text-sm mt-1 block font-semibold transition-colors">
                        +91 96405 14341
                      </a>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>

            {/* Quick dial and whatsapp actions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
              id="contact-actions"
            >
              <a
                href={`tel:${phoneNum}`}
                className="glass-button-primary px-6 py-4 rounded-2xl text-xs font-mono font-semibold tracking-wider text-white text-center flex items-center justify-center gap-2 grow cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                CALL REGISTRAR
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-button px-6 py-4 rounded-2xl text-xs font-mono font-semibold tracking-wider text-emerald-400 hover:text-white text-center flex items-center justify-center gap-2 grow cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                WHATSAPP CHAT
              </a>
            </motion.div>
          </div>

          {/* Right: Interactive Maps & Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Map Iframe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-[280px] w-full relative"
              id="google-maps-container"
            >
              <iframe
                title="Micro Computers Location Map"
                src="https://maps.google.com/maps?q=BIIT%20COMPUTER%20EDUCATION%20BHONGIR%20Bhuvanagiri%20Telangana&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>

            {/* Simulated message form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 relative"
              id="contact-form-container"
            >
              <h3 className="font-display font-semibold text-lg text-white mb-6 text-left">Quick Query Box</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 text-left">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#e2e8f0] font-bold">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Karunakar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#e2e8f0] font-bold">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#e2e8f0] font-bold">Your Message</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ask us anything about courses, certificates, or timing..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full glass-input p-4 rounded-xl text-white text-xs resize-none"
                  />
                </div>

                {sent && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2.5 items-center">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Your inquiry has been successfully sent to the admin office. We will reply shortly!</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="glass-button px-6 py-3 rounded-xl text-[11px] font-mono font-semibold tracking-wider text-white flex items-center gap-2 cursor-pointer"
                  >
                    {sending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-violet-400" />
                        SEND ENQUIRY
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
