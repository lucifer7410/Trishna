
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, Camera, X, Mic, StopCircle, User, Leaf, ExternalLink, Mountain, ScanLine, Trash2, History, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { diagnosePlantOrSoil } from '../services/gemini';
import { ChatMessage, UserProfile } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface PlantDoctorChatProps {
  language: string;
  userProfile: UserProfile;
  initialMode?: 'general' | 'soil' | 'label';
}

const PlantDoctorChat: React.FC<PlantDoctorChatProps> = ({ language, userProfile, initialMode }) => {
  
  const storageKey = `trishna_chat_history_${userProfile.name?.replace(/\s+/g, '_') || 'guest'}`;

  const getInitialMessageText = (mode?: string) => {
      if (mode === 'label') {
          return `Hello ${userProfile.name}! Please **upload a photo of your fertilizer or pesticide packet** 📸. I'll help you understand the dosage, safety precautions, and how to use it sustainably.`;
      }
      if (mode === 'soil') {
          return `Hello ${userProfile.name}! Ready to check your soil health? Please **upload a clear photo of your soil** ⛰️, and I'll analyze its texture and suggest improvements.`;
      }
      return `Hello ${userProfile.name}! I am Trish, your Plant Doctor. 🌿\n\nUpload a photo of your **${userProfile.role === 'Farmer' ? 'crop' : 'plant'}**, **soil**, or even a **fertilizer packet**, and I will help you with diagnosis or dosage instructions.`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [{
      id: 'welcome',
      role: 'model',
      text: getInitialMessageText(initialMode),
    }];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Modes for specific analysis hints
  const [analysisMode, setAnalysisMode] = useState<'general' | 'soil' | 'label'>(initialMode || 'general');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist messages
  useEffect(() => {
    try {
        // Limit to last 50 messages to prevent localStorage quota issues
        const historyToSave = messages.slice(-50);
        localStorage.setItem(storageKey, JSON.stringify(historyToSave));
    } catch (e) {
        console.error("Failed to save chat history", e);
    }
  }, [messages, storageKey]);

  // Update mode and add a fresh welcome message if mode changes programmatically (e.g. from CropForm)
  useEffect(() => {
    if (initialMode) {
        setAnalysisMode(initialMode);
        
        const newMessageText = getInitialMessageText(initialMode);
        const lastMsg = messages[messages.length - 1];
        
        // Only add welcome message if the last message isn't already the same welcome message
        if (lastMsg.text !== newMessageText) {
             setMessages(prev => [...prev, {
                 id: Date.now().toString(),
                 role: 'model',
                 text: newMessageText
             }]);
        }
    }
  }, [initialMode]);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
        localStorage.removeItem(storageKey);
        setMessages([{
            id: Date.now().toString(),
            role: 'model',
            text: getInitialMessageText(analysisMode),
        }]);
    }
  };

  const startNewChat = () => {
    // Check if there is actual conversation history to lose
    const hasHistory = messages.length > 1 || messages.some(m => m.role === 'user');

    if (hasHistory) {
        if (!window.confirm("Start a new conversation? This will clear the current chat.")) {
            return;
        }
    }

    // Reset all state
    localStorage.removeItem(storageKey);
    setAnalysisMode('general');
    setSelectedImage(null);
    setInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Reset to fresh welcome message
    setMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: getInitialMessageText('general'), // Always reset to general
    }]);
  };

  const { isListening, startListening, stopListening, hasSupport } = useSpeechRecognition((text) => {
    setInput(prev => {
        const prefix = prev && !prev.endsWith(' ') ? ' ' : '';
        return prev + prefix + text;
    });
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysisMode('general');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    if (isListening) stopListening();

    // Default text if user sends only image
    let displayText = input;
    if (!displayText) {
        if (analysisMode === 'soil') displayText = "Analyze this soil sample";
        else if (analysisMode === 'label') displayText = "Read this fertilizer/pesticide label";
        else displayText = "Analyze this image";
    }
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: displayText,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = selectedImage;
    const currentMode = analysisMode;
    
    // Reset selection
    setSelectedImage(null);
    setAnalysisMode('general');
    setLoading(true);

    try {
      const base64Image = imageToSend ? imageToSend.split(',')[1] : '';
      
      // Construct a context-rich query for the AI based on the button clicked
      let queryForAI = userMsg.text;
      if (imageToSend) {
        if (currentMode === 'soil') {
            queryForAI = `[Soil Analysis Request] The user has uploaded an image of their soil. Please analyze the visible properties and suggest suitability for ${userProfile.role}. User Query: ${input}`;
        } else if (currentMode === 'label') {
            queryForAI = `[Label Reading Request] The user has uploaded an image of a fertilizer or pesticide packet. Please extract dosage, safety instructions, and waiting periods. User Query: ${input}`;
        }
      }

      const response = await diagnosePlantOrSoil(base64Image, queryForAI, language, userProfile);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        groundingUrls: response.groundingUrls
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      
      let friendlyMessage = "I apologize, but I'm encountering a temporary issue processing your request. Please try again in a moment.";
      
      if (error.message) {
         if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('offline')) {
             friendlyMessage = "It seems you are offline or have a weak connection. Please check your internet and try again.";
         } else if (error.message.includes('503') || error.message.includes('429')) {
             friendlyMessage = "My servers are currently very busy. Please wait a minute and try asking again.";
         }
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: friendlyMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors backdrop-blur-sm">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-20 relative">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
             <Leaf className="w-4 h-4" />
           </div>
           <span className="font-semibold text-gray-800 dark:text-gray-100">Plant Doctor</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
            <button 
               onClick={startNewChat}
               className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
               title="New Conversation"
            >
               <Plus className="w-5 h-5 group-active:scale-90 transition-transform" />
            </button>

            {/* History Menu */}
            <div className="relative">
                <button 
                   onClick={() => setShowHistory(!showHistory)}
                   className={`p-2 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium ${
                       showHistory 
                       ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                       : 'text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                   }`}
                   title="History"
                >
                   <History className="w-4 h-4" />
                </button>

                {showHistory && (
                    <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowHistory(false)} 
                    />
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-scale-in origin-top-right">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <History className="w-3 h-3" /> Recent Queries
                            </span>
                            <button 
                                onClick={() => { clearHistory(); setShowHistory(false); }}
                                className="text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors font-medium flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" /> Clear All
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                             {messages.filter(m => m.role === 'user').length > 0 ? (
                                 [...messages].reverse().filter(m => m.role === 'user').map((msg) => (
                                     <button 
                                         key={msg.id} 
                                         className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group border-b border-gray-50 dark:border-gray-800 last:border-0"
                                         onClick={() => setShowHistory(false)}
                                     >
                                         <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 font-medium group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                                             {msg.text || (msg.image ? 'Image Analysis' : 'Query')}
                                         </p>
                                         <div className="flex items-center gap-2 mt-1.5">
                                             <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                 {new Date(parseInt(msg.id) || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                             </span>
                                             {msg.image && <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Image</span>}
                                         </div>
                                     </button>
                                 ))
                             ) : (
                                 <div className="p-8 text-center flex flex-col items-center gap-2 text-gray-400">
                                     <History className="w-8 h-8 opacity-20" />
                                     <p className="text-xs">No conversation history yet</p>
                                 </div>
                             )}
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center shadow-sm border mt-1 ${
                  msg.role === 'user' 
                    ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900 dark:border-green-800 dark:text-green-300' 
                    : 'bg-white border-gray-100 text-emerald-600 dark:bg-gray-800 dark:border-gray-700 dark:text-emerald-400'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Leaf size={16} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col rounded-2xl p-4 text-[15px] leading-relaxed relative transition-all ${
                    msg.role === 'user'
                      ? 'bg-green-600 dark:bg-green-700 text-white rounded-tr-none shadow-md' 
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.image && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                      <img 
                        src={msg.image} 
                        alt="User upload" 
                        className="w-full h-auto max-h-60 object-cover" 
                      />
                    </div>
                  )}
                  
                  <div className={`prose prose-sm max-w-none break-words ${
                      msg.role === 'user' 
                      ? 'prose-invert text-white prose-p:text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white marker:text-white/80' 
                      : 'dark:prose-invert text-gray-800 dark:text-gray-100 prose-headings:font-bold prose-h3:text-green-700 dark:prose-h3:text-green-400 prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white'
                  }`}>
                    <ReactMarkdown 
                        components={{
                            ul: ({node, ...props}) => <ul className="my-2 space-y-1 list-disc pl-4" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                        }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                  </div>

                  {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                    <div className={`mt-3 pt-3 border-t flex flex-col gap-2 ${
                        msg.role === 'user' ? 'border-white/20' : 'border-gray-100 dark:border-gray-700'
                    }`}>
                      <p className="text-xs font-semibold opacity-70 uppercase tracking-wider flex items-center gap-1">
                        Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingUrls.map((url, idx) => (
                          <a 
                            key={idx} 
                            href={url.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 max-w-full group ${
                                msg.role === 'user'
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600'
                            }`}
                          >
                            <ExternalLink size={10} className="opacity-70 group-hover:opacity-100" />
                            <span className="truncate max-w-[200px]">{url.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start w-full animate-fade-in">
            <div className="flex max-w-[90%] md:max-w-[80%] gap-3 flex-row">
                 <div className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center bg-white border border-gray-100 text-emerald-600 dark:bg-gray-800 dark:border-gray-700 dark:text-emerald-400 shadow-sm mt-1">
                   <Leaf size={16} className="animate-pulse" />
                 </div>
                 <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-3 shadow-sm">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Analyzing...</span>
                 </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 transition-colors">
        {selectedImage && (
          <div className="flex items-center gap-3 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 animate-fade-in-up shadow-sm">
             <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                <img src={selectedImage} alt="Selected" className="h-full w-full object-cover" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                 {analysisMode === 'soil' ? "Soil Sample" : analysisMode === 'label' ? "Packet Label" : "Image selected"}
               </p>
               <p className="text-[10px] text-gray-500 dark:text-gray-400">Ready to analyze</p>
             </div>
             <button onClick={clearImage} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
               <X className="h-3.5 w-3.5" />
             </button>
          </div>
        )}
        
        <div className="flex gap-2 items-end">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          
          <div className="flex gap-1.5">
            <button
              onClick={() => { setAnalysisMode('general'); fileInputRef.current?.click(); }}
              className="p-2.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-800 rounded-xl transition-colors"
              title="Upload Plant Photo"
            >
              <Camera className="h-5 w-5" />
            </button>

             <button
              onClick={() => { setAnalysisMode('soil'); fileInputRef.current?.click(); }}
              className={`p-2.5 rounded-xl transition-colors border ${
                analysisMode === 'soil' && selectedImage
                 ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-inner'
                 : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-100 dark:border-amber-800'
              }`}
              title="Analyze Soil"
            >
              <Mountain className="h-5 w-5" />
            </button>

             <button
              onClick={() => { setAnalysisMode('label'); fileInputRef.current?.click(); }}
              className={`p-2.5 rounded-xl transition-colors border ${
                analysisMode === 'label' && selectedImage
                 ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-inner'
                 : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-100 dark:border-blue-800'
              }`}
              title="Read Fertilizer Label"
            >
              <ScanLine className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 relative bg-gray-50 dark:bg-gray-700/50 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-green-500/20 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:shadow-sm border border-gray-200 dark:border-gray-600 focus-within:border-green-500">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask Trish..."}
              className="w-full bg-transparent border-0 rounded-2xl pl-3 pr-9 py-3 focus:ring-0 text-sm resize-none max-h-24 scrollbar-hide text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed"
              rows={1}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            
            {hasSupport && (
              <button
                onClick={handleMicClick}
                className={`absolute right-1.5 bottom-1.5 p-1.5 rounded-lg transition-colors ${
                  isListening 
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' 
                    : 'text-gray-400 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isListening ? "Stop Listening" : "Voice Input"}
              >
                {isListening ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
          </div>
          
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || loading}
            className="p-3 bg-gradient-to-tr from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex-shrink-0 disabled:shadow-none"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantDoctorChat;
