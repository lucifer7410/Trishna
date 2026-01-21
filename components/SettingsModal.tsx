import React from 'react';
import { X, LogOut, MessageSquare, Globe, Moon, Sun, ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onLogout: () => void;
  onOpenFeedback: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onOpenLanguage: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, 
  onLogout, 
  onOpenFeedback, 
  onToggleTheme,
  isDarkMode,
  onOpenLanguage
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-scale-in">
        
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-2">
          {/* App Settings */}
          <div className="p-3">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">App</h4>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden">
                <button onClick={onOpenLanguage} className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">Language</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button onClick={onToggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">Appearance</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                        {isDarkMode ? 'Dark' : 'Light'}
                    </div>
                </button>

                <button onClick={() => { onOpenFeedback(); onClose(); }} className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">Send Feedback</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-3 pt-0">
             <button 
                onClick={onLogout} 
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-100 dark:border-red-900/30"
             >
                <LogOut className="w-5 h-5" />
                Sign Out
             </button>
             <p className="text-center text-[10px] text-gray-400 mt-3">
                 Version 1.0.2 • Trishna
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;