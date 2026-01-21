import React, { useState } from 'react';
import { X, Send, AlertTriangle, Lightbulb, MessageSquare, Check, Star } from 'lucide-react';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [type, setType] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      console.log({ type, message, rating }); // In real app, send to backend
      setIsSubmitting(false);
      setIsSent(true);
      
      // Auto close after success
      setTimeout(onClose, 2000);
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
          <p className="text-gray-500 dark:text-gray-400">Your feedback helps us grow better.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Send Feedback
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Feedback Type */}
            <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">What kind of feedback?</label>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setType('general')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            type === 'general'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                        }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-xs font-bold">General</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('bug')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            type === 'bug'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                        }`}
                    >
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-xs font-bold">Report Bug</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('feature')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            type === 'feature'
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-300'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                        }`}
                    >
                        <Lightbulb className="w-5 h-5" />
                        <span className="text-xs font-bold">Feature</span>
                    </button>
                </div>
            </div>

            {/* Rating */}
            <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Rate your experience</label>
                <div className="flex gap-2 justify-center bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                            <Star 
                                className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Message */}
            <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Your Message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Tell us what you think or describe the issue..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none transition-all dark:text-white"
                />
            </div>
            
            <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Sending...' : (
                    <>
                        <Send className="w-5 h-5" /> Send Feedback
                    </>
                )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;