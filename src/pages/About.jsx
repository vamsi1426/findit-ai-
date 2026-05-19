import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Scan, Tags, Zap, Shield, Globe, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-12 relative">
       {/* Header */}
       <div className="text-center mb-16">
           <motion.span 
               initial={{opacity:0, y:-10}}
               animate={{opacity:1, y:0}}
               className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-4 inline-block"
           >
               Next Gen Technology
           </motion.span>
           <motion.h1 
               initial={{opacity:0, scale:0.9}}
               animate={{opacity:1, scale:1}}
               className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent mb-6"
           >
               Powered by Neural Networks
           </motion.h1>
           <motion.p 
               initial={{opacity:0}}
               animate={{opacity:1}}
               transition={{delay:0.2}}
               className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
           >
               FindIt AI combines computer vision, natural language processing, and vector similarity search to reunite you with your lost items faster than ever.
           </motion.p>
       </div>

       {/* 3 Core Pillars */}
       <div className="grid md:grid-cols-3 gap-8 mb-20">
           {/* AI Scan */}
           <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} whileHover={{y:-5}} className="glass-premium p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity opacity-50 group-hover:opacity-100"/>
               <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/10">
                   <Scan className="text-cyan-400" size={32}/>
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">AI Scanning</h3>
               <p className="text-gray-400 leading-relaxed text-sm">
                   Our advanced vision models analyze uploaded images pixel-by-pixel, using MobileNet to extract unique feature vectors that represent the item's visual identity, far beyond simple color matching.
               </p>
           </motion.div>

           {/* AI Tagging */}
           <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.1}} viewport={{once:true}} whileHover={{y:-5}} className="glass-premium p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity opacity-50 group-hover:opacity-100"/>
               <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
                   <Tags className="text-purple-400" size={32}/>
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">Smart Tagging</h3>
               <p className="text-gray-400 leading-relaxed text-sm">
                   Powered by Gemini 1.5 and Llama 3 and Groq, we automatically generate descriptive tags (e.g., "leather", "worn", "vintage") to enhance searchability, even if you forget to describe the details yourself.
               </p>
           </motion.div>

           {/* Matching */}
           <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.2}} viewport={{once:true}} whileHover={{y:-5}} className="glass-premium p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity opacity-50 group-hover:opacity-100"/>
               <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/10">
                   <BrainCircuit className="text-pink-400" size={32}/>
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">Instant Matching</h3>
               <p className="text-gray-400 leading-relaxed text-sm">
                   We use Cosine Similarity to compare your lost item's vector embedding against our database of found items, ranking matches by visual and semantic relevance in milliseconds.
               </p>
           </motion.div>
       </div>

       {/* Under the Hood Section */}
       <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="glass-premium p-10 md:p-14 relative overflow-hidden">
           {/* Background Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"/>

           <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
               <div>
                   <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                       <Cpu className="text-indigo-400"/> Under the Hood
                   </h2>
                   <ul className="space-y-8">
                       <li className="flex gap-5">
                           <div className="mt-1 w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20"><Scan className="text-cyan-400" size={20}/></div>
                           <div>
                               <h4 className="text-white font-bold text-lg">Deep Learning Vision</h4>
                               <p className="text-gray-400 text-sm mt-1">
                                   When you upload a photo, our MobileNetV2 model scans it pixel-by-pixel to identify distinct features (shape, texture, branding) and converts them into a unique mathematical vector.
                               </p>
                           </div>
                       </li>
                       <li className="flex gap-5">
                           <div className="mt-1 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20"><Tags className="text-purple-400" size={20}/></div>
                           <div>
                               <h4 className="text-white font-bold text-lg">Generative Autotagging</h4>
                               <p className="text-gray-400 text-sm mt-1">
                                   Gemini 1.5 and Groq Llama 3 analyzes the visual features to automatically generate intuitive tags (e.g., "leather wallet," "scratched screen") so you don't have to type every detail.
                               </p>
                           </div>
                       </li>
                       <li className="flex gap-5">
                           <div className="mt-1 w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20"><BrainCircuit className="text-pink-400" size={20}/></div>
                           <div>
                               <h4 className="text-white font-bold text-lg">Cross-Modal Matching</h4>
                               <p className="text-gray-400 text-sm mt-1">
                                   Our engine searches using both the visual pattern and the semantic meaning of tags, ensuring that a "Red Bag" fits the description of a "Crimson Purse" perfectly.
                               </p>
                           </div>
                       </li>
                   </ul>
               </div>

               {/* Algorithm Visualizer */}
               <div className="bg-black/40 p-8 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl">
                   <h3 className="text-lg font-bold text-gray-200 mb-6 text-center">Matching Weight Distribution</h3>
                   <div className="space-y-8">
                       {/* Visual */}
                       <div>
                           <div className="flex justify-between text-sm font-semibold text-cyan-400 mb-2">
                               <span>Visual Similarity (MobileNet)</span>
                               <span>50%</span>
                           </div>
                           <div className="h-3 bg-gray-700/30 rounded-full overflow-hidden">
                               <motion.div initial={{width:0}} whileInView={{width:'50%'}} transition={{duration:1, ease:"circOut"}} className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"/>
                           </div>
                       </div>
                       {/* Text */}
                       <div>
                           <div className="flex justify-between text-sm font-semibold text-purple-400 mb-2">
                               <span>Semantic Text (NLP)</span>
                               <span>30%</span>
                           </div>
                           <div className="h-3 bg-gray-700/30 rounded-full overflow-hidden">
                               <motion.div initial={{width:0}} whileInView={{width:'30%'}} transition={{duration:1, delay:0.2, ease:"circOut"}} className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]"/>
                           </div>
                       </div>
                       {/* Context */}
                       <div>
                           <div className="flex justify-between text-sm font-semibold text-pink-400 mb-2">
                               <span>Location & Date</span>
                               <span>20%</span>
                           </div>
                           <div className="h-3 bg-gray-700/30 rounded-full overflow-hidden">
                               <motion.div initial={{width:0}} whileInView={{width:'20%'}} transition={{duration:1, delay:0.4, ease:"circOut"}} className="h-full bg-gradient-to-r from-pink-600 to-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]"/>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
       </motion.div>
    </div>
  );
}
