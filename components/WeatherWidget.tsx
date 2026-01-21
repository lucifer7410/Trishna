
import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Thermometer, Wind, AlertTriangle, Droplets, ArrowUp, ArrowDown, Cloud, CloudLightning, Snowflake, HelpCircle, X, Loader2 } from 'lucide-react';
import { WeatherData } from '../types';
import { getWeatherFactorsExplanation } from '../services/gemini';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  language?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, loading, language = 'English' }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExpl, setLoadingExpl] = useState(false);

  const getWeatherIcon = (condition: string, className: string = "h-8 w-8") => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className={`${className} text-blue-400`} />;
    if (c.includes('thunder') || c.includes('storm')) return <CloudLightning className={`${className} text-purple-500`} />;
    if (c.includes('snow')) return <Snowflake className={`${className} text-cyan-300`} />;
    if (c.includes('cloud')) return <Cloud className={`${className} text-gray-400`} />;
    if (c.includes('clear') || c.includes('sun')) return <Sun className={`${className} text-yellow-400`} />;
    return <Sun className={`${className} text-yellow-400`} />; // Default
  };

  const handleOpenInfo = async () => {
    setShowInfo(true);
    // Only fetch if not already loaded or if specific language is needed (simplified check)
    if (Object.keys(explanations).length === 0) {
        setLoadingExpl(true);
        try {
            const data = await getWeatherFactorsExplanation(language);
            setExplanations(data);
        } catch (e) {
            console.error("Failed to load explanations");
        } finally {
            setLoadingExpl(false);
        }
    }
  };

  const defaultExplanations = {
      "Temperature": "Every plant has a minimum, optimum, and maximum temperature range for germination, growth, and yield.",
      "Rainfall": "Water availability controls root growth; too little causes stress, too much causes rot and disease.",
      "Sunlight": "Needed for photosynthesis; low light slows growth, while too much strong sun can burn leaves.",
      "Humidity": "High humidity can encourage fungal diseases, very low humidity with heat can dry plants quickly.",
      "Wind": "Increases water loss and can damage plants; gentle wind helps strengthen stems."
  };

  const displayExplanations = Object.keys(explanations).length > 0 ? explanations : defaultExplanations;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full animate-pulse h-48 flex items-center justify-center">
        <span className="text-gray-400">Loading Weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Weather Card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all hover:shadow-xl">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        {/* Help Button - Moved to Bottom Right */}
        <button 
            onClick={handleOpenInfo}
            className="absolute bottom-5 right-5 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/80 z-20"
            title="Weather Guide"
        >
            <HelpCircle className="w-4 h-4" />
        </button>

        <div className="flex justify-between items-start z-10 relative">
          <div>
            <h2 className="text-lg font-medium opacity-90 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
              {weather.location}
            </h2>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-5xl font-bold">{weather.temperature}</span>
            </div>
            {/* Min/Max Temperature Range */}
            {(weather.maxTemp || weather.minTemp) && (
              <div className="mt-1 flex gap-3 text-sm font-medium text-green-100/90">
                 {weather.maxTemp && <span className="flex items-center gap-0.5"><ArrowUp className="w-3 h-3" /> H: {weather.maxTemp}</span>}
                 {weather.minTemp && <span className="flex items-center gap-0.5"><ArrowDown className="w-3 h-3" /> L: {weather.minTemp}</span>}
              </div>
            )}
            <p className="mt-2 text-green-50 font-medium text-lg">{weather.condition}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm shadow-inner">
                {getWeatherIcon(weather.condition, "h-8 w-8 text-white")}
             </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="mt-6 z-10 relative border-t border-white/20 pt-4">
           <div className="grid grid-cols-2 gap-y-4 gap-x-4">
               <div className="flex items-start gap-2 text-sm text-green-50">
                 <Droplets className="h-4 w-4 opacity-80 mt-0.5 flex-shrink-0" />
                 <span className="leading-tight">{weather.humidity} Humidity</span>
               </div>
               <div className="flex items-start gap-2 text-sm text-green-50">
                 <CloudRain className="h-4 w-4 opacity-80 mt-0.5 flex-shrink-0" />
                 <span className="leading-tight">{weather.rainfall} Rain</span>
               </div>
               <div className="flex items-start gap-2 text-sm text-green-50">
                 <Wind className="h-4 w-4 opacity-80 mt-0.5 flex-shrink-0" />
                 <span className="leading-tight">{weather.wind || '--'} Wind</span>
               </div>
               <div className="flex items-start gap-2 text-sm text-green-50 pr-8">
                 <Sun className="h-4 w-4 opacity-80 mt-0.5 flex-shrink-0" />
                 <span className="leading-tight">{weather.sunshine || '--'} Sun</span>
               </div>
           </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-green-50 dark:bg-gray-800">
                    <h3 className="font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        Weather Guide
                    </h3>
                    <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {loadingExpl ? (
                        <div className="text-center py-8 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-green-600" />
                            <p>Loading translations...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                <h4 className="font-semibold text-orange-800 dark:text-orange-300 text-sm flex items-center gap-2 mb-1">
                                    <Thermometer className="w-4 h-4" /> Temperature
                                </h4>
                                <p className="text-sm text-orange-900/80 dark:text-orange-200">{displayExplanations["Temperature"]}</p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2 mb-1">
                                    <CloudRain className="w-4 h-4" /> Rainfall
                                </h4>
                                <p className="text-sm text-blue-900/80 dark:text-blue-200">{displayExplanations["Rainfall"]}</p>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm flex items-center gap-2 mb-1">
                                    <Sun className="w-4 h-4" /> Sunlight
                                </h4>
                                <p className="text-sm text-yellow-900/80 dark:text-yellow-200">{displayExplanations["Sunlight"]}</p>
                            </div>

                            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                                <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 text-sm flex items-center gap-2 mb-1">
                                    <Droplets className="w-4 h-4" /> Humidity
                                </h4>
                                <p className="text-sm text-cyan-900/80 dark:text-cyan-200">{displayExplanations["Humidity"]}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-300 text-sm flex items-center gap-2 mb-1">
                                    <Wind className="w-4 h-4" /> Wind
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{displayExplanations["Wind"]}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* 7-Day Forecast Scroll */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-gray-800 font-semibold text-sm">7-Day Forecast</h3>
            <span className="text-xs text-gray-500">Scroll for more</span>
          </div>
          <div className="flex overflow-x-auto pb-2 gap-3 snap-x scrollbar-hide -mx-1 px-1">
            {weather.forecast.map((day, idx) => (
              <div 
                key={idx} 
                className="min-w-[100px] bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center snap-start transition-transform hover:scale-105"
              >
                 <span className="text-gray-600 text-xs font-semibold">{day.day}</span>
                 <span className="text-gray-400 text-[10px] mb-2">{day.date}</span>
                 
                 <div className="my-1">
                   {getWeatherIcon(day.condition, "h-6 w-6")}
                 </div>
                 
                 <div className="flex flex-col items-center mt-1">
                    <span className="text-gray-800 font-bold text-sm">{day.maxTemp}</span>
                    <span className="text-gray-400 text-xs">{day.minTemp}</span>
                 </div>
                 
                 {day.chanceOfRain && !day.chanceOfRain.includes('0') && (
                   <div className="flex items-center gap-0.5 mt-2 bg-blue-50 px-1.5 py-0.5 rounded-full">
                     <Droplets className="w-2.5 h-2.5 text-blue-500" />
                     <span className="text-blue-600 text-[9px] font-medium">{day.chanceOfRain}</span>
                   </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {weather.alerts.length > 0 && (
        <div className="space-y-2">
          {weather.alerts.map((alert, idx) => (
            <div key={idx} className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start shadow-sm animate-fade-in-up">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold text-sm">Weather Alert</h3>
                <p className="text-red-700 text-sm mt-0.5">{alert}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
