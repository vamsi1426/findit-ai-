import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name'); // Only for signup

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        // Create user profile in Firestore
        await setDoc(doc(db, "userProfiles", res.user.uid), {
            name,
            email,
            createdAt: new Date(),
            uid: res.user.uid
        });
        toast.success("Account created!");
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.message.replace("Firebase:", "").trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
      try {
          const res = await signInWithPopup(auth, googleProvider);
           // Ensure profile exists
          await setDoc(doc(db, "userProfiles", res.user.uid), {
            name: res.user.displayName,
            email: res.user.email,
            lastLogin: new Date(),
            uid: res.user.uid
        }, { merge: true });
          
          toast.success("Signed in with Google");
          navigate('/');
      } catch (err) {
          console.error(err);
          toast.error("Google Signin Failed");
      }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium w-full max-w-md p-8 md:p-10 relative overflow-hidden"
      >
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-sm">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-center text-gray-400 mb-8 text-sm">
                {isLogin ? 'Enter your details to access your account' : 'Join us to find what you lost, or help others.'}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="input-premium-wrapper"
                    >
                        <input name="name" type="text" placeholder=" " required className="input-premium peer" />
                        <label className="label-premium">Full Name</label>
                    </motion.div>
                  )}
              </AnimatePresence>
              
              <div className="input-premium-wrapper">
                 <input name="email" type="email" placeholder=" " required className="input-premium peer" />
                 <label className="label-premium">Email Address</label>
              </div>

              <div className="relative">
                 <div className="input-premium-wrapper mb-0">
                     <input 
                        name="password" 
                        type={showPwd ? "text" : "password"} 
                        placeholder=" " 
                        required 
                        className="input-premium peer pr-12" 
                     />
                     <label className="label-premium">Password</label>
                 </div>
                 <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 bottom-4 text-gray-400 hover:text-cyan-400 transition-colors">
                    {showPwd ? <EyeOff size={20}/> : <Eye size={20}/>}
                 </button>
              </div>

              <button disabled={loading} className="btn btn-primary w-full py-3.5 text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin"/> : (isLogin ? 'Sign In' : 'Get Started')}
                {!loading && <ArrowRight size={20}/>}
              </button>
            </form>

            <div className="flex items-center my-8">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="px-4 text-xs text-gray-500 font-medium tracking-wider">OR CONTINUE WITH</span>
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button onClick={handleGoogle} className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 group">
                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.23-7.27c3.04 0 4.96 1.77 4.96 1.77l2.03-2.03C17.07 2.5 14.52 1 12.23 1c-6.07 0-11 4.93-11 11s4.93 11 11 11c6.05 0 10.6-4.38 10.6-10.56c0-.58-.06-1.1-.16-1.63z"/></svg>
                <span className="font-semibold text-gray-300 group-hover:text-white">Google</span>
            </button>

            <p className="text-center mt-8 text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"} 
              <button onClick={() => setIsLogin(!isLogin)} className="text-cyan-400 hover:text-indigo-400 font-bold ml-2 transition-colors hover:underline underline-offset-4">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
