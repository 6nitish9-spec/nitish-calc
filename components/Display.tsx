import React, { useEffect, useRef } from 'react';

interface DisplayProps {
  expression: string;
  result: string;
  previewResult: string;
  isAiProcessing?: boolean;
}

export const Display: React.FC<DisplayProps> = ({ expression, result, previewResult, isAiProcessing }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to end of expression when it changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [expression]);

  return (
    <div className="w-full bg-gray-900/50 rounded-3xl p-6 mb-4 flex flex-col items-end justify-end h-40 md:h-48 border border-gray-800 shadow-inner relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className={`absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl transition-opacity duration-700 ${isAiProcessing ? 'opacity-100 animate-pulse' : 'opacity-30'}`} />
      
      {/* Expression (Input) */}
      <div 
        ref={scrollRef}
        className="w-full text-right overflow-x-auto no-scrollbar whitespace-nowrap z-10 text-gray-400 text-xl font-mono mb-2 transition-all"
      >
        {expression || '0'}
      </div>

      {/* Main Result */}
      <div className={`w-full text-right z-10 font-bold transition-all duration-300 break-all leading-none ${result.length > 12 ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl'} ${isAiProcessing ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 animate-pulse' : 'text-white'}`}>
        {isAiProcessing ? 'Thinking...' : (result || previewResult || '0')}
      </div>

      {/* Preview Result (shown when expression is valid but not entered yet) */}
      {!result && previewResult && !isAiProcessing && (
        <div className="absolute bottom-2 left-4 text-gray-600 text-sm font-mono">
          = {previewResult}
        </div>
      )}
    </div>
  );
};
