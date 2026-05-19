import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from '../firebase/firebase';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { extractImageEmbedding, classifyImage } from '../ai/models';
import { generateSmartTags } from '../ai/groq';
import { identifyObjectWithGemini } from '../ai/gemini';
import { identifyObjectWithHuggingFace } from '../ai/huggingface'; // Keep fallback or remove if unused
import { compressImage } from '../utils/imageUtils';
import { extractFrameFromVideo } from '../utils/videoUtils';
import { detectObjects, extractDominantColor } from '../ai/vision';
import { calculateMatchScore } from '../ai/matching';
import { toast } from 'react-hot-toast';
import { Search, Upload, MapPin, Calendar, X, Loader2, AlertCircle, CheckCircle, Mail, Video, Wand2, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Lost() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); 
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [pendingData, setPendingData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refId, setRefId] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiTags, setAiTags] = useState([]);

  const [imageEmbedding, setImageEmbedding] = useState(null);
  const [dominantColor, setDominantColor] = useState(null);

  const [formData, setFormData] = useState({
      title: '',
      description: '',
      location: '',
      dateFound: new Date().toISOString().split('T')[0],
      email: '',
      phone: ''
  });

  const handleAutoTag = async (imageUrl) => {
      const toastId = toast.loading("Initializing AI Vision Engine...");
      try {
          setAnalyzing(true);
          const img = document.createElement('img');
          img.crossOrigin = "anonymous";
          img.src = imageUrl;
          await new Promise((r, reject) => {
             img.onload = r;
             img.onerror = () => reject("Image load failed");
          });

          // Artifical delay for "scanning" effect
          await new Promise(r => setTimeout(r, 1000));
          toast.loading("Scanning visual patterns...", { id: toastId });

          let detectedTags = [];

          // 1. HIGH-QUALITY CLOUD VISION (Gemini 1.5 Flash)
          let cleanLocalTags = [];
          try {
              const geminiTags = await identifyObjectWithGemini(imageUrl); 
              if (geminiTags && geminiTags.length > 0) {
                  console.log("Cloud AI Tags (Gemini):", geminiTags);
                  cleanLocalTags = geminiTags; 
              }
          } catch (cloudErr) { console.warn("Cloud AI failed, using Local...", cloudErr); }

          // 2. Fallback to LOCAL AI (If Cloud failed)
          if (cleanLocalTags.length === 0) {
              toast.loading("Analyzing object features using Gemini AI...", { id: toastId });
              
              // DETECT OBJECTS (COCO-SSD)
              const { tags: cocoTags } = await detectObjects(img, 0.45); 
              const validCoco = cocoTags?.filter(t => t !== 'person') || [];

              const predictions = await classifyImage(img);
              const rawMobileNet = predictions
                  .filter(p => p.probability > 0.15) 
                  .map(p => p.className.split(',')[0].trim().toLowerCase());
              
              // Filter Bad Tags
              const chaosTags = [
                  'stole', 'packet', 'modem', 'swab', 'lighter', 'toilet seat', 'monitor', 'screen',
                  'spotlight', 'toilet', 'loupe', 'harmonica', 'oxygen mask', 'remote',
                  'joystick', 'mouse', 'obelisk', 'tripod', 'projector', 'backpack', 'jean', 'jeans', 'plastic bag'
              ];
              cleanLocalTags = [...validCoco, ...rawMobileNet].filter(t => !chaosTags.includes(t));
          }

          // 3. SMART ENHANCE (Groq Text AI)
          let enhancedTags = [];
          if (cleanLocalTags.length > 0) {
              try {
                  await new Promise(r => setTimeout(r, 800));
                  toast.loading("Generating descriptive tags with Llama 3...", { id: toastId });
                  enhancedTags = await generateSmartTags(cleanLocalTags);
              } catch (err) { console.warn("Smart Tag Gen failed", err); }
          }
          
          detectedTags = [...new Set([...cleanLocalTags, ...enhancedTags])];

          // 3. Extract Color & Embedding
          const color = extractDominantColor(img);
          setDominantColor(color.hex);

          const vector = await extractImageEmbedding(img);
          if (vector) setImageEmbedding(vector);

          if (detectedTags.length > 0) {
              setAiTags(prev => [...new Set([...prev, ...detectedTags])]);
              toast.success(`Analysis Complete: Detected ${detectedTags.length} attributes`, { id: toastId, icon: "✨" });
          } else {
               toast.dismiss(toastId);
               toast("No specific object detected (try a closer shot)", { icon: "🤔" });
          }
          
      } catch (err) {
          console.error("AI Tagging failed", err);
          toast.error("AI Analysis failed", { id: toastId });
      } finally {
          setAnalyzing(false);
      }
  };

  const applyTags = () => {
      const newDesc = (formData.description + "\nDetected: " + aiTags.join(", ") + (dominantColor ? `\nColor: ${dominantColor}` : "")).trim();
      setFormData(prev => ({ ...prev, description: newDesc }));
      setAiTags([]); 
      toast.success("Tags added to description!");
  };

  const handleImageChange = async (e) => {
      const files = Array.from(e.target.files);
      if (images.length + files.length > 3) {
          toast.error("Max 3 images allowed.");
          return;
      }
      for (const file of files) {
          try {
             const compressed = await compressImage(file);
             setImages(prev => [...prev, compressed]);
             handleAutoTag(compressed.previewUrl);
          } catch (e) {
             toast.error("Error processing image");
          }
      }
  };

  const handleVideoChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const toastId = toast.loading("Processing Video (3 Frames)...");
      try {
          // 1. Extract Frames
          const frames = await extractFrameFromVideo(file);
          setImages(prev => [...prev, ...frames]);
          
          toast.success("3 Frames extracted!", { id: toastId });
          
          // 2. Process ALL frames (Average Embeddings + Combine Tags)
          await handleProcessVideoFrames(frames);

      } catch (err) {
          console.error(err);
          toast.error("Video processing failed", { id: toastId });
      }
  };

  const handleProcessVideoFrames = async (frames) => {
      // Theatrical Toast
      const toastId = toast.loading("Analyzing video frames using Gemini AI...");
      setAnalyzing(true);
      let allTags = new Set();
      let allEmbeddings = [];

      try {
          for (const frame of frames) {
              const img = document.createElement('img');
              img.crossOrigin = "anonymous";
              img.src = frame.previewUrl;
              await new Promise((r) => { img.onload = r; });

              // A. Classify / Detect Tags
              const { tags } = await detectObjects(img, 0.4);
              const predictions = await classifyImage(img);
              const mobileNetTags = predictions
                  .filter(p => p.probability > 0.1)
                  .map(p => p.className.split(',')[0].trim().toLowerCase());
              
              const chaosTags = [
                  'stole', 'packet', 'modem', 'swab', 'lighter', 'toilet seat', 'monitor', 'screen',
                  'spotlight', 'toilet', 'loupe', 'harmonica', 'oxygen mask', 'remote',
                  'joystick', 'mouse', 'obelisk', 'tripod', 'projector'
              ];
              const cleanTags = [...tags, ...mobileNetTags].filter(t => !chaosTags.includes(t) && t !== 'person');
              
              cleanTags.forEach(t => allTags.add(t));

              // B. Embedding
              const vector = await extractImageEmbedding(img);
              if (vector) allEmbeddings.push(vector);

              // C. Extract Color (First available frame)
              if (allEmbeddings.length === 1) {
                   const color = extractDominantColor(img);
                   setDominantColor(color.hex);
                   console.log("Video Color:", color.hex);
              }
          }

          // 2. Enhance Tags (Groq)
          const baseTags = [...allTags];
          let finalTags = baseTags;
          
          if (baseTags.length > 0) {
              const smartTags = await generateSmartTags(baseTags);
              finalTags = [...new Set([...baseTags, ...smartTags])];
          }

          // 3. Average Embeddings
          if (allEmbeddings.length > 0) {
              const dim = allEmbeddings[0].length;
              const averaged = new Float32Array(dim);
              for (let i = 0; i < dim; i++) {
                  let sum = 0;
                  for (let vec of allEmbeddings) sum += vec[i];
                  averaged[i] = sum / allEmbeddings.length;
              }
              // Store averaged embedding
              setImageEmbedding(Array.from(averaged)); 
          }

          // 4. Update UI
          console.log("Combined Video Tags:", finalTags);
          
          if (finalTags.length > 0) {
              setAiTags(prev => [...new Set([...prev, ...finalTags])]);
              toast.success(`Video Analysis Complete: ${finalTags.length} tags found`, { id: toastId });
          } else {
              toast.dismiss(toastId);
              toast("No specific object detected in video", { icon: "🤔" });
          }

      } catch (e) {
          console.error("Video Analysis Error:", e);
          toast.error("AI Analysis Failed", { id: toastId });
      } finally {
          setAnalyzing(false);
      }
  };

  const removeImage = (index) => {
      setImages(images.filter((_, i) => i !== index));
  };

  const validate = () => {
      if (!formData.title) return "Title is required";
      if (!formData.description) return "Description is required";
      if (!formData.location) return "Location is required";
      return null;
  };

  /* REMOVED: saveItemToFirestore (logic moved to Results.jsx) */

  const handleScan = async (e) => {
      e.preventDefault();
      const error = validate();
      if (error) { toast.error(error); return; }
      if (!auth.currentUser) { toast.error("Please login."); navigate('/auth'); return; }

      setLoading(true);
      const toastId = toast.loading("Searching for Found Items...");

      try {
          // 1. Process Images / Embeddings
          let finalEmbedding = imageEmbedding ? Array.from(imageEmbedding) : null;

          if (!finalEmbedding && images.length > 0) {
              toast("Analyzing images...", { icon: "🧠", id: toastId });
              try {
                  const imgEl = document.createElement('img');
                  imgEl.crossOrigin = 'anonymous';
                  imgEl.src = images[0].previewUrl; // Fallback to first image
                  await new Promise((resolve) => { imgEl.onload = resolve; });
                  finalEmbedding = await extractImageEmbedding(imgEl);
              } catch (e) { console.error("Fallback analysis failed", e); }
          }

          const imageEmbeddings = finalEmbedding ? [finalEmbedding] : [];

          toast("Scanning found items...", { icon: "🔍", id: toastId });

          // 2. Query 'Found Items' (type='found')
          const q = query(
              collection(db, 'items'), 
              where('type', '==', 'found'), 
              where('status', '==', 'open')
          );
          const snapshot = await getDocs(q);
          const foundItems = snapshot.docs.map(d => ({id: d.id, ...d.data()}));

          // 3. Match
          const currentQuery = {
              title: formData.title,
              description: formData.description,
              location: { lat:0, lng:0, address: formData.location },
              date: formData.dateFound,
              imageEmbeddings 
          };

          const matches = calculateMatchScore(currentQuery, foundItems);

          // 4. Prepare Data for Results
          const wrappedEmbeddings = imageEmbeddings.map(emb => ({ vector: emb }));
          const queryData = {
              ...formData,
              imageEmbeddings: wrappedEmbeddings,
              imageBase64: images[0]?.base64 || null,
              type: 'request', // Context: User LOST something, so this is a REQUEST
              mode: 'lost'
          };

          sessionStorage.setItem("lastMatches", JSON.stringify(matches));
          sessionStorage.setItem("lastQuery", JSON.stringify(queryData));
          
          toast.success(`Search Complete. Found ${matches.length} potential matches.`, { id: toastId });
          navigate('/results');

      } catch (err) {
          console.error(err);
          toast.error("Process failed: " + err.message, { id: toastId });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-12 relative">
      
      <AnimatePresence>
          {showSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                  <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-surface border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="text-green-500" size={32}/>
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-white">Alert Saved</h2>
                      <p className="text-gray-400 mb-6">We'll notify you if someone finds your item.</p>
                      <button onClick={() => navigate('/myreports')} className="btn btn-primary w-full">View My Reports</button>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <div className="mb-12 text-left max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)]">
                  <Search className="text-pink-400" size={24}/>
              </div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight uppercase">
                  REPORT LOST ITEM
              </h1>
          </div>
          
          <div className="glass-premium p-8 rounded-2xl border border-white/10 text-left relative overflow-hidden group hover:border-pink-500/30 transition-colors">
               <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-400 to-purple-500" />
               <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
               
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                   How AI Search Works
               </h3>
               <div className="text-gray-400 leading-relaxed text-sm space-y-4 font-medium max-w-3xl">
                   <p>
                       Upload a reference photo or describe the lost item. Our AI scans found item reports to find matches instantly.
                   </p>
                   <p>
                       If a match is found, you can verify ownership. If not, we'll save your alert and notify you when similar items are reported.
                   </p>
               </div>
          </div>
      </div>

      <div className="max-w-3xl mx-auto">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="glass-premium p-8 relative overflow-hidden">
             {/* Blob */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

              <form onSubmit={handleScan} className="space-y-8">
                  {/* Upload Section */}
                  <div>
                      <label className="block text-lg font-medium text-gray-300 mb-4 capitalize">Upload what you lost that item or video</label>
                      <div className="space-y-4">
                          {/* Image List */}
                          {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative w-full h-48 rounded-2xl overflow-hidden bg-black/10 border border-white/10 shadow-lg group backdrop-blur-sm">
                                        <img src={img.previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors"><X size={16}/></button>
                                        
                                        {/* Video Indicator */}
                                        {img.originalVideo && (
                                            <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg text-xs text-white flex items-center gap-2">
                                                <Video size={12} /> Video
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                          )}
                          
                          {/* Buttons */}
                          {images.length < 3 && (
                              <div className="grid grid-cols-2 gap-4">
                                  {/* Photo Upload */}
                                  <div onClick={() => fileInputRef.current?.click()} className="relative w-full h-48 rounded-2xl border-2 border-dashed border-pink-500/30 bg-pink-900/5 hover:border-pink-400 hover:bg-pink-900/20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden backdrop-blur-md">
                                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                      <div className="w-14 h-14 rounded-full bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.5)] transition-all border border-pink-500/20">
                                          <Upload size={28} className="text-pink-400"/>
                                      </div>
                                      <span className="text-xs font-bold text-pink-300/80 group-hover:text-pink-300 uppercase tracking-widest">Add Photo</span>
                                  </div>

                                  {/* Video Upload */}
                                  <div onClick={() => videoInputRef.current?.click()} className="relative w-full h-48 rounded-2xl border-2 border-dashed border-purple-500/30 bg-purple-900/5 hover:border-purple-400 hover:bg-purple-900/20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden backdrop-blur-md">
                                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                      <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] transition-all border border-purple-500/20">
                                          <Video size={28} className="text-purple-400"/>
                                      </div>
                                      <span className="text-xs font-bold text-purple-300/80 group-hover:text-purple-300 uppercase tracking-widest">Add Video</span>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange}/>
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange}/>
                  </div>

                  {/* AI Actions */}
                  {(aiTags.length > 0 || dominantColor) && (
                       <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mb-6 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                           <div className="flex items-center gap-2 text-sm text-secondary font-semibold mb-2">
                               <Wand2 size={16} /> AI Suggestions
                           </div>
                           <div className="flex flex-wrap gap-2 mb-3">
                               {aiTags.map(t => (
                                   <span key={t} className="px-2 py-1 rounded bg-secondary/20 text-secondary-200 text-xs border border-secondary/10">{t}</span>
                               ))}
                               {dominantColor && (
                                   <span className="px-2 py-1 rounded bg-surface border border-white/10 text-xs flex items-center gap-1">
                                       <div className="w-3 h-3 rounded-full" style={{backgroundColor: dominantColor}}/> Color
                                   </span>
                               )}
                           </div>
                           <button type="button" onClick={applyTags} className="text-xs flex items-center gap-1 text-white opacity-80 hover:opacity-100 hover:underscore">
                               <CheckCircle size={12}/> Apply to Description
                           </button>
                       </motion.div>
                   )}

                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="input-premium-wrapper">
                          <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-premium peer" placeholder=" " required/>
                          <label className="label-premium">Title (e.g. Leather Wallet)</label>
                      </div>
                      <div className="input-premium-wrapper">
                          <input type="date" value={formData.dateFound} onChange={e => setFormData({...formData, dateFound: e.target.value})} className="input-premium peer" required />
                          <label className="label-premium">Date Lost</label>
                      </div>
                  </div>

                  <div className="input-premium-wrapper">
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-premium peer min-h-[120px] resize-none" placeholder=" " required />
                      <label className="label-premium">Detailed Description...</label>
                  </div>

                  <div className="input-premium-wrapper">
                      <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input-premium peer" placeholder=" " required />
                      <label className="label-premium">Last Seen Location</label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="input-premium-wrapper">
                          <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-premium" placeholder=" " />
                          <label className="label-premium">Your Email</label>
                      </div>
                      <div className="input-premium-wrapper">
                          <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-premium" placeholder=" " />
                          <label className="label-premium">Your Phone</label>
                      </div>
                  </div>

                  <button disabled={loading} className="w-full py-4 text-lg font-bold flex items-center justify-center gap-3 mt-8 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-wide border border-white/10">
                      {loading ? <Loader2 className="animate-spin" size={24}/> : <Wand2 size={24}/>}
                      {loading ? 'Searching...' : 'Search for My Item'}
                  </button>
              </form>
          </motion.div>
      </div>
    </div>
  );
}
