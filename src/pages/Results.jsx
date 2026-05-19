import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import MatchCard from '../components/MatchCard';
import { AlertCircle, ArrowLeft, Bell, Loader2, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Results() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [query, setQuery] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
     try {
         const storedMatches = sessionStorage.getItem("lastMatches");
         const storedQuery = sessionStorage.getItem("lastQuery");
         
         if (storedMatches) setMatches(JSON.parse(storedMatches));
         if (storedQuery) setQuery(JSON.parse(storedQuery));
         
     } catch (err) {
         console.error("Failed to load results", err);
     }
  }, []);

  /* REMOVED: saveItemToFirestore (logic is now integrated) */

  const handleSaveAlert = async () => {
      if (!query) return;
      if (!auth.currentUser) {
          toast.error("Please login to save.");
          navigate('/auth');
          return;
      }
      setSaving(true);
      const isFoundItem = query.mode === 'found';
      const toastData = isFoundItem 
        ? { loading: "Listing your found item...", success: "Item Listed! Thank you." }
        : { loading: "Saving your lost item alert...", success: "Alert Saved! We will notify you." };

      const toastId = toast.loading(toastData.loading);
      
      try {
          // 1. Handle Embeddings (Avoid double-wrapping)
          // query.imageEmbeddings comes from Found/Lost as [{vector: [...]}, ...]
          let dbEmbeddings = [];
          if (query.imageEmbeddings?.length) {
              const first = query.imageEmbeddings[0];
              // Check if already wrapped (has 'vector' key)
              if (first.vector) {
                  dbEmbeddings = query.imageEmbeddings;
              } else {
                  // Raw arrays, wrap them
                  dbEmbeddings = query.imageEmbeddings.map(emb => ({ vector: emb }));
              }
          }

          // 2. Handle Location (Ensure it's an object)
          const locationData = typeof query.location === 'string' 
            ? { address: query.location, lat: 0, lng: 0 } 
            : query.location;

          await addDoc(collection(db, 'items'), {
              type: query.type || 'request',
              title: query.title,
              description: query.description,
              location: locationData, 
              date: query.dateFound || query.date || new Date().toISOString(),
              imageEmbeddings: dbEmbeddings,
              imageBase64: query.imageBase64 || null, 
              userId: auth.currentUser.uid,
              userEmail: auth.currentUser.email,
              email: query.email || auth.currentUser.email,
              phone: query.phone || '',
              createdAt: serverTimestamp(),
              status: 'open'
          });

          toast.success(toastData.success, { id: toastId });
          // Navigate to Home
          navigate('/'); 
      } catch (err) {
          console.error(err);
          toast.error("Failed to save: " + err.message, { id: toastId });
      } finally {
          setSaving(false);
      }
  };

  const isFoundMode = query?.mode === 'found';
  const saveButtonText = isFoundMode ? "List Found Item" : "Save Search Alert";
  const emptyStateText = isFoundMode 
    ? "No one has reported losing this item yet. List it so the owner can find it!"
    : "Our AI didn't find any items that strongly match your description right now.";

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-8">
      <div className="mb-10">
          <button onClick={() => navigate(isFoundMode ? '/found' : '/lost')} className="text-gray-400 hover:text-cyan-400 flex items-center gap-2 mb-6 text-sm transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Search
          </button>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
             <div>
                <motion.h1 
                    initial={{opacity:0, y:-10}}
                    animate={{opacity:1, y:0}}
                    className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 drop-shadow-sm"
                >
                    AI Match Results
                </motion.h1>
                {query && (
                    <p className="text-lg text-slate-400">
                        Showing matches for "<span className="text-white font-semibold">{query.title}</span>" near {typeof query.location === 'string' ? query.location : 'Target Location'}
                    </p>
                )}
             </div>
          </div>
      </div>

      {matches.length === 0 ? (
          <motion.div 
             initial={{opacity:0, y:20}} 
             animate={{opacity:1, y:0}} 
             className="glass-premium p-12 md:p-16 text-center relative overflow-hidden"
          >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
              
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
                  <SearchX size={40} className="text-gray-400"/>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">No High-Confidence Matches</h3>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">{emptyStateText}</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to={isFoundMode ? "/found" : "/lost"} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                      Modify Search
                  </Link>
                  <button onClick={handleSaveAlert} disabled={saving} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all">
                      {saving ? "Processing..." : saveButtonText}
                  </button>
              </div>
          </motion.div>
      ) : (
          <div className="space-y-6">
              {matches.map((item, idx) => (
                  <motion.div 
                      key={item.id}
                      initial={{opacity:0, y:20}}
                      animate={{opacity:1, y:0}}
                      transition={{delay: idx * 0.1}}
                  >
                      <MatchCard item={item} />
                  </motion.div>
              ))}
          </div>
      )}
      
      {matches.length > 0 && (
          <div className="mt-16 text-center pt-8 border-t border-white/5">
              <p className="text-slate-400 mb-6 text-lg">
                  {isFoundMode ? "None of these match the item you found?" : "Not seeing your item?"}
              </p>
              <div className="flex justify-center gap-6">
                   <Link to={isFoundMode ? "/found" : "/lost"} className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                       Search Again
                   </Link>
                   <button onClick={handleSaveAlert} disabled={saving} className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center gap-2">
                       <Bell size={18}/> {saveButtonText}
                   </button>
              </div>
          </div>
      )}
    </div>
  );
}
