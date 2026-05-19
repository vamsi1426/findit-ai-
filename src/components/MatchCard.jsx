import React from 'react';
import { Mail, Phone, MessageSquare, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { sendNotificationEmail } from '../utils/emailService.js';
import { useState } from 'react';

export default function MatchCard({ item }) {
  const [emailSending, setEmailSending] = useState(false);

  // Dynamic Styles based on Confidence
  const confidenceColor = 
      item.confidence === 'High' ? 'text-emerald-400' : 
      item.confidence === 'Medium' ? 'text-yellow-400' : 'text-gray-400';
  
  const confidenceBadge = 
      item.confidence === 'High' ? 'bg-emerald-500/10 border-emerald-500/20' : 
      item.confidence === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-gray-500/10 border-gray-500/20';

  // Construct Contact Links
  const contactEmail = item.email || item.userEmail;
  const hasPhone = item.phone && item.phone.trim().length > 0;
  
  const subject = encodeURIComponent(`Claiming My Lost Item - Ref: ${item.id}`);
  const body = encodeURIComponent(`Hello,\n\nI think the item you found might be mine.\n\nReference: ${item.id}\nTitle: ${item.title}\n\nMy details:\nName:\nPhone:\n\nThank you.`);
  
  // Handlers
  const handleEmailClick = async (e) => {
      e.preventDefault();
      if (!contactEmail) return;

      setEmailSending(true);
      // Try Auto-Send
      const sent = await sendNotificationEmail(contactEmail, "User", item.title, window.location.href);
      
      if (sent) {
          alert(`Email sent automatically to ${contactEmail}!`);
      } else {
          // Fallback to Mailto if API keys missing or failed
          window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      }
      setEmailSending(false);
  };

  const whatsappLink = hasPhone 
    ? `https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hi, I think Match your item: " + item.title)}` 
    : "#";

  return (
    <motion.div 
        layout
        className="glass-premium p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] transition-all duration-500"
    >
      {/* Selection/Hover Indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>

      {/* Image Section */}
      <div className="w-full md:w-56 h-56 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-gray-500 flex-shrink-0 overflow-hidden border border-white/10 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"/>
          {item.imageBase64 && item.imageBase64.length > 100 ? (
              <img src={item.imageBase64} alt="Found Item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={40} className="opacity-30"/>
                <span className="text-[10px] uppercase tracking-widest opacity-30">No Photo</span>
              </div>
          )}
          {/* Badge over Image */}
          <div className={`absolute top-3 right-3 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${confidenceBadge} ${confidenceColor} shadow-lg`}>
              {item.confidence} Match
          </div>
      </div>

      <div className="flex-grow flex flex-col justify-between">
          <div>
              <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white max-w-[70%] leading-tight group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                  <div className="text-right">
                      <div className={`text-3xl font-black ${confidenceColor} drop-shadow-sm`}>{item.score}%</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">Similarity</div>
                  </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                    <MapPin size={14} className="text-cyan-400"/> 
                    {typeof item.location === 'object' ? item.location?.address : item.location || "Unknown Location"}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                    <Calendar size={14} className="text-purple-400"/> 
                    {item.date ? new Date(item.date).toLocaleDateString() : "Unknown Date"}
                  </div>
              </div>

              <p className="text-slate-300 text-sm mb-6 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                  {item.description}
              </p>
              
              {/* Match Breakdown - Sleek Version */}
              <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                      <span>Match Analysis</span>
                      <span>Verified</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div style={{width: `${item.breakdown?.imageScore || 0}%`}} className="bg-gradient-to-r from-purple-600 to-purple-400 h-full"/>
                      <div style={{width: `${item.breakdown?.textScore || 0}%`}} className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full"/>
                      <div style={{width: `${item.breakdown?.locationScore || 0}%`}} className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full"/>
                  </div>
                   <div className="flex gap-4 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"/> Visual</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"/> Text</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Location</span>
                   </div>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
              {contactEmail ? (
                  <button onClick={handleEmailClick} disabled={emailSending} className="btn bg-gradient-to-r from-indigo-600 to-indigo-500 border border-indigo-400/20 text-white text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
                      <Mail size={16} className="text-indigo-200"/> {emailSending ? 'Sending...' : 'Send Email'}
                  </button>
              ) : (
                  <button disabled className="btn bg-slate-800/50 text-slate-600 border border-slate-700/50 text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                       <Mail size={16}/> No Email
                  </button>
              )}

              {hasPhone ? (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn bg-gradient-to-r from-emerald-600 to-teal-500 border border-emerald-400/20 text-white text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
                      <MessageSquare size={16} className="text-emerald-100"/> WhatsApp
                  </a>
              ) : (
                  <button disabled className="btn bg-slate-800/50 text-slate-600 border border-slate-700/50 text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                       <MessageSquare size={16}/> No WhatsApp
                  </button>
              )}
          </div>
      </div>
    </motion.div>
  );
}
