import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Trash2, MapPin, Calendar, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyReports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
        if (!auth.currentUser) return;
        
        try {
            // Fetch ALL items created by this user
            const q = query(
                collection(db, 'items'), 
                where('userId', '==', auth.currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const now = new Date();
            const validItems = [];
            const expiredIds = [];

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0);
                
                // Calculate age in days
                const diffTime = Math.abs(now - createdAt);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 30) {
                    expiredIds.push(docSnap.id);
                } else {
                    validItems.push({ id: docSnap.id, ...data, createdAt });
                }
            }

            // Client-side sort
            validItems.sort((a,b) => b.createdAt - a.createdAt);
            setItems(validItems);

            // Background Delete Expired
            if (expiredIds.length > 0) {
                console.log(`Auto-deleting ${expiredIds.length} expired items.`);
                Promise.all(expiredIds.map(id => deleteDoc(doc(db, 'items', id))))
                    .then(() => toast.success(`Cleaned up ${expiredIds.length} expired reports.`))
                    .catch(e => console.error("Auto-delete failed", e));
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load your reports");
        } finally {
            setLoading(false);
        }
    };

    setTimeout(() => {
        if(auth.currentUser) fetchItems();
        else setLoading(false); 
    }, 500);
  }, []);

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this report?")) return;
      try {
          await deleteDoc(doc(db, 'items', id));
          setItems(items.filter(i => i.id !== id));
          toast.success("Report deleted");
      } catch (err) {
          toast.error("Delete failed");
      }
  };

  if(loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-cyan-400" size={48}/></div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <h1 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 drop-shadow-sm">
            My Reported Items
        </h1>
        
        {items.length === 0 ? (
            <motion.div 
               initial={{opacity:0, y:20}} 
               animate={{opacity:1, y:0}}
               className="glass-premium p-16 text-center max-w-2xl mx-auto relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full scale-150 pointer-events-none"/>
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
                    <AlertCircle className="text-gray-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Reports Yet</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">You haven't posted any found items or lost item alerts yet.</p>
            </motion.div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                {items.map((item, idx) => {
                    // Logic to determine type label
                    const isFound = item.type === 'found';
                    const label = isFound ? 'FOUND ITEM' : 'LOST ALERT';
                    const colorClass = isFound ? 'bg-emerald-500' : 'bg-amber-500';
                    const gradientClass = isFound ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500';

                    const now = new Date();
                    const age = Math.ceil(Math.abs(now - item.createdAt) / (1000 * 60 * 60 * 24));
                    const daysLeft = 30 - age;

                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id} 
                            layout
                            className="glass-premium overflow-hidden group hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)] transition-all duration-500 flex flex-col h-full"
                        >
                           {/* Header Colored by Status */}
                           <div className={`h-1.5 w-full bg-gradient-to-r ${gradientClass}`}/>
                           
                           {/* Image Display */}
                           {item.imageBase64 ? (
                               <div className="w-full h-48 bg-black/20 overflow-hidden relative">
                                   <img src={item.imageBase64} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60"/>
                               </div>
                           ) : (
                               <div className="w-full h-32 bg-white/5 flex items-center justify-center text-white/20">
                                   <Tag size={32}/>
                               </div>
                           )}

                           <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-white truncate max-w-[65%] group-hover:text-cyan-300 transition-colors" title={item.title}>
                                        {item.title}
                                    </h3>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-white/10 ${isFound ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {label}
                                    </span>
                                </div>
                                
                                <div className="text-sm text-slate-300 mb-6 line-clamp-2 min-h-[40px] leading-relaxed">
                                    {item.description}
                                </div>

                                <div className="space-y-3 text-xs text-gray-400 mb-6 bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2 truncate">
                                        <MapPin size={14} className="text-indigo-400 flex-shrink-0"/> 
                                        {item.location?.address || item.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-purple-400 flex-shrink-0"/> 
                                        {new Date(item.date).toLocaleDateString()}
                                    </div>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${daysLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}/>
                                        <span className={`text-[10px] uppercase tracking-wider font-medium ${daysLeft <= 5 ? 'text-red-400' : 'text-gray-500'}`}>
                                            {daysLeft > 0 ? `${daysLeft} Days Left` : 'Expiring'}
                                        </span>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all group/delete"
                                        title="Delete Report"
                                    >
                                        <Trash2 size={16} className="group-hover/delete:scale-110 transition-transform"/>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
            </div>
        )}
    </div>
  );
}
