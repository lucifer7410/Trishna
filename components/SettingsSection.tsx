import React, { useState } from 'react';
import { User, Globe, Moon, Sun, MessageSquare, LogOut, ChevronRight, ArrowLeft, Settings, Tractor, Flower } from 'lucide-react';
import { UserProfile } from '../types';
import ProfileSection from './ProfileSection';

interface SettingsSectionProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenLanguage: () => void;
  onOpenFeedback: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  userProfile,
  onSaveProfile,
  onLogout,
  isDarkMode,
  onToggleTheme,
  onOpenLanguage,
  onOpenFeedback
}) => {
  const [view, setView] = useState<'menu' | 'profile'>('menu');

  if (view === 'profile') {
    return (
      <div className="animate-fade-in space-y-4">
        <button 
          onClick={() => setView('menu')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium px-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Settings
        </button>
        <ProfileSection 
          profile={userProfile} 
          onSave={(p) => { onSaveProfile(p); setView('menu'); }}
          onLogout={onLogout}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-3 px-1 mb-2">
         <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
             <Settings className="w-6 h-6" />
         </div>
         <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
      </div>

      {/* Profile Card */}
      <div 
        onClick={() => setView('profile')}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 dark:bg-green-900/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-500 pointer-events-none"></div>

        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm flex-shrink-0 relative z-10 flex items-center justify-center">
            {userProfile.profileImage ? (
                <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                userProfile.role === 'Farmer' ? 
                  <Tractor className="w-8 h-8 text-green-500 opacity-50" /> : 
                  <Flower className="w-8 h-8 text-rose-500 opacity-50" />
            )}
        </div>
        
        <div className="flex-1 min-w-0 relative z-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {userProfile.name || 'User'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
               {userProfile.role} • <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Edit Profile</span>
            </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-full text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors relative z-10">
            <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* App Settings List */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Added explicit Edit Profile option */}
        <button onClick={() => setView('profile')} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                    <User className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <span className="block font-semibold text-gray-800 dark:text-gray-200">Edit Profile</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Update personal details & crops</span>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={onOpenLanguage} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <span className="block font-semibold text-gray-800 dark:text-gray-200">Language</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Change app language</span>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={onToggleTheme} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="text-left">
                    <span className="block font-semibold text-gray-800 dark:text-gray-200">Appearance</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
            </div>
            <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative transition-colors ${isDarkMode ? '!bg-purple-600' : ''}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isDarkMode ? 'translate-x-5' : ''}`}></div>
            </div>
        </button>

        <button onClick={onOpenFeedback} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <span className="block font-semibold text-gray-800 dark:text-gray-200">Feedback</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Report bugs or suggest features</span>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Logout Button */}
      <button 
        onClick={onLogout} 
        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/20"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      <p className="text-center text-xs text-gray-400 pt-2">
         Trishna v1.0.3 • Made with 💚 for Farmers
      </p>
    </div>
  );
};

export default SettingsSection;