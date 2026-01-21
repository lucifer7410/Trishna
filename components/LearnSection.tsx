import React, { useState, useEffect } from 'react';
import { Search, PlayCircle, ExternalLink, Loader2, Mic, History, Trash2 } from 'lucide-react';
import { VideoResult } from '../types';
import { findEducationalVideos } from '../services/gemini';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface LearnSectionProps {
  language: string;
}

const LearnSection: React.FC<LearnSectionProps> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');
  const [watchHistory, setWatchHistory] = useState<VideoResult[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('trishna_video_history');
    if (saved) {
      try {
        setWatchHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse video history");
      }
    }
  }, []);

  const addToHistory = (video: VideoResult) => {
    // Remove if exists, then add to front
    const newHistory = [video, ...watchHistory.filter(v => v.url !== video.url)].slice(0, 20);
    setWatchHistory(newHistory);
    localStorage.setItem('trishna_video_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setWatchHistory([]);
    localStorage.removeItem('trishna_video_history');
  };

  const { isListening, startListening, hasSupport } = useSpeechRecognition((text) => {
    setQuery(text);
    if (activeTab === 'history') setActiveTab('search');
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setActiveTab('search');
    try {
      const results = await findEducationalVideos(query, language);
      setVideos(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const suggestedTopics = [
    "Drip irrigation installation",
    "Organic fertilizer making",
    "Pest control for tomato",
    "Soil testing procedure"
  ];

  const renderVideoList = (videoList: VideoResult[], emptyMessage: string) => {
    if (videoList.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400 text-sm flex flex-col items-center">
                <p>{emptyMessage}</p>
            </div>
        );
    }
    return (
        <div className="grid gap-4">
        {videoList.map((video, idx) => (
          <a
            key={idx}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => addToHistory(video)}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-start hover:shadow-md transition-shadow group"
          >
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
              <PlayCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight mb-1">
                {video.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{video.channel || 'YouTube'}</p>
              <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                Watch Now <ExternalLink className="h-3 w-3 ml-1" />
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Video Library</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Find farming guides in {language}</p>
            </div>
             <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('search')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                        activeTab === 'search' 
                        ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-300 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    <Search className="w-3.5 h-3.5" /> Search
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                        activeTab === 'history' 
                        ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-300 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    <History className="w-3.5 h-3.5" /> History
                </button>
            </div>
        </div>
        
        {activeTab === 'search' && (
            <>
                <form onSubmit={handleSearch} className="relative mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Search e.g., Growing cotton..."}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl pl-11 pr-20 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                
                <div className="absolute right-2 top-2 flex items-center gap-1">
                    {hasSupport && (
                    <button
                        type="button"
                        onClick={() => startListening(language)}
                        className={`p-1.5 rounded-lg transition-colors ${
                        isListening 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse' 
                            : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        title="Speak"
                    >
                        <Mic className="h-4 w-4" />
                    </button>
                    )}
                    <button 
                    type="submit"
                    className="bg-green-600 text-white p-1.5 rounded-lg hover:bg-green-700 transition-colors"
                    >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </button>
                </div>
                </form>

                <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((topic, idx) => (
                    <button
                    key={idx}
                    onClick={() => { setQuery(topic); handleSearch({ preventDefault: () => {} } as any); }}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                    {topic}
                    </button>
                ))}
                </div>
            </>
        )}
        
        {activeTab === 'history' && (
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recently Watched</h3>
                {watchHistory.length > 0 && (
                    <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>
        )}
      </div>

      {activeTab === 'search' ? (
        loading ? (
            <div className="text-center py-10 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
                <p className="text-sm">Searching for videos...</p>
            </div>
        ) : (
            renderVideoList(videos, query ? "No videos found. Try a different search." : "Search to find videos.")
        )
      ) : (
        renderVideoList(watchHistory, "You haven't watched any videos yet.")
      )}
    </div>
  );
};

export default LearnSection;