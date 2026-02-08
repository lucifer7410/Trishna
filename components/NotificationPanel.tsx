
import React from 'react';
import { Bell, Droplets, Sprout, AlertTriangle, Check, Trash2, X, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onMarkAsRead, onClearAll }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'water': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'fertilizer': return <Sprout className="w-5 h-5 text-amber-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-white dark:bg-gray-800 opacity-60';
    switch (type) {
      case 'water': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30';
      case 'fertilizer': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30';
      case 'alert': return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30';
      default: return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700';
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
      if (a.read === b.read) return b.timestamp - a.timestamp;
      return a.read ? 1 : -1;
  });

  return (
    <div className="fixed inset-0 z-[65] flex items-start justify-end p-4 sm:p-6 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-fade-in-up flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-800 relative z-10 mt-12">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="relative">
                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                {notifications.some(n => !n.read) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                )}
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white">Care Schedule</h3>
          </div>
          <div className="flex items-center gap-1">
             {notifications.length > 0 && (
                <button 
                    onClick={onClearAll}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Clear All"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
             )}
             <button 
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
             >
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-2 space-y-2 flex-1 scrollbar-hide">
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((note) => (
              <div 
                key={note.id} 
                className={`p-4 rounded-xl border transition-all relative group ${getBgColor(note.type, note.read)} ${!note.read ? 'shadow-sm' : ''}`}
                onClick={() => !note.read && onMarkAsRead(note.id)}
              >
                <div className="flex gap-3">
                   <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 bg-white/60 dark:bg-black/20 ${note.read ? 'grayscale opacity-50' : ''}`}>
                      {getIcon(note.type)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-bold ${note.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                             {note.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                             {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${note.read ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                          {note.message}
                      </p>
                   </div>
                </div>
                
                {!note.read && (
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-1 rounded-full shadow-sm">
                             <Check className="w-4 h-4" />
                         </div>
                    </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <Bell className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs opacity-60 mt-1">No pending tasks for today.</p>
            </div>
          )}
        </div>
        
        {/* Footer Hint */}
        {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-[10px] text-gray-400">
                    Tasks are scheduled based on your crops & local weather.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
