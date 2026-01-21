import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Droplets, Mountain, Ruler, X, Save, Tractor, Flower, Loader2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface ProfileModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onSave, onClose }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  
  // Location Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper to ensure safe strings
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

  // Location Autocomplete Logic
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setTimeout(async () => {
      if (formData.location.length > 2 && showSuggestions) {
        setIsSearching(true);
        try {
           // Using Nominatim OpenStreetMap API for geocoding
           const res = await fetch(
             `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&addressdetails=1&limit=5&countrycodes=in`, 
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
    }, 500); // 500ms debounce

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
    
    // Safely extract parts
    const city = toSafeString(address.city || address.town || address.village || address.county || address.municipality);
    const state = toSafeString(address.state);
    const displayStr = toSafeString(place.display_name);
    
    // Fallback to display_name if parts are missing
    const formatted = city && state ? `${city}, ${state}` : displayStr;
    
    handleChange('location', formatted);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Edit Profile
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('Farmer')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  formData.role === 'Farmer'
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:border-green-200 text-gray-600'
                }`}
              >
                <Tractor className="w-6 h-6" />
                <span className="font-medium">Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('Gardener')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  formData.role === 'Gardener'
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:border-green-200 text-gray-600'
                }`}
              >
                <Flower className="w-6 h-6" />
                <span className="font-medium">Gardener</span>
              </button>
            </div>
          </div>

          {/* Name & Location */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="Your Name"
              />
            </div>
            
            <div className="space-y-1 relative" ref={dropdownRef}>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={handleLocationChange}
                  onFocus={() => {
                    if(formData.location.length > 2) setShowSuggestions(true);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all pr-10"
                  placeholder="City, State"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((place, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLocation(place)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0 text-sm flex items-start gap-2"
                    >
                      <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 line-clamp-1">{toSafeString(place.display_name)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Farm/Garden Details */}
          <div className="space-y-4">
             <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-400" />
                {formData.role === 'Farmer' ? 'Land Size' : 'Garden Space'}
              </label>
              {formData.role === 'Farmer' ? (
                <input
                  type="text"
                  value={formData.landSize}
                  onChange={(e) => handleChange('landSize', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="e.g. 2 Acres, 5 Hectares"
                />
              ) : (
                <select
                  value={formData.landSize}
                  onChange={(e) => handleChange('landSize', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option>Balcony</option>
                  <option>Terrace</option>
                  <option>Backyard</option>
                  <option>Indoor Pots</option>
                  <option>Window Sill</option>
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mountain className="w-4 h-4 text-gray-400" /> Soil Type
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => handleChange('soilType', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-gray-400" /> Water Source
              </label>
              <select
                value={formData.waterSource}
                onChange={(e) => handleChange('waterSource', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => onSave(formData)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;