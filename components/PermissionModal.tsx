
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
        console.log("Location permission skipped or denied");
      }
    }

    // 2. Request Media (Camera & Mic) - Request separately for better hardware handling
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            // Try Camera
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoStream.getTracks().forEach(track => track.stop());
            } catch (videoError) {
                console.log("Camera permission skipped or unavailable");
            }

            // Try Microphone
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioStream.getTracks().forEach(track => track.stop());
            } catch (audioError) {
                console.log("Microphone permission skipped or unavailable");
            }
        } catch (e) {
            console.log("Media permissions check completed with errors");
        }
    }

    setIsRequesting(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] text-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden border border-white/10 animate-scale-in relative">
        
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-green-500 rounded-b-full shadow-[0_0_20px_rgba(34,197,94,0.6)]"></div>

        <div className="p-8 text-center">
          {/* Header Icon Cluster */}
          <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-full flex items-center justify-center shadow-lg">
                <div className="grid grid-cols-2 gap-1 p-1">
                    <MapPin className="w-5 h-5 text-green-400" />
                    <Camera className="w-5 h-5 text-green-400" />
                    <div className="col-span-2 flex justify-center">
                        <Mic className="w-5 h-5 text-green-400" />
                    </div>
                </div>
              </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Enable Permissions</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 px-2">
            To help you grow better, Trishna needs access to your:
          </p>

          {/* Permissions List */}
          <div className="space-y-4 text-left mb-8">
            <div className="flex items-center gap-4 group">
                <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200 text-sm">Location</h4>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">For local weather & crop alerts</p>
                </div>
            </div>
            <div className="flex items-center gap-4 group">
                <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
                    <Camera className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200 text-sm">Camera</h4>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">To diagnose plant diseases</p>
                </div>
            </div>
            <div className="flex items-center gap-4 group">
                <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <Mic className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200 text-sm">Microphone</h4>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">For voice commands</p>
                </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAllow}
            disabled={isRequesting}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 group border border-green-500/20"
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
            className="mt-6 text-xs text-gray-500 hover:text-gray-300 font-medium transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
