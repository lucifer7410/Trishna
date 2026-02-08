import React, { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Start exit animation
    const timer = setTimeout(() => {
      setExiting(true);
    }, 2800);

    // Unmount
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-emerald-950 transition-all duration-700 ease-in-out ${
        exiting ? 'opacity-0 translate-y-[-20px] pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
        
        {/* Main Logo Circle */}
        <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-3xl shadow-2xl flex items-center justify-center transform animate-logo-enter">
           <Leaf className="w-12 h-12 text-white drop-shadow-md" strokeWidth={2.5} />
        </div>

        {/* Orbiting particles */}
        <div className="absolute w-40 h-40 border border-white/10 rounded-full animate-spin-slow">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
        </div>
      </div>
      
      <div className="mt-8 text-center overflow-hidden">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200 tracking-tight animate-text-reveal">
          Trishna
        </h1>
        <div className="mt-3 flex items-center justify-center gap-2 animate-subtext-reveal opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="h-px w-8 bg-green-500/50"></div>
          <p className="text-green-100/80 text-sm font-medium tracking-wide">
            Cultivating Abundance
          </p>
          <div className="h-px w-8 bg-green-500/50"></div>
        </div>
      </div>

      <style>{`
        @keyframes logo-enter {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes text-reveal {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes subtext-reveal {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
        
        .animate-logo-enter {
          animation: logo-enter 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-text-reveal {
          animation: text-reveal 0.8s ease-out 0.6s backwards;
        }
        .animate-subtext-reveal {
          animation: subtext-reveal 0.8s ease-out 1s forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;