import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole, SUPPORTED_LANGUAGES } from '../types';
import { ArrowRight, Leaf, MapPin, User, Loader2, Tractor, Flower, Camera, Locate, Ruler, Mountain, Droplets, Search } from 'lucide-react';

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

  const totalSteps = 4;

  // Robust helper to ensure we never get [object Object]
  const toSafeString = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') {
        if (val.includes('[object Object]')) return '';
        return val.trim();
    }
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
        // Handle Nominatim object structure if passed directly
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
      landSize: '', // Reset to force user input
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
           // Fallback to coordinates on error
           handleChange('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
           setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        // Don't alert if user denied, just stop loading
        // alert("Could not detect location. Please type it manually.");
      }
    );
  };

  // Location Autocomplete Logic
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (formData.location.length > 2 && showSuggestions) {
        setIsSearching(true);
        try {
           const res = await fetch(
             `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&addressdetails=1&limit=5`, 
             { signal: controller.signal }
           );
           const data = await res.json();
           setSuggestions(Array.isArray(data) ? data : []);
        } catch (e: any) {
           if (e.name !== 'AbortError') setSuggestions([]);
        } finally {
           setIsSearching(false);
        }
      }
    }, 500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [formData.location, showSuggestions]);

  const handleSelectLocation = (place: any) => {
    const address = place.address || {};
    const city = toSafeString(address.city || address.town || address.village || address.county || address.municipality);
    const state = toSafeString(address.state); 
    const country = toSafeString(address.country);
    
    const parts = [city, state, country].filter(p => p.length > 0);
    const displayStr = toSafeString(place.display_name);
    
    const formatted = parts.length > 0 ? parts.join(', ') : displayStr;
    
    handleChange('location', formatted);
    setShowSuggestions(false);
  };

  const isStepValid = () => {
    if (step === 1) return true; // Language selected by default
    if (step === 2) return formData.name.trim().length > 0;
    if (step === 3) return formData.location.trim().length > 0;
    if (step === 4) return formData.landSize.trim().length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800/95 backdrop-blur-sm w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative flex flex-col min-h-[500px] animate-fade-in-up">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-700">
            <div 
                className="h-full bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
        </div>

        {/* Header */}
        <div className="p-8 pb-0 text-center">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4 shadow-sm">
                <Leaf className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {step === 1 && "Select Language"}
                {step === 2 && "Create Profile"}
                {step === 3 && "Where do you grow?"}
                {step === 4 && "Farm Details"}
             </h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {step} of {totalSteps}
             </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
            
            {/* Step 1: Language */}
            {step === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.name)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                language === lang.name
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                                : 'border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">{lang.native}</span>
                            <span className="block text-xs text-gray-400">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Identity */}
            {step === 2 && (
                <div className="space-y-6">
                    {/* Photo Upload */}
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-600 shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full border-2 border-white dark:border-gray-800 shadow-md">
                                <Camera className="w-4 h-4" />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">What should we call you?</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all dark:text-white"
                            placeholder="Enter your nickname or preferred name"
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Role & Location */}
            {step === 3 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleRoleSelect('Farmer')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                                formData.role === 'Farmer'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:text-gray-400'
                            }`}
                        >
                            <Tractor className="w-8 h-8" />
                            <span className="font-bold">Farmer</span>
                        </button>
                        <button
                            onClick={() => handleRoleSelect('Gardener')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                                formData.role === 'Gardener'
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                                : 'border-gray-200 dark:border-gray-700 hover:border-rose-200 dark:text-gray-400'
                            }`}
                        >
                            <Flower className="w-8 h-8" />
                            <span className="font-bold">Gardener</span>
                        </button>
                    </div>

                    <div className="space-y-2 relative" ref={dropdownRef}>
                        <div className="flex justify-between items-end mb-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Where is your {formData.role === 'Farmer' ? 'farm' : 'garden'}?</label>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => { handleChange('location', e.target.value); setShowSuggestions(true); }}
                                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
                                placeholder="Search city or area"
                            />
                            
                            <div className="absolute right-2 top-2">
                                <button 
                                    type="button"
                                    onClick={handleAutoLocation}
                                    disabled={isLocating}
                                    className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                                    title="Auto-detect location"
                                >
                                    {isLocating || isSearching ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                                    ) : (
                                        <Locate className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs px-1">
                           <span className="text-gray-400">Type manually or auto-detect</span>
                           <button 
                                type="button"
                                onClick={handleAutoLocation}
                                disabled={isLocating}
                                className="text-green-600 dark:text-green-400 font-medium hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                               {isLocating ? (
                                 <>
                                   <Loader2 className="w-3 h-3 animate-spin" />
                                   Detecting...
                                 </>
                               ) : (
                                 <>
                                   <Locate className="w-3 h-3" />
                                   Detect Location
                                 </>
                               )}
                           </button>
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                {suggestions.map((place, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectLocation(place)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm border-b border-gray-50 dark:border-gray-700 last:border-0 text-gray-700 dark:text-gray-200"
                                    >
                                        {toSafeString(place.display_name)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 4: Details */}
            {step === 4 && (
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Ruler className="w-4 h-4" /> {formData.role === 'Farmer' ? 'Land Size' : 'Garden Space'}
                        </label>
                        {formData.role === 'Farmer' ? (
                            <input
                                type="text"
                                value={formData.landSize}
                                onChange={(e) => handleChange('landSize', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                                placeholder="e.g. 2 Acres"
                            />
                        ) : (
                            <select
                                value={formData.landSize}
                                onChange={(e) => handleChange('landSize', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                            >
                                <option value="" disabled>Select Space</option>
                                <option>Balcony</option>
                                <option>Terrace</option>
                                <option>Backyard</option>
                                <option>Indoor Pots</option>
                                <option>Window Sill</option>
                            </select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Mountain className="w-4 h-4" /> Soil Type
                        </label>
                        <select
                            value={formData.soilType}
                            onChange={(e) => handleChange('soilType', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                        >
                            {formData.role === 'Farmer' ? (
                                <>
                                    <option>Loamy</option>
                                    <option>Clay</option>
                                    <option>Sandy</option>
                                    <option>Black Soil</option>
                                    <option>Red Soil</option>
                                    <option>Silt</option>
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Droplets className="w-4 h-4" /> Water Source
                        </label>
                        <select
                            value={formData.waterSource}
                            onChange={(e) => handleChange('waterSource', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                        >
                            {formData.role === 'Farmer' ? (
                                <>
                                    <option>Irrigated (Canal/Tube well)</option>
                                    <option>Rainfed</option>
                                    <option>Drip Irrigation</option>
                                    <option>Sprinkler</option>
                                </>
                            ) : (
                                <>
                                    <option>Tap Water</option>
                                    <option>Borewell Water</option>
                                    <option>Rainwater Harvesting</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            {step > 1 ? (
                <button 
                    onClick={handleBack}
                    className="text-gray-500 font-semibold px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    Back
                </button>
            ) : (
                <div></div>
            )}
            
            <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${
                    isStepValid()
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 transform hover:-translate-y-1'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
            >
                {step === totalSteps ? 'Get Started' : 'Next'}
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;