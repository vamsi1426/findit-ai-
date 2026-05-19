import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Found from './pages/Found';
import Lost from './pages/Lost';
import Results from './pages/Results';
import About from './pages/About';
import MyReports from './pages/MyReports';
import AIChatAssistant from './components/AIChatAssistant';

import { GeometricBackground } from './components/GeometricBackground';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-100 selection:bg-indigo-500/30 relative">
        {/* Background Component */}
        <GeometricBackground 
            color="rgba(99, 102, 241, 0.3)" 
            accentColor="rgba(20, 184, 166, 0.4)"
        />

        <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/found" element={<Found />} />
                    <Route path="/lost" element={<Lost />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/my-reports" element={<MyReports />} />
                </Routes>
            </main>
            
            <AIChatAssistant />

            <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5 mt-10">
                <p>© {new Date().getFullYear()} FindIt AI. Built with React & TensorFlow.js</p>
            </footer>
        </div>
    </div>
  )
}

export default App;
