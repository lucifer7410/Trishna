
import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Check, X, Moon, Sun, Bell, AlertTriangle } from 'lucide-react';
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
import AboutModal from './components/AboutModal';
import { AppSection, WeatherData, SUPPORTED_LANGUAGES, UserProfile, MarketRate, AppNotification } from './types';
import { fetchWeatherAndAlerts, fetchMarketRates } from './services/gemini';
import { notifyLogin, notifyLogout } from './services/emailService';

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
  const [showAbout, setShowAbout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Market Rates State
  const [marketRates, setMarketRates] = useState<MarketRate[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].name);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  // Profile State
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

  useEffect(() => {
    // API KEY DEBUG CHECK
    let key = process.env.API_KEY || '';
    
    // Check if the standard key is a placeholder or missing
    if (!key || key.length < 20 || key.includes('INSERT')) {
        // Try fallback for Vite environments
        try {
             // @ts-ignore
             const viteKey = import.meta.env?.VITE_API_KEY;
             if (viteKey && viteKey.length > 20) {
                 key = viteKey;
             }
        } catch(e) {}
    }

    // Explicit fallback for immediate fix in web containers
    if (!key || key.length < 20 || key.includes('INSERT')) {
        key = 'YOUR_GEMINI_API_KEY';
    }

    if (!key || key.length < 20 || key.includes('INSERT')) {
        setApiKeyError(true);
        console.error(`[Trishna] API Key appears invalid (Length: ${key.length}).`);
    } else {
        setApiKeyError(false);
    }

    const savedLang = localStorage.getItem('trishna_language');
    if (savedLang) setLanguage(savedLang);

    const savedTheme = localStorage.getItem('trishna_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = (email: string) => {
      setCurrentUserEmail(email);
      setIsAuthenticated(true);
      // Persist session
      localStorage.setItem('trishna_active_user', email);
      
      const savedProfile = localStorage.getItem(`trishna_data_${email}`);
      
      if (savedProfile) {
          try {
             const parsed = JSON.parse(savedProfile);
             if (parsed.name && parsed.location) {
                 setUserProfile(parsed);
                 setIsProfileSetup(true);
                 localStorage.setItem('trishna_user_profile', JSON.stringify(parsed));
                 handleRefreshData(parsed.location);
                 // Alert admin about returning user
                 notifyLogin(email, parsed);
             } else {
                 setIsProfileSetup(false);
                 // If profile incomplete, try to fetch name from mock auth data to pre-fill onboarding
                 const mockUser = localStorage.getItem(`trishna_mock_user_${email}`);
                 if (mockUser) {
                    try {
                        const u = JSON.parse(mockUser);
                        if (u.name) localStorage.setItem('trishna_temp_name', u.name);
                    } catch(e) {}
                 }
                 notifyLogin(email);
             }
          } catch(e) {
             console.error("Error parsing user data", e);
             setIsProfileSetup(false);
             notifyLogin(email);
          }
      } else {
          setIsProfileSetup(false);
          // Alert admin about first-time social login entry
          notifyLogin(email);
      }
      
      const savedNotifs = localStorage.getItem(`trishna_notifications_${email}`);
      if (savedNotifs) {
          try {
              setNotifications(JSON.parse(savedNotifs));
          } catch(e) { console.error(e); }
      }
  };

  // Restore session on mount
  useEffect(() => {
      const activeUser = localStorage.getItem('trishna_active_user');
      if (activeUser && !isAuthenticated) {
          handleLogin(activeUser);
      }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isProfileSetup) return;

    const generateNotifications = () => {
        const today = new Date().toLocaleDateString();
        const existingIds = new Set(notifications.map(n => n.id));
        const newNotifs: AppNotification[] = [];

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

        userProfile.crops.forEach(crop => {
            const cropHash = crop.split('').reduce((a,b) => a + b.charCodeAt(0), 0);
            const dayNum = new Date().getDate(); 
            
            if ((cropHash + dayNum) % 3 === 0) {
                 const id = `water-${crop}-${today}`;
                 if (!existingIds.has(id)) {
                    newNotifs.push({
                        id,
                        title: `Water ${crop}`,
                        message: `Check moisture levels for your ${crop}.`,
                        timestamp: Date.now(),
                        read: false,
                        type: 'water'
                    });
                 }
            }
        });

        if (newNotifs.length > 0) {
            const updated = [...newNotifs, ...notifications].slice(0, 50);
            setNotifications(updated);
            if (currentUserEmail) {
                localStorage.setItem(`trishna_notifications_${currentUserEmail}`, JSON.stringify(updated));
            }
        }
    };

    generateNotifications();
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

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setIsProfileSetup(true);
    localStorage.setItem('trishna_user_profile', JSON.stringify(newProfile));
    if (currentUserEmail) {
        localStorage.setItem(`trishna_data_${currentUserEmail}`, JSON.stringify(newProfile));
    }
    if (newProfile.location !== userProfile.location) {
      handleRefreshData(newProfile.location);
    }
  };

  const handleAddCrop = (cropName: string) => {
      const name = cropName.replace(/\s*\(Fallback\)\s*/i, '').trim();
      const exists = userProfile.crops.some(c => c.toLowerCase() === name.toLowerCase());
      if (!exists) {
         const updatedCrops = [...userProfile.crops, name];
         handleSaveProfile({ ...userProfile, crops: updatedCrops });
      }
  };

  const handleOnboardingComplete = (profile: UserProfile, lang: string) => {
    setUserProfile(profile);
    setLanguage(lang);
    setIsProfileSetup(true);
    localStorage.setItem('trishna_user_profile', JSON.stringify(profile));
    localStorage.setItem('trishna_language', lang);
    if (currentUserEmail) {
        localStorage.setItem(`trishna_data_${currentUserEmail}`, JSON.stringify(profile));
    }
    // CRITICAL: Notify admin with the full completed profile details
    notifyLogin(currentUserEmail, profile);
    handleRefreshData(profile.location);
  };

  const handleLanguageChange = (langName: string) => {
    setLanguage(langName);
    localStorage.setItem('trishna_language', langName);
    setShowLangMenu(false);
  };

  const handleLogout = () => {
    if (currentUserEmail) {
      notifyLogout(currentUserEmail, userProfile.name);
    }
    localStorage.removeItem('trishna_active_user'); // Clear session
    setIsAuthenticated(false);
    setShowLanding(true);
    setCurrentSection(AppSection.HOME);
    setCurrentUserEmail('');
    setIsProfileSetup(false);
  };

  useEffect(() => {
    if (isAuthenticated && isProfileSetup && userProfile.location) {
      handleRefreshData(userProfile.location);
    }
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
             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
             const data = await res.json();
             if (data && data.address) {
                 const city = data.address.city || data.address.town || data.address.village || '';
                 const state = data.address.state || '';
                 if (city || state) formattedLocation = `${city}${city && state ? ', ' : ''}${state} (${coords})`;
             }
          } catch (e) {}
          handleSaveProfile({ ...userProfile, location: formattedLocation });
          setIsLocating(false);
        },
        () => setIsLocating(false)
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSectionChange = (section: AppSection) => {
    setCurrentSection(section);
    if (section !== AppSection.DOCTOR) setPlantDoctorMode('general');
  };

  const renderSection = () => {
    switch (currentSection) {
      case AppSection.HOME:
        return (
          <div className="space-y-6 pb-20 animate-fade-in">
             <div className="flex justify-between items-center px-1">
               <div>
                 <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My {userProfile.role === 'Farmer' ? 'Farm' : 'Garden'}</h1>
                 <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">{new Date().toLocaleDateString()}</p>
               </div>
             </div>
             <WeatherWidget weather={weather} loading={loadingWeather} language={language} />
             <MarketWidget rates={marketRates} loading={loadingMarket} onRefresh={() => handleRefreshMarket(userProfile.location)} location={userProfile.location} />
             <div className="grid grid-cols-3 gap-3">
               <div onClick={() => { setPlantDoctorMode('general'); setCurrentSection(AppSection.CROPS); }} className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-white/50 cursor-pointer shadow-sm hover:shadow-md transition-all">
                 <span className="text-2xl mb-2 block">🌱</span>
                 <h3 className="font-semibold text-green-800 dark:text-green-400 text-sm">New Crop?</h3>
                 <p className="text-[10px] text-green-600 mt-1">Get Plan</p>
               </div>
               
               <div onClick={() => { setPlantDoctorMode('soil'); setCurrentSection(AppSection.DOCTOR); }} className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-white/50 cursor-pointer shadow-sm hover:shadow-md transition-all">
                 <span className="text-2xl mb-2 block">⛰️</span>
                 <h3 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Check Soil</h3>
                 <p className="text-[10px] text-amber-600 mt-1">Analysis</p>
               </div>

               <div onClick={() => { setPlantDoctorMode('general'); setCurrentSection(AppSection.DOCTOR); }} className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-white/50 cursor-pointer shadow-sm hover:shadow-md transition-all">
                 <span className="text-2xl mb-2 block">🩺</span>
                 <h3 className="font-semibold text-blue-800 dark:text-blue-400 text-sm">Crop Issues?</h3>
                 <p className="text-[10px] text-blue-600 mt-1">Ask Doctor</p>
               </div>
             </div>
          </div>
        );
      case AppSection.CROPS:
        return <CropForm location={userProfile.location} language={language} userProfile={userProfile} onScanFertilizer={() => { setPlantDoctorMode('label'); setCurrentSection(AppSection.DOCTOR); }} onAddCrop={handleAddCrop} />;
      case AppSection.DOCTOR:
        return <PlantDoctorChat language={language} userProfile={userProfile} initialMode={plantDoctorMode} />;
      case AppSection.LEARN:
        return <LearnSection language={language} />;
      case AppSection.SETTINGS:
        return <SettingsSection userProfile={userProfile} onSaveProfile={handleSaveProfile} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onOpenLanguage={() => setShowLangMenu(true)} onOpenFeedback={() => setShowFeedback(true)} onOpenAbout={() => setShowAbout(true)} />;
      default:
        return <div>Section not found</div>;
    }
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (showLanding && !isAuthenticated) return <LandingPage onGetStarted={() => setShowLanding(false)} onSignIn={() => setShowLanding(false)} />;
  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;
  if (showPermissions) return <PermissionModal onComplete={handlePermissionsComplete} />;
  if (!isProfileSetup) return <div className="min-h-screen"><Onboarding onComplete={handleOnboardingComplete} initialName={localStorage.getItem('trishna_temp_name') || ""} /></div>;

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* API Key Warning Banner */}
      {apiKeyError && (
        <div className="bg-red-600 text-white px-4 py-3 text-center text-sm font-bold flex items-center justify-center gap-2 fixed top-0 left-0 right-0 z-[100] shadow-md animate-pulse">
          <AlertTriangle className="w-5 h-5" />
          <span>API Key Missing/Invalid. Please update your .env file and restart the server.</span>
        </div>
      )}

      <header className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-sm border-b border-gray-100/50 ${apiKeyError ? 'mt-12' : ''}`}>
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 flex-1 min-w-0">
             <button onClick={getUserLocation} className={`p-2 rounded-full hover:bg-gray-100 ${isLocating ? 'text-green-500 animate-bounce' : 'text-gray-500'}`}><MapPin className="h-5 w-5" /></button>
             <div className="flex flex-col cursor-pointer px-2 py-0.5 rounded transition-colors flex-1 min-w-0" onClick={() => setCurrentSection(AppSection.SETTINGS)}>
                  <span className="text-xs text-gray-400 font-medium uppercase">Location</span>
                  <div className="text-sm font-semibold truncate text-gray-800 dark:text-white">{userProfile.location || 'Select Location'}</div>
               </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-gray-100 relative">
               <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
               {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
             </button>
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100">{isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}</button>
          </div>
        </div>
      </header>
      {showNotifications && <NotificationPanel notifications={notifications} onClose={() => setShowNotifications(false)} onMarkAsRead={handleMarkAsRead} onClearAll={handleClearNotifications} />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} userEmail={currentUserEmail} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showLangMenu && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center"><h3 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-green-600" />Select Language</h3><button onClick={() => setShowLangMenu(false)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button></div>
            <div className="p-2 overflow-y-auto max-h-[60vh] grid grid-cols-1 gap-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button key={lang.code} onClick={() => handleLanguageChange(lang.name)} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${language === lang.name ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}><div className="flex flex-col items-start"><span className="font-medium text-sm">{lang.native}</span><span className="text-xs opacity-60">{lang.name}</span></div>{language === lang.name && <Check className="w-5 h-5 text-green-600" />}</button>
                ))}
            </div>
          </div>
        </div>
      )}
      <main className="max-w-md mx-auto p-4 min-h-[calc(100vh-140px)]">{renderSection()}</main>
      <Navigation currentSection={currentSection} onSectionChange={handleSectionChange} />
    </div>
  );
};

export default App;
