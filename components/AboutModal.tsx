
import React from 'react';
import { X, Leaf, CloudRain, Zap, Globe, Heart, Sprout } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh] border border-white/20 dark:border-gray-700">
        
        {/* Dynamic Header Frame - Compact size */}
        <div className="relative h-52 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-800 text-center overflow-hidden flex flex-col items-center justify-center shrink-0">
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
             {/* Noise Texture */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
             
             {/* Moving Blobs - Adjusted for smaller area */}
             <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-tr from-yellow-300/20 via-green-400/10 to-transparent rounded-full blur-[80px] animate-spin-slow"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] animate-pulse-slow"></div>
             <div className="absolute top-[20%] right-[20%] w-16 h-16 bg-white/10 rounded-full blur-[30px] animate-float"></div>
             
             {/* Gradient Overlay for Text Visibility */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md z-30 hover:rotate-90 duration-300 shadow-sm border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Plate (Logo Container) - Centered in the frame */}
          <div className="relative z-20 mb-2 group">
             {/* Glow behind the plate */}
             <div className="absolute inset-0 bg-green-300/30 rounded-[1.5rem] blur-2xl animate-pulse"></div>
             
             {/* The "Floating Plate" / Glassmorphic Box */}
             <div className="relative inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/30 animate-float">
                <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                <Leaf className="w-8 h-8 text-white drop-shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" fill="currentColor" fillOpacity={0.2} strokeWidth={1.5} />
             </div>
          </div>

          <div className="relative z-20 space-y-1.5 px-8">
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-lg">
              Trishna
            </h2>
            <div className="h-0.5 w-8 bg-green-300/60 mx-auto rounded-full shadow-sm"></div>
            <p className="text-white font-bold text-[10px] uppercase tracking-[0.2em] drop-shadow-md opacity-90">
              Climate-Smart Kisan Companion
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 scrollbar-hide">
          <div className="p-8 space-y-8">
            
            <div className="text-center">
               <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base font-medium">
                 Empowering <span className="text-green-700 dark:text-green-400 font-bold">Farmers & Gardeners</span> with AI-driven insights to grow healthier crops, conserve water, and adapt to changing climate conditions.
               </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                      <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Weather Smart</h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">Local forecasts & alerts to plan your sowing.</p>
               </div>
               
               <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                      <Zap className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">AI Diagnosis</h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">Instant plant disease detection & remedies.</p>
               </div>

               <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-900/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                      <Sprout className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Crop Planning</h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">Personalized guidance for land size & soil.</p>
               </div>

               <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-900/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                      <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Local Language</h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">Accessible in 10+ regional Indian languages.</p>
               </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-6 text-center border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
               <div className="relative z-10">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Our Mission</h4>
                 <p className="text-sm text-gray-800 dark:text-gray-200 italic font-medium leading-relaxed">
                   "To bridge the gap between traditional farming wisdom and modern technology, ensuring sustainable abundance for every kisan."
                 </p>
               </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center justify-center pt-6 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mb-3 uppercase tracking-wider">
                  <span>Made with</span>
                  <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" />
                  <span>for the Earth</span>
               </div>
               <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">v1.0.0 • Trishna</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
