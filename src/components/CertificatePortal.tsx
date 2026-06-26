import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Award, Download, Printer, RefreshCw, Eye, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { CertificateService } from '../lib/supabase';
import { StudentCertificate } from '../types';

export default function CertificatePortal() {
  const [hallTicket, setHallTicket] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [certificate, setCertificate] = useState<StudentCertificate | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hallTicket.trim()) {
      setError('Please enter a Hall Ticket Number');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(false);
    setCertificate(null);

    try {
      const match = await CertificateService.searchCertificate(hallTicket, studentName);
      if (match) {
        setCertificate(match);
      } else {
        setError('No certificate matches found for the provided details. Please check the Hall Ticket Number or contact support.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while retrieving certificate data. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleReset = () => {
    setHallTicket('');
    setStudentName('');
    setSearched(false);
    setCertificate(null);
    setError('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="py-24 relative overflow-hidden scroll-mt-24" id="certificates">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[10%] right-[-10%] bg-glow-purple" />
      <div className="absolute bottom-[20%] left-[-10%] bg-glow-blue" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="certificate-header">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase font-mono tracking-[0.2em] text-violet-400 font-semibold mb-4"
          >
            VERIFICATION PORTAL
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight"
          >
            Student <span className="text-gradient">Certificate Portal</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#e2e8f0] text-sm sm:text-base leading-relaxed"
          >
            Instantly verify and download academic records. Enter your unique Hall Ticket Number to retrieve your authorized computer certification.
          </motion.p>
        </div>

        {/* Portal Layout */}
        <div className="max-w-4xl mx-auto" id="certificate-portal-layout">
          {!searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden"
              id="search-form-container"
            >
              {/* Premium Glow line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Hall Ticket Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#e2e8f0] font-semibold">
                      Hall Ticket Number <span className="text-violet-400">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. MC-2026-001"
                        value={hallTicket}
                        onChange={(e) => setHallTicket(e.target.value)}
                        className="w-full glass-input pl-11 pr-4 py-3.5 rounded-xl text-white text-sm tracking-wide"
                        id="input-hall-ticket"
                      />
                    </div>
                    <span className="text-[11px] text-[#e2e8f0] font-mono">
                      Enter the unique ID printed on your hall ticket.
                    </span>
                  </div>

                  {/* Student Name Optional Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#e2e8f0] font-semibold">
                      Student Name <span className="text-[#e2e8f0]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Karunakar"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full glass-input px-4 py-3.5 rounded-xl text-white text-sm tracking-wide"
                      id="input-student-name"
                    />
                    <span className="text-[11px] text-[#e2e8f0] font-mono">
                      Matches partial name to add verification.
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-300 text-xs leading-relaxed" id="search-error">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="glass-button-primary px-8 py-4 rounded-xl text-xs font-mono font-semibold tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto min-w-[180px]"
                    id="btn-verify-certificate"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        VERIFYING...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        VERIFY CERTIFICATE
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Search Result display */}
          {searched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
              id="search-result-container"
            >
              {certificate ? (
                <>
                  {/* Result Header Stats card */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          VERIFIED AUTHENTIC
                        </span>
                        <h3 className="font-display font-semibold text-lg text-white mt-1">
                          Record Found: {certificate.student_name}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="glass-button px-5 py-2.5 rounded-xl text-xs font-mono text-[#e2e8f0] hover:text-white flex items-center gap-2 cursor-pointer"
                      id="btn-search-another"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      SEARCH ANOTHER
                    </button>
                  </div>

                  {/* Stunning Custom Premium Digital Certificate Visualizer */}
                  <div className="relative p-0.5 rounded-3xl bg-gradient-to-r from-amber-500/30 via-violet-500/20 to-blue-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                    <div 
                      className="print-certificate relative w-full aspect-[1.414] bg-[#0c0a20] rounded-[22px] border border-white/10 p-6 md:p-12 overflow-hidden flex flex-col justify-between"
                      style={{ backgroundImage: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.05) 0%, transparent 70%)' }}
                      id="digital-certificate-canvas"
                    >
                      {/* Watermark / Background Vector Seal */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <Award className="w-96 h-96 text-amber-500" />
                      </div>

                      {/* Golden border details */}
                      <div className="absolute inset-3 border border-amber-500/20 rounded-[14px] pointer-events-none" />
                      <div className="absolute inset-4 border border-amber-500/10 rounded-[10px] pointer-events-none" />
                      
                      {/* Gold corner accents */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500/50 rounded-tl-sm pointer-events-none" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500/50 rounded-tr-sm pointer-events-none" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-500/50 rounded-bl-sm pointer-events-none" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-500/50 rounded-br-sm pointer-events-none" />

                      {/* Certificate Header */}
                      <div className="text-center">
                        <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-bold">
                          MICRO COMPUTERS INSTITUTE
                        </span>
                        <p className="text-[8px] md:text-[10px] font-mono text-[#e2e8f0] uppercase tracking-widest mt-1">
                          BHUVANAGIRI, TELANGANA, INDIA
                        </p>
                        <h2 className="font-display font-bold text-xl md:text-3xl text-gradient-neon mt-4 md:mt-6 tracking-wide">
                          CERTIFICATE OF MERIT
                        </h2>
                        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mt-2" />
                      </div>

                      {/* Certificate Body */}
                      <div className="text-center my-4 md:my-6">
                        <p className="text-xs md:text-sm font-light text-[#e2e8f0] italic">
                          This is to proudly certify that
                        </p>
                        <h3 className="font-display font-semibold text-lg md:text-2xl text-white my-2 md:my-3">
                          {certificate.student_name}
                        </h3>
                        <p className="text-xs md:text-sm font-light text-[#e2e8f0] max-w-lg mx-auto leading-relaxed">
                          has successfully completed the professional curriculum and practical modules in
                        </p>
                        <h4 className="font-display font-medium text-base md:text-xl text-amber-300 my-2">
                          {certificate.course}
                        </h4>
                        <p className="text-xs md:text-sm font-light text-[#e2e8f0]">
                          held in the academic year <span className="text-white font-semibold">{certificate.year}</span> and is awarded this credential with grade <span className="text-white font-semibold">{certificate.grade || 'A'}</span>.
                        </p>
                      </div>

                      {/* Certificate Footer Signatures */}
                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                        <div className="text-left">
                          <p className="text-[9px] md:text-xs text-white font-mono">{certificate.hall_ticket_number}</p>
                          <p className="text-[8px] text-[#e2e8f0] font-mono uppercase tracking-widest mt-0.5">Verification HTN</p>
                        </div>

                        {/* Gold seal */}
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-500 animate-float-slow">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <span className="text-[7px] font-mono uppercase text-amber-400/80 tracking-widest mt-1">OFFICIAL SEAL</span>
                        </div>

                        <div className="text-right">
                          <div className="italic text-xs md:text-sm text-[#e2e8f0] font-serif pr-2">Micro Computers</div>
                          <div className="w-24 md:w-32 h-px bg-white/10 my-1" />
                          <p className="text-[8px] text-[#e2e8f0] font-mono uppercase tracking-widest">Managing Director</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={handlePrint}
                      className="glass-button px-6 py-3.5 rounded-xl text-xs font-mono font-semibold tracking-wider text-white flex items-center gap-2 cursor-pointer"
                      id="btn-print-certificate"
                    >
                      <Printer className="w-4 h-4 text-violet-400" />
                      PRINT / SAVE AS PDF
                    </button>

                    {certificate.certificate_url ? (
                      <a
                        href={certificate.certificate_url}
                        download={certificate.file_name || `certificate-${certificate.hall_ticket_number}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="glass-button-primary px-6 py-3.5 rounded-xl text-xs font-mono font-semibold tracking-wider text-white flex items-center gap-2 cursor-pointer"
                        id="btn-download-pdf"
                      >
                        <Download className="w-4 h-4" />
                        DOWNLOAD UPLOADED PDF
                      </a>
                    ) : (
                      <button
                        onClick={handlePrint}
                        className="glass-button-primary px-6 py-3.5 rounded-xl text-xs font-mono font-semibold tracking-wider text-white flex items-center gap-2 cursor-pointer opacity-90 hover:opacity-100"
                        id="btn-download-pdf-fallback"
                      >
                        <Download className="w-4 h-4" />
                        DOWNLOAD DIGITAL COPY
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center max-w-lg mx-auto" id="no-record-found">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">
                    No Certificate Found
                  </h3>
                  <p className="text-[#e2e8f0] text-xs sm:text-sm leading-relaxed mb-6">
                    We could not find any active computer certification matching the Hall Ticket Number <strong className="text-white">"{hallTicket}"</strong>.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleReset}
                      className="glass-button px-6 py-3.5 rounded-xl text-xs font-mono text-[#e2e8f0] hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      TRY AGAIN
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
