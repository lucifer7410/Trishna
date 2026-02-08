
import React, { useState, useEffect } from 'react';
import { Sprout, Loader2, Info, X, ExternalLink, Droplets, Clock, Calendar, Scale, Image as ImageIcon, HelpCircle, Leaf, ScanLine, Plus, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { CropRecommendation, CropDetails, UserProfile } from '../types';
import { getSmartCropRecommendations, getCropDetails } from '../services/gemini';

interface CropFormProps {
  location: string;
  language: string;
  userProfile: UserProfile;
  onScanFertilizer?: () => void;
  onAddCrop?: (cropName: string) => void;
}

// UI Translations for Static Labels
const UI_TRANSLATIONS: Record<string, any> = {
  'English': { water: 'Water', duration: 'Duration', yield: 'Yield', season: 'Season', scientific: 'Scientific Name' },
  'Hindi': { water: 'पानी', duration: 'अवधि', yield: 'उपज', season: 'मौसम', scientific: 'वैज्ञानिक नाम' },
  'Marathi': { water: 'पाणी', duration: 'कालावधी', yield: 'उत्पन्न', season: 'हंगाम', scientific: 'वैज्ञानिक नाव' },
  'Bengali': { water: 'জল', duration: 'সময়কাল', yield: 'ফলন', season: 'ঋতু', scientific: 'বৈজ্ঞানিক নাম' },
  'Gujarati': { water: 'પાણી', duration: 'સમયગાળો', yield: 'ઉપજ', season: 'ઋતુ', scientific: 'વૈજ્ઞાનિક નામ' },
  'Tamil': { water: 'தண்ணீர்', duration: 'கால அளவு', yield: 'மகசூல்', season: 'பருவம்', scientific: 'அறிவியல் பெயர்' },
  'Telugu': { water: 'నీరు', duration: 'காலపరిమితి', yield: 'దిగుబడి', season: 'సీజన్', scientific: 'శాస్త్రీయ నామం' },
  'Kannada': { water: 'ನೀರು', duration: 'ಅವಧಿ', yield: 'ಇಳುವರಿ', season: 'ಋತು', scientific: 'ವೈಜ್ಞಾನಿಕ ಹೆಸರು' },
  'Malayalam': { water: 'വെള്ളം', duration: 'കാലയളവ്', yield: 'വിളവ്', season: 'സീസൺ', scientific: 'ശാസ്ത്രീയ നാമം' },
  'Punjabi': { water: 'ਪਾਣੀ', duration: 'ਸਮਾਂ', yield: 'ਝਾੜ', season: 'ਮੌਸਮ', scientific: 'ਵਿਗਿਆਨਕ ਨਾਮ' },
  // Default fallback
  'default': { water: 'Water', duration: 'Duration', yield: 'Yield', season: 'Season', scientific: 'Scientific Name' }
};

const Tooltip = ({ content }: { content: string }) => (
  <div className="group relative inline-flex items-center ml-1.5 cursor-help z-20">
    <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-green-600 transition-colors opacity-70 hover:opacity-100" />
    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2.5 bg-gray-800/95 text-white text-[11px] font-medium leading-tight rounded-lg shadow-xl z-50 text-center backdrop-blur-sm pointer-events-none transform translate-y-1 group-hover:translate-y-0">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800/95"></div>
    </div>
  </div>
);

const CropForm: React.FC<CropFormProps> = ({ location, language, userProfile, onScanFertilizer, onAddCrop }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[] | null>(null);
  
  // Details Modal State
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [cropDetails, setCropDetails] = useState<CropDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Interaction State
  const [expandedFertilizers, setExpandedFertilizers] = useState<Set<number>>(new Set());
  const [season, setSeason] = useState('Kharif');

  const getLabels = (lang: string) => UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['default'];
  const labels = getLabels(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations(null); // Clear previous results
    setExpandedFertilizers(new Set()); // Reset expansions
    try {
      const recs = await getSmartCropRecommendations(
        userProfile,
        season,
        language
      );
      setRecommendations(recs);
    } catch (error) {
      console.error(error);
      alert("Failed to get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = async (cropName: string) => {
    // Remove "(Fallback)" for cleaner search/details
    const cleanName = cropName.replace(/\(Fallback\)/i, '').trim();
    
    setSelectedCrop(cropName);
    setLoadingDetails(true);
    setCropDetails(null);
    setImageError(false);
    
    try {
      const details = await getCropDetails(cleanName, language);
      setCropDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedCrop(null);
    setCropDetails(null);
    setImageError(false);
  };

  const toggleFertilizer = (index: number) => {
    const newSet = new Set(expandedFertilizers);
    if (newSet.has(index)) {
        newSet.delete(index);
    } else {
        newSet.add(index);
    }
    setExpandedFertilizers(newSet);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <Sprout className="text-green-600" />
          Smart Plan for {userProfile.name}
        </h2>
        
        {/* Profile Context Summary */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 mb-4 text-xs text-green-800 dark:text-green-300 border border-green-100 dark:border-green-800/50 flex flex-wrap gap-2">
            <span className="font-semibold">{userProfile.role}</span>
            <span>•</span>
            <span>{userProfile.landSize}</span>
            <span>•</span>
            <span>{userProfile.soilType}</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Season</label>
            <select 
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 rounded-lg border-gray-300 dark:border-gray-600 border p-2.5 text-gray-700 dark:text-gray-200 focus:ring-green-500 focus:border-green-500"
            >
              <option>Kharif (Monsoon)</option>
              <option>Rabi (Winter)</option>
              <option>Zaid (Summer)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Get Recommendations'}
          </button>
        </form>
      </div>

      {recommendations && (
        <div className="space-y-4 pb-20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 px-1">Top Suggestions</h3>
          {recommendations.map((crop, idx) => {
            const isFertilizerExpanded = expandedFertilizers.has(idx);
            const isAdded = userProfile.crops.some(c => c.toLowerCase() === crop.cropName.toLowerCase());

            return (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 relative animate-fade-in-up hover:shadow-md transition-shadow group" style={{ animationDelay: `${idx * 100}ms` }}>
                
                {/* Clickable Card Body for Details */}
                <div 
                    onClick={() => handleShowDetails(crop.cropName)}
                    className="cursor-pointer"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-green-600 transition-colors">{crop.cropName}</h4>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
                        </div>
                        <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(crop.riskLevel)}`}>
                            {crop.riskLevel} Risk
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                                <Tooltip content="Feasibility based on your specific soil type, water access, and current weather." />
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-1">{crop.reasoning}</p>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {crop.tags?.map((tag, tIdx) => (
                        <span key={tIdx} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                            {tag}
                        </span>
                        ))}
                    </div>
                </div>

                {/* Quick Action Bar */}
                <div className="grid grid-cols-[1.5fr_1.5fr_auto] gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddCrop && onAddCrop(crop.cropName); }}
                        disabled={isAdded}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                            isAdded 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default' 
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-green-200'
                        }`}
                    >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {isAdded ? 'Added' : `Add to ${userProfile.role === 'Farmer' ? 'Farm' : 'Garden'}`}
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleFertilizer(idx); }}
                        disabled={!crop.fertilizer}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                            isFertilizerExpanded
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : crop.fertilizer ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30' : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <Leaf className="w-3.5 h-3.5" />
                        {isFertilizerExpanded ? 'Hide Guide' : 'Fertilizer Guide'}
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleShowDetails(crop.cropName); }}
                        className="px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        title="Full Details"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                </div>

                {/* Enhanced Fertilizer Guide */}
                {crop.fertilizer && isFertilizerExpanded && (
                    <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3 animate-fade-in">
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="font-bold text-amber-900 dark:text-amber-400 text-sm flex items-center gap-2">
                                    <Leaf className="w-4 h-4" /> 
                                    Sustainable Fertilizer Guide
                                </h5>
                                <div className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] rounded-full font-semibold border border-amber-200 dark:border-amber-800/50">
                                    Eco-Friendly
                                </div>
                            </div>
                            
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                                {crop.fertilizer.summary}
                            </p>

                            {/* Timeline / Schedule */}
                            <div className="relative pl-4 border-l-2 border-amber-200 dark:border-amber-800/50 space-y-4 mb-4">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-50 dark:ring-gray-900"></div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Schedule
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                        {crop.fertilizer.schedule}
                                    </p>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-amber-100 dark:border-amber-800/30 mb-4">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-green-500" /> Best Practices
                                </p>
                                <ul className="space-y-2">
                                    {crop.fertilizer.tips.map((tip, i) => (
                                        <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                            <span className="text-amber-500 mt-0.5">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                    {/* Additional Static Tips for Sustainability */}
                                    <li className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                        <span className="text-amber-500 mt-0.5">•</span>
                                        Use balanced NPK to ensure steady growth.
                                    </li>
                                </ul>
                                
                                <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-gray-700 flex gap-2 items-start opacity-90">
                                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-amber-800 dark:text-amber-300">
                                        <strong>Eco-Tip:</strong> Always prioritize organic compost. If using chemicals, <em>reduce Urea</em> usage to prevent soil acidity and pest outbreaks.
                                    </p>
                                </div>
                            </div>

                            {/* Scan Button */}
                            {onScanFertilizer && (
                                <button 
                                    onClick={onScanFertilizer}
                                    className="w-full bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-800/50 shadow-sm active:scale-[0.98]"
                                >
                                    <ScanLine className="w-4 h-4" />
                                    Scan Fertilizer Packet for AI Analysis
                                </button>
                            )}
                        </div>
                    </div>
                )}
                </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Details Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-scale-in border border-white/20 dark:border-gray-700">
            
            {/* Modal Header with Close Button and Graceful Image Handling */}
            <div className="relative">
                {cropDetails?.imageUrl && !imageError ? (
                     <div className="w-full h-56 relative group bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={cropDetails.imageUrl} 
                          alt={selectedCrop}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        
                        <button onClick={closeDetails} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all z-20">
                           <X className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute bottom-4 left-5 right-5 z-10">
                            <h3 className="text-2xl font-bold text-white drop-shadow-md">
                                {selectedCrop.replace(/\(Fallback\)/i, '').trim()}
                            </h3>
                        </div>
                     </div>
                ) : (
                    <div className="w-full h-48 relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 flex flex-col justify-end border-b border-gray-100 dark:border-gray-800">
                        {/* Abstract Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="absolute -right-10 -top-10 opacity-10 rotate-12">
                            <Sprout className="w-48 h-48 text-green-600 dark:text-green-400" />
                        </div>
                        
                        <button onClick={closeDetails} className="absolute top-4 right-4 p-2 bg-white/60 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-full text-gray-600 dark:text-gray-300 transition-all z-20 shadow-sm">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 relative z-10">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white leading-tight mb-2">
                                        {selectedCrop.replace(/\(Fallback\)/i, '').trim()}
                                    </h3>
                                    <a 
                                        href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(selectedCrop.replace(/\(Fallback\)/i, '').trim() + ' crop')}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-green-700 dark:text-green-400 hover:bg-white dark:hover:bg-gray-700 transition-all border border-green-200 dark:border-green-900/50 shadow-sm group"
                                    >
                                        <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" /> 
                                        Browse Images on Google
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-6 space-y-6">
               {loadingDetails ? (
                 <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                   <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
                   <p className="text-sm font-medium">Fetching expert details...</p>
                 </div>
               ) : cropDetails ? (
                 <>
                   {/* Scientific Name */}
                   <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg w-fit">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>{cropDetails.scientificName}</span>
                        <Tooltip content="The unique botanical name used globally to identify this plant." />
                   </div>

                   {/* Description */}
                   <div className="prose prose-sm dark:prose-invert max-w-none">
                     <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                       {cropDetails.description}
                     </p>
                   </div>
                   
                   {/* Info Grid */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Droplets className="w-12 h-12 text-blue-600" />
                         </div>
                         <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase mb-1">
                            <Droplets className="h-3.5 w-3.5" /> {labels.water}
                            <Tooltip content="Indicates how frequently and how much you need to water this crop." />
                         </div>
                         <p className="text-blue-900 dark:text-blue-100 font-semibold">{cropDetails.waterRequirement}</p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-12 h-12 text-amber-600" />
                         </div>
                         <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase mb-1">
                            <Clock className="h-3.5 w-3.5" /> {labels.duration}
                            <Tooltip content="The estimated time from planting/sowing to the first harvest." />
                         </div>
                         <p className="text-amber-900 dark:text-amber-100 font-semibold">{cropDetails.duration}</p>
                      </div>
                      
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Scale className="w-12 h-12 text-emerald-600" />
                         </div>
                         <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase mb-1">
                            <Scale className="h-3.5 w-3.5" /> {labels.yield}
                            <Tooltip content="The expected production amount per unit of land (e.g. per acre)." />
                         </div>
                         <p className="text-emerald-900 dark:text-emerald-100 font-semibold">{cropDetails.yield}</p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar className="w-12 h-12 text-purple-600" />
                         </div>
                         <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase mb-1">
                            <Calendar className="h-3.5 w-3.5" /> {labels.season}
                            <Tooltip content="The optimal time of year or weather season to start growing this crop." />
                         </div>
                         <p className="text-purple-900 dark:text-purple-100 font-semibold">{cropDetails.sowingSeason}</p>
                      </div>
                   </div>

                   {/* Add to Garden/Farm Button */}
                   {onAddCrop && (
                        <button 
                            onClick={() => { onAddCrop(selectedCrop); closeDetails(); }}
                            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            <Plus className="w-5 h-5" />
                            Add to My {userProfile.role === 'Farmer' ? 'Farm' : 'Garden'}
                        </button>
                   )}
                 </>
               ) : (
                 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                   Could not load details. Please check your connection.
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropForm;
