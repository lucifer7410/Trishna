
import React, { useState } from 'react';
import { Camera, Mic, MapPin, Check, Shield } from 'lucide-react';

interface PermissionModalProps {
  onComplete: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ onComplete }) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllow = async () => {
    setIsRequesting(true);
    
    // 1. Request Geolocation
    if ('geolocation' in navigator) {
      try {
        await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
                () => resolve(),
                () => resolve(), // Resolve even on error to continue
                { timeout: 5000 }
            );
        });
      } catch (e) {
        console.warn("Location permission skipped or denied");
      }
    }

    // 2. Request Media (Camera & Mic)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Stop immediately - we just wanted the permission to be granted for future use
      stream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.warn("Media permissions skipped or denied");
    }

    setIsRequesting(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700 animate-scale-in relative">
        
        {/* Subtle decorative top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>

        <div className="p-8 text-center">
          <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="absolute inset-0 bg-green-500/20 dark:bg-green-500/10 rounded-full blur-xl"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center shadow-lg">
                <div className="grid grid-cols-2 gap-1.5 p-1">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <Camera className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="col-span-2 flex justify-center">
                        <Mic className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                 <Shield className="w-3 h-3" />
              </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Enable Permissions</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 px-2">
            To help you grow better, Trishna needs access to your:
          </p>

          <div className="space-y-4 text-left mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl shadow-sm">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Location</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">For local weather & crop alerts</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-2.5 rounded-xl shadow-sm">
                    <Camera className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Camera</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">To diagnose plant diseases</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl shadow-sm">
                    <Mic className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Microphone</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">For voice commands</p>
                </div>
            </div>
          </div>

          <button
            onClick={handleAllow}
            disabled={isRequesting}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            {isRequesting ? (
                <>Loading...</>
            ) : (
                <>
                    Allow Access <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
            )}
          </button>
          
          <button 
            onClick={onComplete}
            className="mt-5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
