import React, { useState, useEffect, useRef } from 'react';
import { Leaf, Droplets, Sun, Sprout, ArrowRight, Sparkle, Wind, Globe, ShieldCheck, CheckCircle2, Flower, CloudRain, Smartphone, ScanLine } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1) for parallax
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      title: "AI Plant Doctor",
      desc: "Snap a photo of your sick plant. Our AI diagnoses diseases and pests instantly, recommending organic and chemical remedies.",
      icon: ScanLine,
      color: "text-rose-600",
      bg: "bg-rose-50"
    },
    {
      title: "Smart Weather Alerts",
      desc: "Get hyper-local weather forecasts and timely alerts for rain, storms, or frost to protect your crops before it's too late.",
      icon: CloudRain,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Crop Planning",
      desc: "Personalized sowing calendars and crop recommendations based on your specific soil type, land size, and season.",
      icon: Sprout,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Local Languages",
      desc: "Trishna speaks your language. Accessible in 10+ Indian languages including Hindi, Marathi, Tamil, and more.",
      icon: Globe,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      title: "Learning Library",
      desc: "Watch curated video tutorials and guides on modern farming techniques, organic fertilizers, and home gardening hacks.",
      icon: Smartphone,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Expert Care",
      desc: "Whether you have 2 acres or 2 pots, get expert-level advice tailored to your scale of cultivation.",
      icon: ShieldCheck,
      color: "text-teal-600",
      bg: "bg-teal-50"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-gray-900 font-sans relative overflow-hidden selection:bg-green-200">
      
      {/* Background Decor - Parallax Enabled */}
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out will-change-transform"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      >
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-green-200/40 to-emerald-100/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-100/40 to-green-100/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>
      
      {/* Moving Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none animate-pan-grid"></div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center text-white ring-2 ring-white shadow-lg transform group-hover:scale-105 transition-all duration-300">
              <Leaf className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900 font-display">Trishna</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={onSignIn}
            className="hidden md:block text-sm font-semibold text-gray-600 hover:text-green-700 transition-colors px-4 py-2 rounded-lg hover:bg-green-50/50"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30 hover:-translate-y-0.5 flex items-center gap-2 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-sheen skew-x-12" />
          </button>
        </div>
      </nav>

      {/* Main Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 md:pt-16 pb-24 flex flex-col lg:flex-row items-center min-h-[85vh]">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 space-y-8 z-20 relative">
          
          {/* Glowing Badge with Green Grow and Spin Animation */}
          <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50/80 backdrop-blur-md border border-green-200 shadow-sm animate-fade-in-up overflow-hidden cursor-default group hover:border-green-300 transition-colors duration-300">
            {/* Growing Green Background */}
            <div className="absolute inset-0 bg-green-200/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out" />
            
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none" />
            
            <Sparkle className="w-4 h-4 text-green-600 fill-current relative z-10 group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out" />
            <span className="text-xs font-bold text-green-800 tracking-wide uppercase relative z-10">AI for Farms & Home Gardens</span>
          </div>

          <div 
            className="space-y-6"
            onMouseEnter={() => setIsHoveringHero(true)}
            onMouseLeave={() => setIsHoveringHero(false)}
          >
            <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up delay-100 font-display">
              Grow with <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-[length:200%_auto] animate-gradient-x">
                  Confidence
                </span>
                {/* Animated underline */}
                <svg className="absolute -bottom-2 left-0 w-full h-4 -z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="#bbf7d0" strokeWidth="8" fill="none" className="animate-draw-line origin-left" />
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed animate-fade-in-up delay-200 font-medium transform transition-transform duration-500" style={{ transform: isHoveringHero ? 'translateX(5px)' : 'translateX(0)' }}>
              Your intelligent companion for every harvest. From vast acres to balcony pots, get weather alerts, disease diagnosis, and expert care in your local language.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300 pt-4">
            <button 
              onClick={onGetStarted}
              className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-green-600/30 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Growing Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Button sheen effect */}
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-sheen skew-x-12" />
            </button>
            <button 
              onClick={scrollToFeatures}
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl text-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 hover:-translate-y-1 hover:text-green-700"
            >
              Explore Features
            </button>
          </div>

          {/* Stats/Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 animate-fade-in-up delay-400">
            {[
              { label: "Indian Languages", value: "10+", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Diagnosis Accuracy", value: "98%", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Community", value: "Free", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 border border-white/60 hover:bg-white hover:shadow-lg hover:shadow-green-900/5 transition-all cursor-default group hover:-translate-y-1 duration-300 backdrop-blur-sm"
                style={{ animationDelay: `${500 + (idx * 100)}ms` }}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <div className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center ${stat.color} group-hover:rotate-6 transition-transform`}>
                     <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide group-hover:text-green-700 transition-colors">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content / Floating Elements with Parallax */}
        <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[700px] mt-16 lg:mt-0 perspective-1000">
          
          {/* Main Organic Shape Blob behind - Parallax Layer 1 */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] transition-transform duration-1000 ease-out"
            style={{ transform: `translate(-50%, -50%) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
          >
             <div className="w-full h-full bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 rounded-full blur-[60px] opacity-60 animate-pulse-slow" />
          </div>

          {/* Floating Icons mimicking the image with Enhanced Glassmorphism */}
          
          {/* Water Drop (Right Top) - Parallax Layer 2 */}
          <div 
            className="absolute top-[10%] right-[5%] lg:right-[15%] z-30 transition-transform duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }}
          >
            <div className="animate-float-slow w-24 h-24 lg:w-28 lg:h-28 bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] border border-white/50 flex flex-col items-center justify-center transform hover:rotate-0 transition-all duration-500 group cursor-pointer hover:bg-white/60 hover:shadow-xl">
              <div className="bg-blue-100/50 p-3 rounded-2xl mb-2 group-hover:scale-110 transition-transform duration-500">
                <Droplets className="w-8 h-8 text-blue-500" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80">Care</span>
            </div>
          </div>

          {/* Garden/Flower (Center Left/Top) - Parallax Layer 3 */}
          <div 
             className="absolute top-[20%] left-[5%] lg:left-[10%] z-20 transition-transform duration-300 ease-out"
             style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -10}px)` }}
          >
            <div className="animate-float-medium w-20 h-20 lg:w-24 lg:h-24 bg-white/40 backdrop-blur-xl rounded-[1.8rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] border border-white/50 flex flex-col items-center justify-center transform hover:rotate-0 transition-all duration-500 group cursor-pointer hover:bg-white/60 hover:shadow-xl">
              <div className="bg-pink-100/50 p-2.5 rounded-2xl mb-1 group-hover:scale-110 transition-transform duration-500">
                <Flower className="w-7 h-7 text-pink-500" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600/80">Garden</span>
            </div>
          </div>

          {/* Weather/Sun (Bottom Left) - Parallax Layer 4 */}
          <div 
            className="absolute bottom-[15%] left-[10%] z-20 transition-transform duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -30}px)` }}
          >
             <div className="animate-float-slow w-28 h-28 lg:w-32 lg:h-32 bg-white/40 backdrop-blur-xl rounded-[2.2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] border border-white/50 flex flex-col items-center justify-center transform hover:rotate-0 transition-all duration-500 group cursor-pointer hover:bg-white/60 hover:shadow-xl" style={{ animationDelay: '1s' }}>
              <div className="bg-amber-100/50 p-3.5 rounded-2xl mb-2 group-hover:rotate-180 transition-transform duration-1000">
                <Sun className="w-10 h-10 text-amber-500" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/80">Weather</span>
            </div>
          </div>

          {/* Crops/Leaf (Bottom Right) - Parallax Layer 5 */}
          <div 
            className="absolute bottom-[20%] right-[10%] z-30 transition-transform duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
          >
            <div className="animate-float-medium w-24 h-24 bg-white/40 backdrop-blur-xl rounded-[1.8rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] border border-white/50 flex flex-col items-center justify-center transform hover:rotate-0 transition-all duration-500 group cursor-pointer hover:bg-white/60 hover:shadow-xl" style={{ animationDelay: '1.5s' }}>
              <div className="bg-emerald-100/50 p-2.5 rounded-2xl mb-1 group-hover:scale-110 transition-transform duration-500">
                <Sprout className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
              </div>
               <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80">Crops</span>
            </div>
          </div>

           {/* Wind/Air (Middle Background) - Parallax Layer 6 */}
           <div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out pointer-events-none"
             style={{ transform: `translate(-50%, -50%) translate(${mousePos.x * 40}px, ${mousePos.y * 10}px)` }}
           >
              <div className="animate-float-fast opacity-20 mix-blend-overlay">
                 <Wind className="w-48 h-48 text-teal-300" />
              </div>
           </div>

        </div>
      </main>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100/50 text-green-800 text-xs font-bold uppercase tracking-wider mb-4 border border-green-200/50">
            <Sparkle className="w-3 h-3" /> Powerful Tools
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">thrive</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Combining ancient wisdom with modern AI to provide the most accurate farming and gardening assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-lg rounded-[2rem] p-8 border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-300 group hover:-translate-y-2">
              <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-20px) rotate(4deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50% { transform: translateY(-15px) rotate(-4deg); }
        }
        @keyframes float-fast {
           0%, 100% { transform: translateY(0px); }
           50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes draw-line {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes sheen {
          0% { left: -100%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes pan-grid {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 5s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2.5s infinite linear; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-draw-line { animation: draw-line 1s ease-out forwards; animation-delay: 0.5s; }
        .animate-sheen { animation: sheen 0.7s ease-in-out; }
        .animate-pan-grid { animation: pan-grid 60s linear infinite; }
        
        .perspective-1000 { perspective: 1000px; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        
        .will-change-transform { will-change: transform; }
      `}</style>
    </div>
  );
};

export default LandingPage;