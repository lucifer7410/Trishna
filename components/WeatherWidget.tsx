
import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Thermometer, Wind, AlertTriangle, Droplets, ArrowUp, ArrowDown, Cloud, CloudLightning, Snowflake, HelpCircle, X, Loader2, CloudFog, CloudSun, Info, Calendar } from 'lucide-react';
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

  // Enhanced dynamic icons with Tailwind animations
  const getWeatherIcon = (condition: string, className: string = "h-8 w-8") => {
    const c = condition.toLowerCase();
    
    // Thunderstorm
    if (c.includes('thunder') || c.includes('storm')) {
        return (
             <div className="relative flex items-center justify-center">
                <CloudLightning className={`${className} text-purple-400 z-10 drop-shadow-lg`} />
                <div className="absolute inset-0 bg-yellow-400/40 blur-xl animate-pulse rounded-full"></div>
                {/* Electric sparks */}
                <div className="absolute -bottom-1 -right-1 w-1.5 h-4 bg-yellow-300 rotate-12 animate-ping opacity-60"></div>
             </div>
        );
    }
    
    // Drizzle / Light Rain
    if (c.includes('drizzle') || (c.includes('rain') && c.includes('light'))) {
         return (
            <div className="relative flex items-center justify-center">
                <CloudRain className={`${className} text-blue-300 drop-shadow-md z-10`} />
                <div className="absolute bottom-1 left-2 w-0.5 h-2 bg-blue-300 rounded-full animate-[bounce_1.5s_infinite]"></div>
                <div className="absolute bottom-2 right-2 w-0.5 h-2 bg-blue-300 rounded-full animate-[bounce_1.8s_infinite] delay-100"></div>
            </div>
        );
    }

    // Heavy Rain
    if (c.includes('rain') || c.includes('shower') || c.includes('heavy')) {
        return (
            <div className="relative flex items-center justify-center">
                <CloudRain className={`${className} text-blue-500 drop-shadow-lg z-10`} />
                <div className="absolute bottom-1 left-1/4 w-0.5 h-2.5 bg-blue-400 rounded-full animate-[bounce_0.8s_infinite]"></div>
                <div className="absolute bottom-0 left-1/2 w-0.5 h-3 bg-blue-400 rounded-full animate-[bounce_0.9s_infinite] delay-75"></div>
                <div className="absolute bottom-1 right-1/4 w-0.5 h-2.5 bg-blue-400 rounded-full animate-[bounce_0.7s_infinite] delay-150"></div>
            </div>
        );
    }
    
    // Snow
    if (c.includes('snow') || c.includes('frost') || c.includes('ice')) {
        return (
            <div className="relative flex items-center justify-center">
                 <Snowflake className={`${className} text-cyan-200 animate-[spin_6s_linear_infinite] z-10`} />
                 <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full blur-[1px] animate-ping"></div>
                 <div className="absolute bottom-0 left-0 w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse"></div>
            </div>
        );
    }

    // Atmosphere (Mist, Fog, Haze)
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) {
        return (
            <div className="relative flex items-center justify-center">
                <CloudFog className={`${className} text-gray-300 opacity-90 blur-[0.5px] animate-pulse`} />
                <div className="absolute bottom-0 w-full h-1 bg-gray-200/30 blur-md"></div>
            </div>
        );
    }
    
    // Partly Cloudy (Sun + Cloud)
    if ((c.includes('partly') && c.includes('cloud')) || (c.includes('sun') && c.includes('cloud'))) {
        return (
            <div className="relative flex items-center justify-center">
                 <Sun className="absolute -top-1 -right-1 w-[60%] h-[60%] text-yellow-400 animate-[spin_12s_linear_infinite]" />
                 <Cloud className={`${className} text-gray-400 fill-white/50 drop-shadow-md relative z-10 animate-float`} />
            </div>
        );
    }
    
    // Clouds
    if (c.includes('cloud') || c.includes('overcast') || c.includes('gloom')) {
        return (
            <div className="relative flex items-center justify-center">
                <Cloud className={`${className} text-gray-400 fill-white/20 drop-shadow-md animate-float z-10`} />
                <Cloud className="absolute top-0 -right-2 w-[50%] h-[50%] text-gray-300 fill-white/5 animate-[float_5s_ease-in-out_infinite_reverse]" />
            </div>
        );
    }
    
    // Clear / Sunny
    if (c.includes('clear') || c.includes('sun') || c.includes('hot')) {
        return (
            <div className="relative flex items-center justify-center">
                <Sun className={`${className} text-yellow-400 fill-yellow-400 animate-[spin_20s_linear_infinite] z-10`} />
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl animate-pulse rounded-full"></div>
                <div className="absolute inset-[-20%] border border-yellow-200/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            </div>
        );
    }
    
    // Windy
    if (c.includes('wind') || c.includes('breeze')) {
         return (
            <div className="relative flex items-center justify-center">
                <Wind className={`${className} text-gray-400 animate-wiggle`} />
            </div>
         );
    }
    
    // Default
    return <CloudSun className={`${className} text-orange-300 animate-pulse`} />;
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

  // Generate a dynamic advisory based on weather data if no official alerts exist
  const getAdvisory = () => {
    if (!weather) return null;
    if (weather.alerts && weather.alerts.length > 0) return null; // Official alerts take precedence

    const temp = parseInt(weather.temperature) || 30;
    const humidity = parseInt(weather.humidity) || 50;
    const condition = weather.condition.toLowerCase();
    const isRainy = condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm');
    const isWindy = parseInt(weather.wind || '0') > 20;

    if (isRainy) return {
        type: 'warning',
        title: 'Rain Alert',
        message: 'Heavy moisture detected. Ensure proper drainage to prevent root rot in vegetables.'
    };
    if (temp > 35) return {
        type: 'warning',
        title: 'Heat Advisory',
        message: 'Extreme heat detected. Irrigate crops during early morning or evening to reduce water loss.'
    };
    if (humidity > 80) return {
        type: 'warning',
        title: 'High Humidity',
        message: 'Humid conditions favor fungal growth. Inspect leaves for spots or mold.'
    };
    if (isWindy) return {
        type: 'warning',
        title: 'Wind Advisory',
        message: 'Strong winds detected. Secure tall crops and young saplings with stakes.'
    };
    
    // Default helpful tip if no extreme weather
    return {
        type: 'info',
        title: 'Field Condition',
        message: 'Conditions are favorable today. Good time for weeding and soil preparation.'
    };
  };

  const advisory = getAdvisory();

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
      <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all hover:shadow-xl group">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-yellow-300 opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
        
        {/* Help Button - Moved to Bottom Right */}
        <button 
            onClick={handleOpenInfo}
            className="absolute bottom-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white shadow-lg backdrop-blur-md transition-all z-20 hover:scale-105 active:scale-95"
            title="Weather Guide"
        >
            <HelpCircle className="w-5 h-5" />
        </button>

        <div className="flex justify-between items-start z-10 relative">
          <div>
            <h2 className="text-lg font-medium opacity-90 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
              {weather.location}
            </h2>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight">{weather.temperature}</span>
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
             <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm shadow-inner transition-transform group-hover:scale-105">
                {getWeatherIcon(weather.condition, "h-12 w-12")}
             </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="mt-6 z-10 relative border-t border-white/20 pt-4">
           <div className="grid grid-cols-2 gap-y-4 gap-x-4">
               <div className="flex items-start gap-2 text-sm text-green-50">
                 <Droplets className="h-4 w-4 opacity-80 mt-0.5 flex-shrink-0 animate-[bounce_3s_infinite]" />
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
                 <Sun className="h-4 w-4 opacity-80 mt-0.5 flex-shrink-0 animate-[spin_12s_linear_infinite]" />
                 <span className="leading-tight">{weather.sunshine || '--'} Sun</span>
               </div>
           </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-800">
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
        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-gray-800 font-bold text-sm dark:text-gray-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                7-Day Forecast
            </h3>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Swipe for more</span>
          </div>
          <div className="flex overflow-x-auto pb-6 pt-2 gap-3 snap-x scrollbar-hide -mx-1 px-1">
            {weather.forecast.map((day, idx) => (
              <div 
                key={idx} 
                className="group min-w-[120px] bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-between snap-start transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-green-200 dark:hover:border-green-900/50 hover:-translate-y-1 relative overflow-hidden"
              >
                 {/* Hover Gradient Background */}
                 <div className="absolute inset-0 bg-gradient-to-b from-green-50/0 to-green-50/50 dark:from-green-900/0 dark:to-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 
                 <div className="relative z-10 text-center w-full">
                    <span className="block text-gray-800 dark:text-gray-200 text-xs font-bold uppercase tracking-wider mb-0.5">{day.day}</span>
                    <span className="block text-gray-400 dark:text-gray-500 text-[10px] font-medium">{day.date}</span>
                 </div>
                 
                 <div className="relative z-10 my-4 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-md">
                   {getWeatherIcon(day.condition, "h-10 w-10")}
                 </div>
                 
                 <div className="relative z-10 flex flex-col items-center gap-0.5 w-full">
                    <div className="flex items-baseline gap-1">
                        <span className="text-gray-900 dark:text-white font-black text-lg">{day.maxTemp}</span>
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 text-xs font-semibold">{day.minTemp}</span>
                 </div>
                 
                 <div className="relative z-10 mt-3 h-5 w-full flex items-center justify-center">
                   {day.chanceOfRain && !day.chanceOfRain.includes('0') ? (
                     <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50">
                       <Droplets className="w-2.5 h-2.5 text-blue-500 animate-bounce" />
                       <span className="text-blue-700 dark:text-blue-300 text-[10px] font-bold">{day.chanceOfRain}</span>
                     </div>
                   ) : (
                     <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate max-w-[90px] opacity-80 group-hover:opacity-100 transition-opacity">
                        {day.condition}
                     </span>
                   )}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official API Alerts */}
      {weather.alerts.length > 0 && (
        <div className="space-y-2">
          {weather.alerts.map((alert, idx) => (
            <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex gap-3 items-start shadow-sm animate-fade-in-up">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-semibold text-sm">Weather Alert</h3>
                <p className="text-red-700 dark:text-red-400 text-sm mt-0.5">{alert}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Local Advisory (Fallback Warning/Info if no official alerts) */}
      {weather.alerts.length === 0 && advisory && (
        <div className={`mt-2 rounded-xl p-4 flex gap-3 items-start shadow-sm animate-fade-in-up border transition-colors ${
            advisory.type === 'warning' 
            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30' 
            : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
        }`}>
          <div className={`p-2 rounded-full flex-shrink-0 ${
              advisory.type === 'warning'
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
             {advisory.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${
                advisory.type === 'warning' ? 'text-orange-800 dark:text-orange-300' : 'text-blue-800 dark:text-blue-300'
            }`}>{advisory.title}</h3>
            <p className={`text-xs mt-1 leading-relaxed ${
                advisory.type === 'warning' ? 'text-orange-700 dark:text-orange-200' : 'text-blue-700 dark:text-blue-200'
            }`}>{advisory.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
