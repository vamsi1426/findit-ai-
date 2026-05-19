import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, PlusCircle, LogOut, User, Snowflake, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [snowMode, setSnowMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
     // Sync with local storage
     const saved = localStorage.getItem('snowMode') === 'true';
     setSnowMode(saved);
  }, []);

  const toggleSnow = () => {
      const newState = !snowMode;
      setSnowMode(newState);
      localStorage.setItem('snowMode', newState);
      // Dispatch global event for background
      window.dispatchEvent(new CustomEvent('toggle-snow', { detail: newState }));
  };

  useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
         setUser(currentUser);
     });
     return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate('/');
  };

  // Click Outside Handler
  const menuRef = React.useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const navLinks = [
    { name: 'I Found Item', path: '/found', icon: <PlusCircle size={18} /> },
    { name: 'I Lost Item', path: '/lost', icon: <Search size={18} /> }, 
  ];

  if (user) navLinks.push({ name: 'My Reports', path: '/my-reports', icon: <PlusCircle size={18} /> });
  navLinks.push({ name: 'About', path: '/about', icon: null });

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-dark/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-primary/50 transition-all">F</div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">FindIt AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {user ? (
                <div className="relative pl-4 border-l border-white/10" ref={menuRef}>
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-white/5 transition-all"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                           {user.photoURL ? <img src={user.photoURL} className="w-full h-full rounded-full object-cover"/> : <User size={18}/>}
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}/>
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div 
                                initial={{opacity:0, y:10, scale:0.95}}
                                animate={{opacity:1, y:0, scale:1}}
                                exit={{opacity:0, y:10, scale:0.95}}
                                className="absolute right-0 top-14 w-72 glass-premium rounded-2xl p-4 shadow-2xl border border-white/10 overflow-hidden origin-top-right backdrop-blur-xl bg-slate-900/90 z-50"
                            >
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-xl">
                                         {user.photoURL ? <img src={user.photoURL} className="w-full h-full rounded-full"/> : '👤'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-white truncate">{user.displayName || 'User'}</h4>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        <p className="text-xs text-indigo-400">{user.phoneNumber || 'No phone linked'}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <button 
                                        onClick={toggleSnow}
                                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Snowflake size={16} className={snowMode ? "text-cyan-400" : "text-gray-500"}/>
                                            <span>Snow Mode</span>
                                        </div>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${snowMode ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${snowMode ? 'left-4.5' : 'left-0.5'}`} style={{left: snowMode ? '1.1rem' : '0.15rem'}}/>
                                        </div>
                                    </button>

                                    {/* Settings Link Removed */}

                                    <Link to="/results" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors">
                                        <Search size={16} className="text-gray-500"/> Results
                                    </Link>

                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-colors mt-2">
                                        <LogOut size={16}/> Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <Link to="/auth" className="btn btn-primary text-sm px-6">Login</Link>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link 
                    key={link.path} 
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white"
                >
                    {link.icon}
                    {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2"></div>
              {user ? (
                       <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-red-400 hover:text-red-300">
                           <LogOut size={18}/> Logout
                       </button>
              ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="block text-center btn btn-primary w-full">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
