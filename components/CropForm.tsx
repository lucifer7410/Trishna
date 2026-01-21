
import React, { useState, useEffect } from 'react';
import { Sprout, Loader2, Info, X, ExternalLink, Droplets, Clock, Calendar, Scale, Image as ImageIcon, HelpCircle, Leaf, CalendarDays, ScanLine, Sprout as SeedlingIcon, Plus, Check } from 'lucide-react';
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
    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-800/95 text-white text-[11px] font-medium leading-tight rounded-lg shadow-xl z-50 text-center backdrop-blur-sm pointer-events-none transform translate-y-1 group-hover:translate-y-0">
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Sprout className="text-green-600" />
          Smart Plan for {userProfile.name}
        </h2>
        
        {/* Profile Context Summary */}
        <div className="bg-green-50 rounded-xl p-3 mb-4 text-xs text-green-800 border border-green-100 flex flex-wrap gap-2">
            <span className="font-semibold">{userProfile.role}</span>
            <span>•</span>
            <span>{userProfile.landSize}</span>
            <span>•</span>
            <span>{userProfile.soilType}</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select 
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-white rounded-lg border-gray-300 border p-2.5 text-gray-700 focus:ring-green-500 focus:border-green-500"
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
          <h3 className="text-lg font-semibold text-gray-800 px-1">Top Suggestions</h3>
          {recommendations.map((crop, idx) => {
            const isFertilizerExpanded = expandedFertilizers.has(idx);
            const isAdded = userProfile.crops.some(c => c.toLowerCase() === crop.cropName.toLowerCase());

            return (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative">
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-gray-800">{crop.cropName}</h4>
                    <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(crop.riskLevel)}`}>
                        {crop.riskLevel} Risk
                        </span>
                        <Tooltip content="Feasibility based on your specific soil type, water access, and current weather." />
                    </div>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">{crop.reasoning}</p>

                <div className="flex flex-wrap gap-2 mt-1">
                    {crop.tags?.map((tag, tIdx) => (
                    <span key={tIdx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {tag}
                    </span>
                    ))}
                </div>

                {/* Action Bar */}
                <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-100">
                    <button 
                        onClick={() => onAddCrop && onAddCrop(crop.cropName)}
                        disabled={isAdded}
                        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isAdded 
                            ? 'bg-green-50 text-green-700 cursor-default' 
                            : 'hover:bg-gray-50 text-gray-600 hover:text-green-600 active:scale-95'
                        }`}
                    >
                        {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isAdded ? 'Added' : 'Add Crop'}
                    </button>
                    
                    <button 
                        onClick={() => toggleFertilizer(idx)}
                        disabled={!crop.fertilizer}
                        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isFertilizerExpanded
                            ? 'bg-amber-50 text-amber-800'
                            : crop.fertilizer ? 'hover:bg-gray-50 text-gray-600 hover:text-amber-600' : 'text-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <Leaf className="w-4 h-4" />
                        Fertilizer
                    </button>
                    
                    <button 
                        onClick={() => handleShowDetails(crop.cropName)}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition-colors active:scale-95"
                    >
                        <Info className="w-4 h-4" />
                        Details
                    </button>
                </div>

                {/* Collapsible Fertilizer Guide */}
                {crop.fertilizer && isFertilizerExpanded && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100/80 rounded-xl p-3.5 mt-2 shadow-sm animate-fade-in-up">
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Fertilizer Guide</h5>
                            </div>
                            <span className="text-[10px] font-medium bg-white text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">Sustainable</span>
                        </div>
                        
                        <p className="text-sm font-semibold text-gray-800 mb-2 leading-tight">
                            {crop.fertilizer.summary}
                        </p>
                        
                        <div className="bg-white/60 rounded-lg p-2.5 mb-2.5 border border-amber-50">
                            <ul className="space-y-1.5">
                                {crop.fertilizer.tips?.slice(0, 3).map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                    <SeedlingIcon className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{tip}</span>
                                </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-100/50 p-2 rounded-lg">
                            <CalendarDays className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-70" />
                            <p className="leading-tight">
                                <span className="font-semibold opacity-90">Schedule:</span> {crop.fertilizer.schedule}
                            </p>
                        </div>
                        
                        {onScanFertilizer && (
                            <button 
                                onClick={onScanFertilizer}
                                className="w-full mt-3 bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                                <ScanLine className="w-3.5 h-3.5 text-amber-700" />
                                Scan Fertilizer Packet
                            </button>
                        )}
                    </div>
                )}
                </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
               <h3 className="text-xl font-bold text-gray-800">{selectedCrop.replace('(Fallback)', '')}</h3>
               <button onClick={closeDetails} className="p-2 hover:bg-gray-100 rounded-full">
                 <X className="h-6 w-6 text-gray-500" />
               </button>
            </div>
            
            <div className="p-5 space-y-6">
               {loadingDetails ? (
                 <div className="flex flex-col items-center justify-center py-10 gap-3">
                   <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                   <p className="text-gray-500 text-sm">Fetching crop details...</p>
                 </div>
               ) : cropDetails ? (
                 <>
                   {cropDetails.imageUrl && !imageError ? (
                     <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden shadow-inner relative group">
                        <img 
                          src={cropDetails.imageUrl} 
                          alt={selectedCrop.replace('(Fallback)', '')}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                        <a 
                         href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(selectedCrop.replace('(Fallback)', '') + ' crop')}`}
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity flex items-center gap-1"
                        >
                          <ImageIcon className="h-3 w-3" /> More Images
                        </a>
                     </div>
                   ) : (
                    <div className="w-full h-48 bg-gray-50 rounded-xl overflow-hidden shadow-inner relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200">
                        <Sprout className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-gray-500 text-sm font-medium">Image not available</p>
                        <a 
                          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(selectedCrop.replace('(Fallback)', '') + ' crop')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-3 bg-white border border-gray-200 text-gray-700 hover:text-green-600 hover:border-green-200 text-xs px-4 py-2 rounded-full shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <ExternalLink className="h-3 w-3" /> Search Images
                        </a>
                    </div>
                   )}

                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="text-gray-700 leading-relaxed text-sm">
                       {cropDetails.description}
                     </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                         <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase mb-1">
                           <div className="flex items-center">
                               <Droplets className="h-3.5 w-3.5 mr-1" /> {labels.water}
                           </div>
                           <Tooltip content="Water requirement and irrigation frequency needed for healthy growth." />
                         </div>
                         <p className="text-blue-900 font-medium">{cropDetails.waterRequirement}</p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                         <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase mb-1">
                            <div className="flex items-center">
                               <Clock className="h-3.5 w-3.5 mr-1" /> {labels.duration}
                           </div>
                           <Tooltip content="Total time from sowing to harvesting the crop." />
                         </div>
                         <p className="text-amber-900 font-medium">{cropDetails.duration}</p>
                      </div>
                      
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                         <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase mb-1">
                            <div className="flex items-center">
                               <Scale className="h-3.5 w-3.5 mr-1" /> {labels.yield}
                           </div>
                           <Tooltip content="Expected production output per unit of land." />
                         </div>
                         <p className="text-emerald-900 font-medium">{cropDetails.yield}</p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                         <div className="flex items-center gap-2 text-purple-800 text-xs font-bold uppercase mb-1">
                           <div className="flex items-center">
                               <Calendar className="h-3.5 w-3.5 mr-1" /> {labels.season}
                           </div>
                           <Tooltip content="Ideal months for sowing this crop in your region." />
                         </div>
                         <p className="text-purple-900 font-medium">{cropDetails.sowingSeason}</p>
                      </div>
                   </div>
                   
                   <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                     {labels.scientific}: <span className="italic">{cropDetails.scientificName}</span>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-8 text-gray-500">
                   Could not load details. Please try again.
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
