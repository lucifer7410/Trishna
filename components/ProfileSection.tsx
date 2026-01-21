import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Droplets, Mountain, Ruler, Save, Tractor, Flower, Loader2, Check, Sparkles, Camera, Plus, X, LogOut, Sprout, Trash2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface ProfileSectionProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onLogout: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, onSave, onLogout }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  
  // Location Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Crop Management State
  const [newCrop, setNewCrop] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Strict helper to ensure we never get [object Object]
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

  useEffect(() => {
    // Sanitize incoming profile data
    const safeProfile = { ...profile };
    (Object.keys(safeProfile) as Array<keyof UserProfile>).forEach(key => {
        if (key === 'profileImage' || key === 'crops') return; // Skip complex types
        safeProfile[key] = toSafeString(safeProfile[key]) as any;
    });
    // Ensure crops is an array
    if (!Array.isArray(safeProfile.crops)) {
        safeProfile.crops = [];
    }
    setFormData(safeProfile);
  }, [profile]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: toSafeString(value) }));
  };

  const handleRoleSelect = (role: UserRole) => {
    // Reset context specific fields when switching roles for cleaner UX
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

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange('profileImage', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Crop Management Handlers
  const addCrop = () => {
    if (newCrop.trim() && !formData.crops.includes(newCrop.trim())) {
      setFormData(prev => ({
        ...prev,
        crops: [...prev.crops, newCrop.trim()]
      }));
      setNewCrop('');
    }
  };

  const removeCrop = (cropToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.filter(c => c !== cropToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCrop();
    }
  };

  // Location Autocomplete Logic
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setTimeout(async () => {
      if (formData.location && formData.location.length > 2 && showSuggestions) {
        setIsSearching(true);
        try {
           const res = await fetch(
             `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&addressdetails=1&limit=5`, 
             { signal }
           );
           const data = await res.json();
           setSuggestions(Array.isArray(data) ? data : []);
        } catch (e: any) {
           if (e.name !== 'AbortError') {
             console.error("Location search failed", e);
             setSuggestions([]);
           }
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
  }, [formData.location, showSuggestions]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('location', e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectLocation = (place: any) => {
    const address = place.address || {};
    const city = toSafeString(address.city || address.town || address.village || address.county || address.municipality);
    const state = toSafeString(address.state);
    const displayStr = toSafeString(place.display_name);

    let formatted = displayStr;
    if (city && state) {
        formatted = `${city}, ${state}`;
    }
    
    handleChange('location', formatted);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const inputClassName = "w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-3.5 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 font-medium shadow-sm hover:border-gray-200 dark:hover:border-gray-600";

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
      
      {/* Main Profile Card */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700 p-6 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 relative z-10">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-green-500/20">
              <User className="w-5 h-5" />
            </div>
            My Profile
        </h2>

        <div className="space-y-8 relative z-10">
          
          {/* Profile Photo Upload */}
          <div className="flex justify-center -mb-2">
            <div className="relative group">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden cursor-pointer relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-transform hover:scale-105"
                >
                    {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${formData.role === 'Farmer' ? 'from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800' : 'from-rose-100 to-pink-200 dark:from-rose-900 dark:to-pink-800'}`}>
                            {formData.role === 'Farmer' ? (
                                <Tractor className="w-14 h-14 text-green-600 dark:text-green-300 opacity-50" />
                            ) : (
                                <Flower className="w-14 h-14 text-rose-500 dark:text-rose-300 opacity-50" />
                            )}
                        </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="w-8 h-8 text-white mb-1" />
                        <span className="text-white text-xs font-medium">Upload</span>
                    </div>
                </div>

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-700 transition-colors"
                    type="button"
                >
                    <Plus className="w-5 h-5" />
                </button>

                {formData.profileImage && (
                    <button
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-700 transition-colors z-20"
                        title="Remove photo"
                        type="button"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-green-500" />
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleSelect('Farmer')}
                className={`relative group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 ${
                  formData.role === 'Farmer'
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-300 ring-2 ring-green-500/20 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/30 text-gray-500 dark:text-gray-400 hover:shadow-md'
                }`}
              >
                <div className={`p-4 rounded-full transition-all duration-300 ${formData.role === 'Farmer' ? 'bg-green-500 text-white shadow-green-500/30 shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 dark:group-hover:bg-green-900/50 dark:group-hover:text-green-400'}`}>
                  <Tractor className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg block">Farmer</span>
                  <span className="text-xs opacity-70 font-medium mt-0.5 block">Large Scale & Crops</span>
                </div>
                {formData.role === 'Farmer' && <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1 shadow-sm"><Check className="w-3.5 h-3.5" /></div>}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('Gardener')}
                className={`relative group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 ${
                  formData.role === 'Gardener'
                    ? 'border-rose-400 bg-gradient-to-br from-rose-50 to-pink-100/50 dark:from-rose-900/40 dark:to-pink-900/40 text-rose-800 dark:text-rose-300 ring-2 ring-rose-400/20 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50/30 text-gray-500 dark:text-gray-400 hover:shadow-md'
                }`}
              >
                <div className={`p-4 rounded-full transition-all duration-300 ${formData.role === 'Gardener' ? 'bg-rose-500 text-white shadow-rose-500/30 shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:bg-rose-100 group-hover:text-rose-500 dark:group-hover:bg-rose-900/50 dark:group-hover:text-rose-400'}`}>
                  <Flower className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg block">Gardener</span>
                  <span className="text-xs opacity-70 font-medium mt-0.5 block">Home & Plants</span>
                </div>
                {formData.role === 'Gardener' && <div className="absolute top-3 right-3 bg-rose-500 text-white rounded-full p-1 shadow-sm"><Check className="w-3.5 h-3.5" /></div>}
              </button>
            </div>
          </div>

          {/* Name & Location */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
                <User className="w-4 h-4 text-green-600" /> Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputClassName}
                placeholder="Your Name"
              />
            </div>
            
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
                <MapPin className="w-4 h-4 text-green-600" /> Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={handleLocationChange}
                  onFocus={() => {
                    if(formData.location.length > 2) setShowSuggestions(true);
                  }}
                  className={`${inputClassName} pr-10`}
                  placeholder="City, State"
                />
                {isSearching && (
                  <div className="absolute right-4 top-3.5">
                    <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                  </div>
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl max-h-56 overflow-y-auto overflow-hidden animate-fade-in-up">
                  {suggestions.map((place, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLocation(place)}
                      className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 text-sm flex items-start gap-3 group"
                    >
                      <div className="bg-green-50 dark:bg-green-900/30 p-1.5 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                        <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-200 mt-1 font-medium">{toSafeString(place.display_name)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
          
          {/* My Crops Section */}
          <div className="space-y-3">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
                <Sprout className="w-4 h-4 text-green-600" />
                {formData.role === 'Farmer' ? 'My Crops' : 'My Plants'}
             </label>
             
             <div className="flex gap-2">
               <input
                 type="text"
                 value={newCrop}
                 onChange={(e) => setNewCrop(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Add a crop (e.g. Tomato)"
                 className={`${inputClassName} py-2.5`}
               />
               <button 
                 onClick={addCrop}
                 disabled={!newCrop.trim()}
                 className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-2xl px-4 transition-colors shadow-sm"
               >
                 <Plus className="w-6 h-6" />
               </button>
             </div>

             <div className="flex flex-wrap gap-2 mt-2">
               {formData.crops && formData.crops.length > 0 ? (
                 formData.crops.map((crop, idx) => (
                   <div key={idx} className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-800 dark:text-green-200 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 animate-scale-in">
                     {crop}
                     <button onClick={() => removeCrop(crop)} className="text-green-600 hover:text-red-500 transition-colors">
                       <X className="w-3.5 h-3.5" />
                     </button>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-gray-400 italic ml-1">No crops added yet. List what you grow!</p>
               )}
             </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

          {/* Farm/Garden Details Grid */}
          <div className="grid grid-cols-1 gap-5">
             <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
                <Ruler className="w-4 h-4 text-green-600" />
                {formData.role === 'Farmer' ? 'Land Size' : 'Garden Space'}
              </label>
              {formData.role === 'Farmer' ? (
                <input
                  type="text"
                  value={formData.landSize}
                  onChange={(e) => handleChange('landSize', e.target.value)}
                  className={inputClassName}
                  placeholder="e.g. 2 Acres"
                />
              ) : (
                <div className="relative">
                  <select
                    value={formData.landSize}
                    onChange={(e) => handleChange('landSize', e.target.value)}
                    className={`${inputClassName} appearance-none cursor-pointer`}
                  >
                    <option>Balcony</option>
                    <option>Terrace</option>
                    <option>Backyard</option>
                    <option>Indoor Pots</option>
                    <option>Window Sill</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
                <Mountain className="w-4 h-4 text-green-600" /> Soil Type
              </label>
              <div className="relative">
                <select
                  value={formData.soilType}
                  onChange={(e) => handleChange('soilType', e.target.value)}
                  className={`${inputClassName} appearance-none cursor-pointer`}
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
                <Droplets className="w-4 h-4 text-green-600" /> Water Source
              </label>
              <div className="relative">
                <select
                  value={formData.waterSource}
                  onChange={(e) => handleChange('waterSource', e.target.value)}
                  className={`${inputClassName} appearance-none cursor-pointer`}
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 relative z-10">
          <button
            onClick={handleSave}
            className={`w-full font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 transform hover:-translate-y-1 duration-200 ${
                isSaved 
                ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 shadow-emerald-100' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-600/30'
            }`}
          >
            {isSaved ? (
                <>
                    <Check className="w-6 h-6" /> Saved Successfully
                </>
            ) : (
                <>
                    <Save className="w-5 h-5" /> Save Profile
                </>
            )}
          </button>
          
          <button
            onClick={onLogout}
            className="w-full mt-4 py-3.5 px-6 rounded-2xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileSection;
