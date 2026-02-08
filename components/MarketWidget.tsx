import React from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { MarketRate } from '../types';

interface MarketWidgetProps {
  rates: MarketRate[];
  loading: boolean;
  onRefresh: () => void;
  location: string;
}

const MarketWidget: React.FC<MarketWidgetProps> = ({ rates, loading, onRefresh, location }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
      case 'down': return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
      default: return <Minus className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            📊 Market Trends
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Live prices near {location.split(',')[0]}</p>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={loading}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${loading ? 'animate-spin text-green-600' : 'text-gray-400'}`}
          title="Refresh prices"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-hide">
        {loading && rates.length === 0 ? (
           // Skeletons
           Array.from({length: 4}).map((_, i) => (
             <div key={i} className="h-24 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-pulse border border-gray-100 dark:border-gray-700"></div>
           ))
        ) : (
           rates.map((rate, idx) => (
             <div key={idx} className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20 flex flex-col justify-between transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-700 hover:shadow-md group">
               <span className="font-semibold text-sm text-gray-700 dark:text-gray-200 truncate">{rate.commodity}</span>
               
               <div className="mt-2">
                 <div className="flex items-baseline gap-1">
                     <div className="text-lg font-bold text-gray-900 dark:text-white">{rate.price}</div>
                     <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium opacity-80">/{rate.unit}</div>
                 </div>
                 
                 <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${
                    rate.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                    rate.trend === 'down' ? 'text-red-500 dark:text-red-400' : 'text-gray-400'
                 }`}>
                    {getTrendIcon(rate.trend)}
                    <span>
                        {rate.trend === 'up' ? 'Rising' : rate.trend === 'down' ? 'Down' : 'Stable'}
                    </span>
                 </div>
               </div>
             </div>
           ))
        )}
      </div>
      
      {rates.length === 0 && !loading && (
          <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              No market data available right now.
              <button onClick={onRefresh} className="block mx-auto mt-2 text-green-600 font-semibold hover:underline">Try Refreshing</button>
          </div>
      )}
    </div>
  );
};

export default MarketWidget;