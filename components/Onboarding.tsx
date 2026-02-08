import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole, SUPPORTED_LANGUAGES } from '../types';
import { ArrowRight, Leaf, MapPin, User, Loader2, Tractor, Flower, Camera, Locate, Ruler, Mountain, Droplets, Check, Sparkles, Plus } from 'lucide-react';

interface OnboardingProps {
  initialName?: string;
  onComplete: (profile: UserProfile, language: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ initialName, onComplete }) => {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('English');
  const [formData, setFormData] = useState<UserProfile>({
    name: initialName || '',
    role: 'Farmer',
    location: '',
    landSize: '',
    soilType: 'Loamy',
    waterSource: 'Rainfed',
    profileImage: '',
    crops: []
  });

  // Location Search
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 3;

  const toSafeString = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') {
        if (val.includes('[object Object]')) return '';
        return val.trim();
    }
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
        return val.display_name && typeof val.display_name === 'string' ? val.display_name : '';
    }
    return '';
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: toSafeString(value) }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete(formData, language);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleRoleSelect = (role: UserRole) => {
    const isSwitchingToFarmer = role === 'Farmer';
    setFormData(prev => ({
      ...prev,
      role,
      landSize: isSwitchingToFarmer ? '1 Acre' : 'Balcony',
      soilType: isSwitchingToFarmer ? 'Loamy' : 'Potting Mix',
      waterSource: isSwitchingToFarmer ? 'Rainfed' : 'Tap Water'
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
           const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
           const data = await res.json();
           
           if (data && data.address) {
             const city = toSafeString(data.address.city || data.address.town || data.address.village || data.address.county || data.address.municipality);
             const state = toSafeString(data.address.state);
             const country = toSafeString(data.address.country);
             
             const parts = [city, state, country].filter(p => p.length > 0);
             const formatted = parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
             handleChange('location', formatted);
           } else {
             handleChange('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
           }
        } catch (e) {
           console.error("Geocoding error", e);
           handleChange('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
           setIsLocating(false);
        }
      },
      (error) => {
          console.error("Geolocation error", error);
          setIsLocating(false);
          alert("Unable to retrieve your location.");
      }
    );
  };

  // Autocomplete
  useEffect(() => {
      const controller = new AbortController();
      const signal = controller.signal;

      const timer = setTimeout(async () => {
        if (formData.location.length > 2 && showSuggestions && !isLocating) {
          setIsSearching(true);
          try {
             const res = await fetch(
               `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&addressdetails=1&limit=5&countrycodes=in`, 
               { signal }
             );
             const data = await res.json();
             setSuggestions(Array.isArray(data) ? data : []);
          } catch (e: any) {
             if (e.name !== 'AbortError') setSuggestions([]);
          } finally {
             if (!signal.aborted) setIsSearching(false);
          }
        } else {
          setSuggestions([]);
          setIsSearching(false);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }, [formData.location, showSuggestions, isLocating]);
  
  const handleSelectLocation = (place: any) => {
      const address = place.address || {};
      const city = toSafeString(address.city || address.town || address.village || address.county || address.municipality);
      const state = toSafeString(address.state);
      const displayStr = toSafeString(place.display_name);
      
      const formatted = city && state ? `${city}, ${state}` : displayStr;
      
      handleChange('location', formatted);
      setShowSuggestions(false);
      setSuggestions([]);
  };

  // Click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderStep1 = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-8">
           <div className="inline-block p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 animate-bounce">
              <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Let's get to know you</h2>
           <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">To provide better recommendations</p>
        </div>

        <div className="space-y-4">
           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">I identify as a</label>
           <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleSelect('Farmer')}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
                    formData.role === 'Farmer' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 ring-2 ring-green-500/20 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                  <div className={`p-3 rounded-full transition-colors ${formData.role === 'Farmer' ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/50'}`}>
                    <Tractor className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-lg">Farmer</span>
                  {formData.role === 'Farmer' && <div className="absolute top-2 right-2 text-green-500"><Check className="w-5 h-5" /></div>}
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('Gardener')}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
                    formData.role === 'Gardener' 
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                  <div className={`p-3 rounded-full transition-colors ${formData.role === 'Gardener' ? 'bg-rose-200 dark:bg-rose-800' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50'}`}>
                    <Flower className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-lg">Gardener</span>
                  {formData.role === 'Gardener' && <div className="absolute top-2 right-2 text-rose-500"><Check className="w-5 h-5" /></div>}
              </button>
           </div>
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">My Name</label>
            <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors w-5 h-5" />
                <input 
                   type="text" 
                   value={formData.name}
                   onChange={e => handleChange('name', e.target.value)}
                   className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 font-semibold"
                   placeholder="Enter your full name"
                />
            </div>
        </div>
     </div>
  );

  const renderStep2 = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
             <div className="inline-block p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4 animate-bounce">
                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Where are you located?</h2>
             <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">For local weather and crop updates</p>
          </div>

          <div className="space-y-2" ref={dropdownRef}>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Location</label>
              <div className="flex gap-2">
                 <div className="relative flex-1 group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 w-5 h-5 transition-colors" />
                    <input 
                       type="text" 
                       value={formData.location}
                       onChange={(e) => { handleChange('location', e.target.value); setShowSuggestions(true); }}
                       className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 font-semibold hover:border-green-200 dark:hover:border-green-800"
                       placeholder="Search city or village"
                    />
                    {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin w-5 h-5 text-green-500" />}
                    
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                           {suggestions.map((place, idx) => (
                               <button
                                  key={idx}
                                  onClick={() => handleSelectLocation(place)}
                                  className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 text-sm truncate text-gray-800 dark:text-gray-200 font-medium"
                               >
                                  {toSafeString(place.display_name)}
                               </button>
                           ))}
                        </div>
                    )}
                 </div>
                 <button 
                    onClick={handleAutoLocation}
                    disabled={isLocating}
                    className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all border-2 border-green-100 dark:border-green-800 flex-shrink-0 hover:scale-105 active:scale-95 shadow-sm hover:shadow-green-100 dark:hover:shadow-none"
                    title="Use Current Location"
                 >
                    {isLocating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Locate className="w-6 h-6" />}
                 </button>
              </div>
          </div>

          <div className="space-y-2">
             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Preferred Language</label>
             <div className="relative group">
                 <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full pl-4 pr-10 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-gray-900 dark:text-white font-semibold appearance-none cursor-pointer hover:border-green-200 dark:hover:border-green-800 transition-colors"
                 >
                    {SUPPORTED_LANGUAGES.map(l => (
                        <option key={l.code} value={l.name}>{l.native} ({l.name})</option>
                    ))}
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-green-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </div>
             </div>
          </div>
      </div>
  );

  const renderStep3 = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-6">
             <div className="inline-block p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Almost there!</h2>
             <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">A few details about your {formData.role === 'Farmer' ? 'farm' : 'garden'}</p>
          </div>

          <div className="flex justify-center mb-6">
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-green-500 transition-colors shadow-inner">
                    {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 group-hover:text-green-500">
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-bold uppercase">Upload</span>
                        </div>
                    )}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                    <Plus className="w-4 h-4" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div>
          </div>

          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {formData.role === 'Farmer' ? 'Land Size' : 'Garden Type'}
                  </label>
                  <div className="relative group">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 w-5 h-5" />
                      {formData.role === 'Farmer' ? (
                          <input 
                             type="text" 
                             value={formData.landSize}
                             onChange={(e) => handleChange('landSize', e.target.value)}
                             className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-semibold transition-all"
                             placeholder="e.g. 2 Acres"
                          />
                      ) : (
                          <select 
                             value={formData.landSize}
                             onChange={(e) => handleChange('landSize', e.target.value)}
                             className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-gray-900 dark:text-white font-semibold appearance-none cursor-pointer"
                          >
                             <option value="" disabled>Select Type</option>
                             <option>Balcony</option>
                             <option>Terrace</option>
                             <option>Backyard</option>
                             <option>Indoor Pots</option>
                             <option>Window Sill</option>
                          </select>
                      )}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Soil</label>
                      <div className="relative group">
                          <Mountain className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 w-4 h-4" />
                          <select 
                             value={formData.soilType}
                             onChange={(e) => handleChange('soilType', e.target.value)}
                             className="w-full pl-9 pr-2 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-sm text-gray-900 dark:text-white font-semibold appearance-none cursor-pointer"
                          >
                             {formData.role === 'Farmer' ? (
                                <>
                                    <option>Loamy</option>
                                    <option>Clay</option>
                                    <option>Sandy</option>
                                    <option>Black Soil</option>
                                    <option>Red Soil</option>
                                </>
                             ) : (
                                <>
                                    <option>Potting Mix</option>
                                    <option>Garden Soil</option>
                                    <option>Cocopeat Mix</option>
                                    <option>Red Soil</option>
                                </>
                             )}
                          </select>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Water</label>
                      <div className="relative group">
                          <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 w-4 h-4" />
                          <select 
                             value={formData.waterSource}
                             onChange={(e) => handleChange('waterSource', e.target.value)}
                             className="w-full pl-9 pr-2 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-sm text-gray-900 dark:text-white font-semibold appearance-none cursor-pointer"
                          >
                             {formData.role === 'Farmer' ? (
                                <>
                                    <option>Irrigated</option>
                                    <option>Rainfed</option>
                                    <option>Drip</option>
                                    <option>Sprinkler</option>
                                </>
                             ) : (
                                <>
                                    <option>Tap Water</option>
                                    <option>Borewell</option>
                                    <option>Rainwater</option>
                                </>
                             )}
                          </select>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      {/* Card with Frame Animation */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 animate-scale-in border border-white/40 dark:border-gray-700 relative overflow-hidden ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl">
         
         {/* Top Color Glow */}
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
         
         {/* Animated Border/Frame Effect */}
         <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none border-[3px] border-transparent bg-gradient-to-tr from-green-400/0 via-green-400/10 to-green-400/0 opacity-0 animate-pulse-slow"></div>

         <div className="flex justify-between items-center mb-8 relative z-10">
             <div className="flex gap-2">
                 {[1, 2, 3].map(i => (
                     <div key={i} className={`h-2 rounded-full transition-all duration-500 ease-out ${i <= step ? 'w-8 bg-gradient-to-r from-green-500 to-emerald-500' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} />
                 ))}
             </div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {step}/3</div>
         </div>

         <div className="min-h-[380px] relative z-10">
             {step === 1 && renderStep1()}
             {step === 2 && renderStep2()}
             {step === 3 && renderStep3()}
         </div>

         <div className="mt-8 flex gap-3 relative z-10">
             {step > 1 && (
                 <button 
                    onClick={handleBack}
                    className="px-6 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                 >
                    Back
                 </button>
             )}
             <button 
                onClick={handleNext}
                disabled={step === 1 && !formData.name || step === 2 && !formData.location || step === 3 && !formData.landSize}
                className="flex-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-[length:200%_auto] animate-gradient-x hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
             >
                {step === totalSteps ? 'Complete Setup' : 'Next Step'}
                {step !== totalSteps && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
             </button>
         </div>
      </div>
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;