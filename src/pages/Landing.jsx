import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, PlusCircle, ShieldCheck, Zap, BrainCircuit, Camera, Cpu, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center pt-10">
      
      {/* Hero Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-sm font-semibold tracking-wide">AI-POWERED SEARCH 2.0</span>
      </motion.div>

      {/* Hero Title */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 max-w-4xl mx-auto leading-none text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-300 to-blue-500 drop-shadow-xl"
      >
        RECOVER WHAT YOU'VE LOST WITH <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-white to-slate-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">INTELLIGENT AI</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
      >
        FindIt AI leverages next-gen computer vision to instantly match your lost valuables. Simply upload, scan, and reconnect.
      </motion.p>

      {/* Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-5 mb-24"
      >
        <Link to="/lost" className="btn btn-primary px-8 py-4 flex items-center gap-3 text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all rounded-xl font-bold">
          <Search size={22} />
          I Lost Something
        </Link>
        <Link to="/found" className="px-8 py-4 flex items-center gap-3 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all rounded-xl font-bold border border-white/10">
          <PlusCircle size={22} />
          I Found Something
        </Link>
      </motion.div>

      {/* How It Works Flow */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="mb-20 w-full max-w-5xl mx-auto px-4"
      >
          <h2 className="text-lg font-bold text-slate-400 mb-6 tracking-widest uppercase">Simple Process</h2>
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-10 md:gap-4 glass-premium p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-blue-500/5 blur-3xl pointer-events-none"/>
              
              {/* Animated Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-[3.5rem] left-20 right-20 h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  />
              </div>

              {[
                  { icon: <Camera size={28}/>, title: 'Upload Media', desc: 'Photo or Video' },
                  { icon: <Cpu size={28}/>, title: 'AI Analysis', desc: 'Smart Tagging' },
                  { icon: <Search size={28}/>, title: 'Instant Match', desc: 'Vector Search' },
                  { icon: <Users size={28}/>, title: 'Connect', desc: 'Secure Chat' }
              ].map((step, i) => (
                  <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 + 0.3, type: "spring", stiffness: 100 }}
                      className="relative z-10 flex flex-col items-center gap-5 group w-full md:w-auto"
                  >
                      {/* Icon Circle */}
                      <div className="w-24 h-24 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)] group-hover:scale-110 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_50px_-10px_rgba(6,182,212,0.4)] transition-all duration-500 relative overflow-hidden backdrop-blur-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                          {step.icon}
                      </div>
                      
                      {/* Text */}
                      <div className="text-center">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1 group-hover:text-cyan-300 transition-colors">{step.title}</h4>
                          <p className="text-xs text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{step.desc}</p>
                      </div>
                  </motion.div>
              ))}
          </div>
      </motion.div>

      {/* Features */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-24 text-left w-full max-w-6xl mx-auto"
      >
         <h2 className="text-center text-lg font-bold text-slate-400 mb-10 tracking-widest uppercase">Why Choose FindIt AI</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { icon: <BrainCircuit className="text-indigo-400 group-hover:text-teal-400 transition-colors w-8 h-8" />, title: "AI Matching", desc: "Deep learning models analyze images and text specific features." },
                { icon: <Zap className="text-teal-400 group-hover:text-indigo-400 transition-colors w-8 h-8" />, title: "Real-time", desc: "Instant matching engine gives results with confidence scores." },
                { icon: <ShieldCheck className="text-indigo-300 group-hover:text-teal-300 transition-colors w-8 h-8" />, title: "Secure", desc: "Privacy-focused platform with explainable AI decisions." }
            ].map((f, i) => (
                <div key={i} className="glass-premium p-8 border border-white/5 hover:border-teal-500/30 hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)] transition-all duration-300 group cursor-default relative overflow-hidden bg-white/5 backdrop-blur-md rounded-3xl">
                    <div className="mb-6 bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">{f.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-200 transition-colors">{f.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
            ))}
         </div>
      </motion.div>

    </div>
  )
}
