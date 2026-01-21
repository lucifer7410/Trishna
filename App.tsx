
import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Check, X, Moon, Sun, Bell } from 'lucide-react';
import Navigation from './components/Navigation';
import WeatherWidget from './components/WeatherWidget';
import MarketWidget from './components/MarketWidget';
import CropForm from './components/CropForm';
import PlantDoctorChat from './components/PlantDoctorChat';
import LearnSection from './components/LearnSection';
import SettingsSection from './components/SettingsSection';
import Auth from './components/Auth';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import PermissionModal from './components/PermissionModal';
import FeedbackModal from './components/FeedbackModal';
import NotificationPanel from './components/NotificationPanel';
import { AppSection, WeatherData, SUPPORTED_LANGUAGES, UserProfile, MarketRate, AppNotification } from './types';
import { fetchWeatherAndAlerts, fetchMarketRates } from './services/gemini';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileSetup, setIsProfileSetup] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.HOME);
  const [plantDoctorMode, setPlantDoctorMode] = useState<'general' | 'soil' | 'label'>('general');
  const [isLocating, setIsLocating] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // Settings & Modals State
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Market Rates State
  const [marketRates, setMarketRates] = useState<MarketRate[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].name);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Profile State - Initial is empty to trigger onboarding if not found
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    role: 'Farmer',
    location: '',
    landSize: '',
    soilType: 'Loamy',
    waterSource: 'Rainfed',
    profileImage: '',
    crops: []
  });

  // Load basic global settings (Theme, Lang) on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('trishna_language');
    if (savedLang) setLanguage(savedLang);

    // Dark Mode Initialization
    const savedTheme = localStorage.getItem('trishna_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      localStorage.setItem('trishna_theme', 'light');
    }
  }, []);

  // Handle Login and Load Specific User Data
  const handleLogin = (email: string) => {
      setCurrentUserEmail(email);
      setIsAuthenticated(true);
      
      // Try to load profile for THIS specific user
      const savedProfile = localStorage.getItem(`trishna_data_${email}`);
      
      if (savedProfile) {
          try {
             const parsed = JSON.parse(savedProfile);
             // Basic sanitation
             if (parsed.name && parsed.location) {
                 setUserProfile(parsed);
                 setIsProfileSetup(true);
                 // Also set as 'current' profile for easy access
                 localStorage.setItem('trishna_user_profile', JSON.stringify(parsed));
                 handleRefreshData(parsed.location);
             } else {
                 // Profile incomplete, trigger onboarding
                 setIsProfileSetup(false);
             }
          } catch(e) {
             console.error("Error parsing user data", e);
             setIsProfileSetup(false);
          }
      } else {
          // No data for this email, trigger onboarding
          setIsProfileSetup(false);
      }
      
      // Load notifications
      const savedNotifs = localStorage.getItem(`trishna_notifications_${email}`);
      if (savedNotifs) {
          try {
              setNotifications(JSON.parse(savedNotifs));
          } catch(e) { console.error(e); }
      }
  };

  // Notification Generator
  useEffect(() => {
    if (!isAuthenticated || !isProfileSetup) return;

    const generateNotifications = () => {
        const today = new Date().toLocaleDateString();
        const existingIds = new Set(notifications.map(n => n.id));
        const newNotifs: AppNotification[] = [];

        // 1. Weather Alerts
        if (weather?.alerts && weather.alerts.length > 0) {
           weather.alerts.forEach((alert, idx) => {
               const id = `weather-${today}-${idx}`;
               if (!existingIds.has(id)) {
                   newNotifs.push({
                       id,
                       title: 'Weather Alert',
                       message: alert,
                       timestamp: Date.now(),
                       read: false,
                       type: 'alert'
                   });
               }
           });
        }

        // 2. Crop Care (Simulated "Smart" Scheduling)
        // In a real app, this would use DB-stored sowing dates.
        // Here we use crop name hash + date to deterministically trigger tasks
        userProfile.crops.forEach(crop => {
            const cropHash = crop.split('').reduce((a,b) => a + b.charCodeAt(0), 0);
            const dayNum = new Date().getDate(); // 1-31
            
            // Water: Every 2-3 days simulated
            if ((cropHash + dayNum) % 3 === 0) {
                 const id = `water-${crop}-${today}`;
                 if (!existingIds.has(id)) {
                    newNotifs.push({
                        id,
                        title: `Water ${crop}`,
                        message: `Check moisture levels for your ${crop}. It might be thirsty!`,
                        timestamp: Date.now(),
                        read: false,
                        type: 'water'
                    });
                 }
            }
            
            // Fertilizer: Every 7 days simulated
            if ((cropHash + dayNum) % 7 === 0) {
                 const id = `fert-${crop}-${today}`;
                 if (!existingIds.has(id)) {
                    newNotifs.push({
                        id,
                        title: `Feed ${crop}`,
                        message: `Time to apply organic compost/fertilizer to your ${crop}.`,
                        timestamp: Date.now(),
                        read: false,
                        type: 'fertilizer'
                    });
                 }
            }
        });

        if (newNotifs.length > 0) {
            const updated = [...newNotifs, ...notifications].slice(0, 50); // Limit history
            setNotifications(updated);
            if (currentUserEmail) {
                localStorage.setItem(`trishna_notifications_${currentUserEmail}`, JSON.stringify(updated));
            }
        }
    };

    generateNotifications();
    // Re-run whenever weather updates or crops change
  }, [weather, userProfile.crops, isAuthenticated, isProfileSetup, currentUserEmail]);

  const handleMarkAsRead = (id: string) => {
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      setNotifications(updated);
      if (currentUserEmail) {
          localStorage.setItem(`trishna_notifications_${currentUserEmail}`, JSON.stringify(updated));
      }
  };

  const handleClearNotifications = () => {
      setNotifications([]);
      if (currentUserEmail) {
          localStorage.removeItem(`trishna_notifications_${currentUserEmail}`);
      }
  };

  // Handle Permission Logic - Trigger only after authentication
  useEffect(() => {
    if (isAuthenticated) {
      const hasRequested = localStorage.getItem('trishna_permissions_requested');
      if (!hasRequested) {
        setShowPermissions(true);
      }
    }
  }, [isAuthenticated]);

  const handlePermissionsComplete = () => {
    localStorage.setItem('trishna_permissions_requested', 'true');
    setShowPermissions(false);
  };

  // Theme Toggle Handler
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('trishna_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('trishna_theme', 'light');
    }
  };

  // Save profile changes (and persist to specific user key)
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setIsProfileSetup(true);
    
    // Save to current session
    localStorage.setItem('trishna_user_profile', JSON.stringify(newProfile));
    
    // Save to permanent user storage if we have an email
    if (currentUserEmail) {
        localStorage.setItem(`trishna_data_${currentUserEmail}`, JSON.stringify(newProfile));
    }
    
    // Refresh weather if location changed
    if (newProfile.location !== userProfile.location) {
      handleRefreshData(newProfile.location);
    }
  };

  const handleAddCrop = (cropName: string) => {
      // Remove (Fallback) if present
      const name = cropName.replace(/\s*\(Fallback\)\s*/i, '').trim();
      
      // Avoid duplicates
      const exists = userProfile.crops.some(c => c.toLowerCase() === name.toLowerCase());

      if (!exists) {
         const updatedCrops = [...userProfile.crops, name];
         const updatedProfile = { ...userProfile, crops: updatedCrops };
         handleSaveProfile(updatedProfile);
      }
  };

  const handleOnboardingComplete = (profile: UserProfile, lang: string) => {
    setUserProfile(profile);
    setLanguage(lang);
    setIsProfileSetup(true);

    // Save to current session
    localStorage.setItem('trishna_user_profile', JSON.stringify(profile));
    localStorage.setItem('trishna_language', lang);
    
    // Save to permanent user storage
    if (currentUserEmail) {
        localStorage.setItem(`trishna_data_${currentUserEmail}`, JSON.stringify(profile));
    }

    handleRefreshData(profile.location);
  };

  const handleLanguageChange = (langName: string) => {
    setLanguage(langName);
    localStorage.setItem('trishna_language', langName);
    setShowLangMenu(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLanding(true);
    setCurrentSection(AppSection.HOME);
    setCurrentUserEmail('');
    setIsProfileSetup(false);
  };

  useEffect(() => {
    // Only fetch weather/market if authenticated and profile is setup
    if (isAuthenticated && isProfileSetup && userProfile.location) {
      handleRefreshData(userProfile.location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.location, language, isAuthenticated, isProfileSetup]);

  const handleRefreshData = (loc: string) => {
      handleRefreshWeather(loc);
      handleRefreshMarket(loc);
  };

  const handleRefreshWeather = async (loc: string) => {
    setLoadingWeather(true);
    try {
      const data = await fetchWeatherAndAlerts(loc, language);
      setWeather(data);
    } catch (error) {
      console.error("Weather fetch failed", error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleRefreshMarket = async (loc: string) => {
      setLoadingMarket(true);
      try {
          const rates = await fetchMarketRates(loc, language);
          setMarketRates(rates);
      } catch (error) {
          console.error("Market rates fetch failed", error);
      } finally {
          setLoadingMarket(false);
      }
  };

  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const coords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          let formattedLocation = coords;
          
          try {
             // Reverse Geocoding to get place name
             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
             const data = await res.json();
             if (data && data.address) {
                 const city = data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county || '';
                 const state = data.address.state || '';
                 
                 // Robustly handle string conversion to avoid [object Object]
                 const parts = [city, state].filter(p => typeof p === 'string' && p.length > 0);
                 
                 if (parts.length > 0) {
                     formattedLocation = `${parts.join(', ')} (${coords})`;
                 }
             }
          } catch (e) {
             console.error("Reverse geocoding failed", e);
             // Fallback to coords only
          }
          
          // Update profile with new location coordinates
          const updatedProfile = { ...userProfile, location: formattedLocation };
          handleSaveProfile(updatedProfile); // Use handleSaveProfile to ensure persistence
          
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
          alert("Could not access location. Please check permissions.");
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSectionChange = (section: AppSection) => {
    setCurrentSection(section);
    // Reset Plant Doctor mode when navigating away from Doctor section
    if (section !== AppSection.DOCTOR) {
        setPlantDoctorMode('general');
    }
  };

  const handleScanFertilizer = () => {
    setPlantDoctorMode('label');
    setCurrentSection(AppSection.DOCTOR);
  };

  const renderLocationDisplay = () => {
    if (isLocating) return "Locating...";
    
    // Ensure location is a string to avoid object rendering errors
    let locString = String(userProfile.location || '');
    if (locString.includes('[object Object]')) locString = "Select Location";
    if (locString === '') locString = "Select Location";
    
    // Check if location has "Name (Coords)" format
    // Matches roughly: "Some Place (12.34, 56.78)"
    const match = locString.match(/^(.*)\s(\(-?\d+\.\d+,\s*-?\d+\.\d+\))$/);
    
    if (match) {
        return (
            <div className="flex flex-col leading-tight">
                <span className="truncate block">{match[1]}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal truncate block -mt-0.5">{match[2]}</span>
            </div>
        );
    }
    
    return <span className="truncate block">{locString}</span>;
  };

  const renderSection = () => {
    switch (currentSection) {
      case AppSection.HOME:
        return (
          <div className="space-y-6 pb-20 animate-fade-in">
             {/* Header */}
             <div className="flex justify-between items-center px-1">
               <div>
                 <h1 className="text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm">
                   My {userProfile.role === 'Farmer' ? 'Farm' : 'Garden'}
                 </h1>
                 <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">{new Date().toLocaleDateString()}</p>
               </div>
             </div>
             
             <WeatherWidget weather={weather} loading={loadingWeather} language={language} />

             {/* Market Prices Widget */}
             <MarketWidget 
                rates={marketRates} 
                loading={loadingMarket} 
                onRefresh={() => handleRefreshMarket(userProfile.location)}
                location={userProfile.location}
             />
             
             <div className="grid grid-cols-2 gap-4">
               <div 
                 onClick={() => setCurrentSection(AppSection.CROPS)}
                 className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl border border-white/50 dark:border-gray-600 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
               >
                 <span className="text-2xl mb-2 block">🌱</span>
                 <h3 className="font-semibold text-green-800 dark:text-green-400">New Crop?</h3>
                 <p className="text-xs text-green-600 dark:text-green-500 mt-1">Get recommendations</p>
               </div>
               <div 
                 onClick={() => setCurrentSection(AppSection.DOCTOR)}
                 className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl border border-white/50 dark:border-gray-600 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
               >
                 <span className="text-2xl mb-2 block">🩺</span>
                 <h3 className="font-semibold text-blue-800 dark:text-blue-400">Crop Issues?</h3>
                 <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Ask the Doctor</p>
               </div>
             </div>
             
             {/* Quick Tip */}
             <div className="bg-orange-50/90 dark:bg-orange-900/20 backdrop-blur-sm p-4 rounded-xl border border-orange-100 dark:border-orange-800 shadow-sm">
               <h3 className="font-semibold text-orange-800 dark:text-orange-300 text-sm mb-2">💡 Daily Tip</h3>
               <p className="text-xs text-orange-700 dark:text-orange-200 leading-relaxed">
                 {userProfile.role === 'Farmer' 
                   ? "Monitor soil moisture before irrigating to save water and prevent root rot."
                   : "Check your potted plants for drainage holes to prevent waterlogging."
                 }
               </p>
             </div>
          </div>
        );
      case AppSection.CROPS:
        return (
            <CropForm 
                location={userProfile.location} 
                language={language} 
                userProfile={userProfile} 
                onScanFertilizer={handleScanFertilizer}
                onAddCrop={handleAddCrop}
            />
        );
      case AppSection.DOCTOR:
        return (
            <PlantDoctorChat 
                language={language} 
                userProfile={userProfile} 
                initialMode={plantDoctorMode}
            />
        );
      case AppSection.LEARN:
        return <LearnSection language={language} />;
      case AppSection.SETTINGS:
        return (
            <SettingsSection 
                userProfile={userProfile} 
                onSaveProfile={handleSaveProfile} 
                onLogout={handleLogout}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                onOpenLanguage={() => setShowLangMenu(true)}
                onOpenFeedback={() => setShowFeedback(true)}
            />
        );
      default:
        return <div>Section not found</div>;
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showLanding && !isAuthenticated) {
    return (
      <LandingPage 
        onGetStarted={() => setShowLanding(false)} 
        onSignIn={() => setShowLanding(false)} 
      />
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  // Permission Modal Check - Now after Authentication
  if (showPermissions) {
    return <PermissionModal onComplete={handlePermissionsComplete} />;
  }

  // Show Onboarding if profile is not setup
  if (!isProfileSetup) {
    // Attempt to retrieve the temp name stored during signup/login if available
    const tempName = localStorage.getItem('trishna_temp_name') || "";
    return (
        <div className="min-h-screen bg-transparent">
             <Onboarding onComplete={handleOnboardingComplete} initialName={tempName} />
        </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-sm border-b border-gray-100/50 dark:border-gray-800/50 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 flex-1 min-w-0">
             <button 
               onClick={getUserLocation}
               className={`p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors flex-shrink-0 -ml-2 ${isLocating ? 'text-green-500 animate-bounce' : 'text-gray-500 dark:text-gray-400'}`}
               title="Update Location"
             >
               <MapPin className="h-5 w-5" />
             </button>
             
             <div 
                 className="flex flex-col cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/80 px-2 py-0.5 rounded transition-colors flex-1 min-w-0"
                 onClick={() => setCurrentSection(AppSection.SETTINGS)}
                 title="Click to edit profile"
               >
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Location</span>
                  <div className="text-sm font-semibold text-gray-800 dark:text-white overflow-hidden">
                    {renderLocationDisplay()}
                  </div>
               </div>
          </div>
          
          <div className="relative flex-shrink-0 flex items-center gap-2">
             {/* Notification Icon */}
             <button
               onClick={() => setShowNotifications(!showNotifications)}
               className="p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors relative"
               title="Notifications"
             >
               <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
               {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900 animate-pulse"></span>
               )}
             </button>

             {/* Dark/Bright Toggle */}
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
               {isDarkMode ? (
                 <Sun className="h-5 w-5 text-yellow-400" />
               ) : (
                 <Moon className="h-5 w-5 text-gray-600" />
               )}
             </button>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      {showNotifications && (
          <NotificationPanel 
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearNotifications}
          />
      )}

      {/* Feedback Modal */}
      {showFeedback && (
          <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}

      {showLangMenu && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                Select Language
              </h3>
              <button 
                onClick={() => setShowLangMenu(false)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-2 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 gap-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.name)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      language === lang.name 
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm ring-1 ring-green-200 dark:ring-green-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{lang.native}</span>
                      <span className="text-xs opacity-60 font-medium">{lang.name}</span>
                    </div>
                    {language === lang.name && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 min-h-[calc(100vh-140px)]">
        {renderSection()}
      </main>

      {/* Navigation */}
      <Navigation currentSection={currentSection} onSectionChange={handleSectionChange} />
    </div>
  );
};

export default App;
