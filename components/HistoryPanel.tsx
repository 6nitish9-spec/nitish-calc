import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, Sparkles } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-gray-900/90 backdrop-blur-md rounded-3xl border border-gray-800 overflow-hidden animate-fade-in-right">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300">
          <Clock size={18} />
          <span className="font-medium">History</span>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-full hover:bg-gray-800"
            title="Clear History"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 no-scrollbar space-y-2">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
            <span className="text-sm">No calculations yet</span>
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-right p-3 rounded-xl hover:bg-gray-800/80 transition-all group border border-transparent hover:border-gray-700 flex flex-col gap-1"
            >
              <div className="text-gray-400 text-sm font-mono break-all flex items-center justify-end gap-2">
                {item.type === 'ai' && <Sparkles size={12} className="text-indigo-400" />}
                {item.expression}
              </div>
              <div className="text-xl font-medium text-white break-all">{item.result}</div>
              {item.explanation && (
                 <div className="text-xs text-indigo-300/80 text-left w-full mt-1 pl-2 border-l-2 border-indigo-500/30">
                   {item.explanation}
                 </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
